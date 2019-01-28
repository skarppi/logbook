import * as bodyParser from "body-parser";
import { Router } from "express";
import FlightRepository from "../model/flight";
import config = require("../config");
import * as multer from "multer";
import { parseFile, parseData } from "../parser";

export function flightsRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/", (req, res) => {
    FlightRepository.list()
      .then(flights => res.json(flights))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/:day", (req, res) => {
    const day = new Date(req.params.day);
    FlightRepository.listByDay(day)
      .then(flight => {
        res.json(flight);
      })
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/:day/:id", (req, res) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight => {
        res.json(flight);
      })
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.delete("/:day/:id", (req, res) => {
    const id = req.params.id;
    FlightRepository.delete(id)
      .then(_ => res.json({ status: "deleted" }))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.put("/:day/:id", (req, res) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight => {
        // preserve some fields
        const updating = Object.assign(flight, req.body, {
          id: flight.id,
          segments: flight.segments
        });

        return FlightRepository.save(updating).then(updated =>
          res.json(updated)
        );
      })
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.put("/:day/:id/reset", (req, res) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight =>
        parseData(
          flight.id,
          flight.segments.reduce(
            (res, segment) => [...res, ...segment.rows],
            []
          ),
          flight.notes
        )
      )
      .then(updated => res.json(updated[0]))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, config.CSV_FOLDER);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // + "-" + Date.now());
    }
  });

  const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Only csv files are allowed!"), false);
    }
    cb(null, true);
  };

  const upload = multer({ storage: storage, fileFilter: fileFilter });

  router.post("", upload.array("flight"), (req: any, res) => {
    Promise.all(req.files.map(file => parseFile(file.originalname)))
      .then(flights => res.json([].concat(...flights)))
      .catch(err => {
        console.log(err, err.stack);
        res.status(500).send(String(err));
      });
  });

  return router;
}

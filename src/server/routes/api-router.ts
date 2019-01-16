import * as bodyParser from "body-parser";
import { Router } from "express";
import Flight from "../model/flight";
import Dashboard from "../model/dashboard";
import config = require("../config");
import * as multer from "multer";
import { parseFile, parseData } from "../parser";
import { DashboardUnit } from "../../shared/dashboard";

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/api/dashboard", (req, res) => {
    const query = {
      unit: DashboardUnit[<string>req.query.unit],
      size: req.query.size
    };

    if (!query.unit) {
      return res
        .status(400)
        .send(
          `Query parameter "unit" must be one of [${Object.keys(
            DashboardUnit
          )}], was ${req.query.unit}`
        );
    }

    if (!query.size || query.size < 1) {
      return res
        .status(400)
        .send(
          `Query parameter "size" must be one or more, was ${req.query.size}`
        );
    }

    Dashboard.list(query)
      .then(flights => res.json(flights))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/api/flights", (req, res) => {
    Flight.list()
      .then(flights => res.json(flights))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/api/flights/:day", (req, res) => {
    const day = new Date(req.params.day);
    Flight.listByDay(day)
      .then(flight => {
        res.json(flight);
      })
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/api/flights/:day/:id", (req, res) => {
    const id = req.params.id;
    Flight.find(id)
      .then(flight => {
        res.json(flight);
      })
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.delete("/api/flights/:day/:id", (req, res) => {
    const id = req.params.id;
    Flight.delete(id)
      .then(_ => res.json({ status: "deleted" }))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.get("/api/flights/:day/:id/reset", (req, res) => {
    const id = req.params.id;
    Flight.find(id)
      .then(flight =>
        parseData(
          flight.id,
          flight.segments.reduce(
            (res, segment) => [...res, ...segment.rows],
            []
          )
        )
      )
      .then(updated => res.json(updated))
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

  router.post("/api/flights", upload.array("flight"), (req: any, res) => {
    console.log(req.files);

    Promise.all(req.files.map(file => parseFile(file.originalname)))
      .then(flights => res.json([].concat(...flights)))
      .catch(err => {
        console.log(err, err.stack);
        res.status(500).send(String(err));
      });
  });

  return router;
}

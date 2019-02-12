import { Router } from "express";
import FlightRepository from "../model/flight";
import { CSV_FOLDER } from "../config";
import * as multer from "multer";
import { parseFile, parseData } from "../parser";

export function flightsRouter() {
  const router = Router();

  router.get("/", (req, res, next) => {
    FlightRepository.list()
      .then(flights => res.json(flights))
      .catch(next);
  });

  router.get("/:day", (req, res, next) => {
    const day = new Date(req.params.day);
    FlightRepository.listByDay(day)
      .then(flight => res.json(flight))
      .catch(next);
  });

  router.get("/:day/:id", (req, res, next) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight => {
        if (flight) {
          res.json(flight);
        } else {
          res.sendStatus(404);
        }
      })
      .catch(next);
  });

  router.delete("/:day/:id", (req, res, next) => {
    const id = req.params.id;
    FlightRepository.delete(id)
      .then(_ => res.json({ id, status: "deleted" }))
      .catch(next);
  });

  router.put("/:day/:id", (req, res, next) => {
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
      .catch(next);
  });

  router.put("/:day/:id/reset", (req, res, next) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight =>
        parseData(
          flight.id,
          flight.segments.reduce(
            (res, segment) => [...res, ...segment.rows],
            []
          )
        )
      )
      .then(updated => res.json(updated[0]))
      .catch(next);
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, CSV_FOLDER);
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

  router.post("", upload.array("flight"), (req: any, res, next) => {
    Promise.all(req.files.map(file => parseFile(file.originalname)))
      .then(flights => {
        const flatten = []
          .concat(...flights)
          .sort((a, b) => (a.id > b.id ? -1 : 1));
        res.json(flatten);
      })
      .catch(next);
  });

  return router;
}

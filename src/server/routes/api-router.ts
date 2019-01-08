import * as bodyParser from "body-parser";
import { Router } from "express";
import Flight from "../model/flight";
import Dashboard from "../model/dashboard";
import config = require("../config");
import * as multer from "multer";
import Parser from "../parser";
import { DashboardUnit } from "../../shared/dashboard";

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/api/dashboard", (req, res) => {
    const unit = DashboardUnit[<string>req.query.unit];
    if (req.query.unit && !unit) {
      return res
        .status(400)
        .send(
          `Invalid value '${
            req.query.unit
          }' for query parameter unit. Must be one of [${Object.keys(
            DashboardUnit
          )}]`
        );
    }

    Dashboard.list(unit || DashboardUnit.month)
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

  router.get("/api/flights/:id", (req, res) => {
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

    Promise.all(req.files.map(file => Parser(file.originalname)))
      .then(flights => res.json([].concat(...flights)))
      .catch(err => {
        console.log(err, err.stack);
        res.status(500).send(String(err));
      });
  });

  return router;
}

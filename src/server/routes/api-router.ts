import * as bodyParser from "body-parser";
import { Router } from "express";
import Flight from "../model/flight";
import config = require("../config");
import * as multer from "multer";
import Parser from "../parser";

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

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

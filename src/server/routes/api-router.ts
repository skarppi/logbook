import * as bodyParser from "body-parser";
import { Router } from "express";
import { IFlight } from "../../shared/IFlight";
import parse from "../parser";
import Flight from "../model/flight";

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/api/flights", (req, res) => {
    Flight.list()
      .then(flights => res.json(flights))
      .catch(err => {
        console.log(err, err.stack);
        res.sendStatus(503);
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
        res.sendStatus(503);
      });
  });

  router.post("/api/flights", (req, res) => {
    res.send(`ok`);
  });

  return router;
}

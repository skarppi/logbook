import * as bodyParser from "body-parser";
import { Router } from "express";
import { IFlight } from "../../shared/IFlight";
import parse from "../parser";

const flights: IFlight[] = [];

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/api/flights", (req, res) => {
    parse("TWR-2018-12-21.csv").then(flights => res.json(flights));
  });

  router.get("/api/flights/:id", (req, res) => {
    const id = req.params.id;
    parse("TWR-2018-12-21.csv").then(flights => {
      const flight: IFlight = flights.find(flight => flight.id === id);
      res.json(flight);
    });
  });

  router.post("/api/flights", (req, res) => {
    res.send(`ok`);
  });

  return router;
}

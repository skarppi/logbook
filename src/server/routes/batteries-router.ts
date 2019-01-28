import * as bodyParser from "body-parser";
import { Router } from "express";
import BatteryCycleRepository from "../model/battery";
import BatteryRepository from "../model/battery";

export function batteriesRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/", (req, res) => {
    BatteryRepository.list()
      .then(batteries => res.json(batteries))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.post("/cycles", (req, res) => {
    BatteryCycleRepository.insert(req.body)
      .then(cycle => res.json(cycle))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.put("/cycles/:id", (req, res) => {
    const id = req.params.id;
    BatteryCycleRepository.update(id, req.body)
      .then(cycle => res.json(cycle))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  router.delete("/cycles/:id", (req, res) => {
    const id = req.params.id;
    BatteryCycleRepository.delete(id)
      .then(_ => res.json({ id, status: "deleted" }))
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  return router;
}

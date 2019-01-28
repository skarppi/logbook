import { Router } from "express";
import BatteryCycleRepository from "../model/battery";
import BatteryRepository from "../model/battery";

export function batteriesRouter() {
  const router = Router();

  router.get("/", (req, res, next) => {
    BatteryRepository.list()
      .then(batteries => res.json(batteries))
      .catch(next);
  });

  router.post("/cycles", (req, res, next) => {
    BatteryCycleRepository.insert(req.body)
      .then(cycle => res.json(cycle))
      .catch(next);
  });

  router.put("/cycles/:id", (req, res, next) => {
    const id = req.params.id;
    BatteryCycleRepository.update(id, req.body)
      .then(cycle => res.json(cycle))
      .catch(next);
  });

  router.delete("/cycles/:id", (req, res, next) => {
    const id = req.params.id;
    BatteryCycleRepository.delete(id)
      .then(_ => res.json({ id, status: "deleted" }))
      .catch(next);
  });

  return router;
}

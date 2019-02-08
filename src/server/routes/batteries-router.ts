import { Router } from "express";
import BatteryCycleRepository from "../model/batterycycle";
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

  router.get("/:id", (req, res, next) => {
    BatteryRepository.get(req.params.id)
      .then(batteries => res.json(batteries))
      .catch(next);
  });

  router.post("/", (req, res, next) => {
    BatteryRepository.insert(req.body)
      .then(battery => res.json(battery))
      .catch(next);
  });

  router.put("/:id", (req, res, next) => {
    const id = req.params.id;
    BatteryRepository.update(id, req.body)
      .then(battery => res.json(battery))
      .catch(next);
  });

  router.delete("/:id", (req, res, next) => {
    const id = req.params.id;
    BatteryRepository.delete(id)
      .then(_ => res.json({ id, status: "deleted" }))
      .catch(next);
  });

  return router;
}

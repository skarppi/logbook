import { Router } from "express";
import Location from "../model/location";
import { DashboardUnit } from "../../shared/dashboard";

export function locationsRouter() {
  const router = Router();

  router.get("/", (req, res, next) => {
    Location.list()
      .then(flights => res.json(flights))
      .catch(next);
  });

  return router;
}

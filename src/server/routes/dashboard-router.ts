import { Router } from "express";
import Dashboard from "../model/dashboard";
import { DashboardUnit } from "../../shared/dashboard";

export function dashboardRouter() {
  const router = Router();

  router.get("/", (req, res, next) => {
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
      .catch(next);
  });

  return router;
}

import * as bodyParser from "body-parser";
import { Router } from "express";
import Dashboard from "../model/dashboard";
import { DashboardUnit } from "../../shared/dashboard";

export function dashboardRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/", (req, res) => {
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
      .catch(err => {
        console.log(err, err.stack);
        return res.status(500).send(String(err));
      });
  });

  return router;
}

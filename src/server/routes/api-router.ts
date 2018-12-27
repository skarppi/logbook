import * as bodyParser from "body-parser";
import { Router } from "express";
import { IFlySession } from "../../shared/IFlySession";
import parse from "../parser";

const users: IFlySession[] = [];

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get("/api/users", (req, res) => {
    parse("TWR-2018-12-21.csv").then(flights => res.json(flights));
  });

  router.get("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    const user: IFlySession = users.find(u => true);
    res.json(user);
  });

  router.post("/api/set-user", (req, res) => {
    res.send(`ok`);
  });

  return router;
}

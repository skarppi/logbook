import * as path from "path";
import * as express from "express";
import { Router } from "express";

export function staticsRouter() {
  const router = Router();
  const clientPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "client",
    "dist"
  );

  // All the assets are in "assets" folder
  router.use("/assets", express.static(path.join(clientPath, "assets")));

  // Any route should render the web app html
  router.get("*", (req, res) =>
    res.sendFile(path.join(clientPath, "index.html"))
  );

  return router;
}

import * as express from "express";
import * as bodyParser from "body-parser";
import { batteriesRouter } from "./routes/batteries-router";
import { dashboardRouter } from "./routes/dashboard-router";
import { flightsRouter } from "./routes/flights-router";
import { locationsRouter } from "./routes/locations-router";
import { videosRouter } from "./routes/videos-router";
import { staticsRouter } from "./routes/statics-router";
import { staticsDevRouter } from "./routes/statics-dev-router";
import * as config from "./config";

const app = express();

app.use(bodyParser.json());

app.use("/api/batteries", batteriesRouter());
app.use("/api/dashboard", dashboardRouter());
app.use("/api/flights", flightsRouter());
app.use("/api/locations", locationsRouter());
app.use("/api/videos", videosRouter());

app.use(config.IS_PRODUCTION ? staticsRouter() : staticsDevRouter());

app.use(function(err, req, res, next) {
  console.log(err, err.stack);
  res.status(500).send(String(err));
});

app.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});

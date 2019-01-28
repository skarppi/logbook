import * as express from "express";
import { batteriesRouter } from "./routes/batteries-router";
import { flightsRouter } from "./routes/flights-router";
import { dashboardRouter } from "./routes/dashboard-router";
import { staticsRouter } from "./routes/statics-router";
import { staticsDevRouter } from "./routes/statics-dev-router";
import * as config from "./config";

const app = express();

app.use("/api/batteries", batteriesRouter());
app.use("/api/dashboard", dashboardRouter());
app.use("/api/flights", flightsRouter());

app.use(config.IS_PRODUCTION ? staticsRouter() : staticsDevRouter());

app.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});

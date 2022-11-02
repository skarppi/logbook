import * as express from "express";
import * as bodyParser from "body-parser";
import { flightsRouter } from "./routes/flights-router";
import { videosRouter } from "./routes/videos-router";
import { staticsRouter } from "./routes/statics-router";
import { staticsDevRouter } from "./routes/statics-dev-router";
import * as config from "./config";

const { postgraphile } = require("postgraphile");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const app = express();

app.use(bodyParser.json());

const publicPath = config.BASE_URL;

app.use(`${publicPath}/api/flights`, flightsRouter());
app.use(`${publicPath}/api/videos`, videosRouter());

app.use(
  `${publicPath}/api/`,
  postgraphile(`postgres://${config.DB_HOST}:5432/logbook`, {
    appendPlugins: [ConnectionFilterPlugin, PgSimplifyInflectorPlugin],
    exportGqlSchemaPath: "./schema.gql",
    watchPg: !config.IS_PRODUCTION,
    dynamicJson: true,
  })
);

app.use(
  publicPath,
  config.IS_PRODUCTION ? staticsRouter() : staticsDevRouter()
);

app.use(function (err, req, res, next) {
  console.log(err, err.stack);
  res.status(500).send(String(err));
});

app.listen(config.SERVER_PORT, () => {
  console.log(
    `App listening on port=${config.SERVER_PORT}, path=${config.BASE_URL} at ${config.PUBLIC_URL}!`
  );
});

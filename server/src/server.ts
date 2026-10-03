import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { flightsRouter } from "./routes/flights-router";
import { videosRouter } from "./routes/videos-router";
import { staticsRouter } from "./routes/statics-router";
import { batteriesRouter } from "./routes/batteries-router";
import * as config from "./config";

const { postgraphile } = require("postgraphile");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");

const app = express();

app.use(bodyParser.json());

const publicPath = config.BASE_URL || "";

app.use(`${publicPath}/api/flights`, flightsRouter());
app.use(`${publicPath}/api/videos`, videosRouter());
app.use(`${publicPath}/api/batteries`, batteriesRouter());

app.use(
  `${publicPath}/api/`,
  postgraphile(
    {
      host: config.DB_HOST,
      port: 5432,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      // Match db.ts: enable SSL when Postgres requires it, allowing
      // self-signed certs (libpq sslmode=require semantics).
      ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    },
    {
      appendPlugins: [ConnectionFilterPlugin, PgSimplifyInflectorPlugin],
      exportGqlSchemaPath: "./schema.gql",
      watchPg: !config.IS_PRODUCTION,
      dynamicJson: true,
    }
  )
);

app.use(publicPath || "/", staticsRouter());

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err, err.stack);
  res.status(500).send(String(err));
});

app.listen(config.SERVER_PORT, () => {
  console.log(
    `App listening on port=${config.SERVER_PORT}, path=${config.BASE_URL} at ${config.PUBLIC_URL}!`
  );
});

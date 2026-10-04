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
      // PostGraphile forwards this config straight to `new pg.Pool(...)`.
      // Bound the pool so a burst of concurrent/segment-heavy GraphQL queries
      // cannot open an unbounded number of connections and spike memory.
      max: config.IS_PRODUCTION ? 10 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
    "public",
    config.IS_PRODUCTION
      ? {
          appendPlugins: [ConnectionFilterPlugin, PgSimplifyInflectorPlugin],
          dynamicJson: true,
          // Production hardening:
          watchPg: false, // no schema-watch overhead
          graphiql: false, // no GraphiQL UI / introspection playground
          enhanceGraphiql: false,
          disableQueryLog: true, // don't log every query (memory + noise)
          retryOnInitFail: true, // survive transient DB unavailability at boot
          enableQueryBatching: true,
          extendedErrors: ["errcode"], // minimal error info, no stack traces
          showErrorStack: false,
        }
      : {
          appendPlugins: [ConnectionFilterPlugin, PgSimplifyInflectorPlugin],
          dynamicJson: true,
          watchPg: true,
          graphiql: true,
          enhanceGraphiql: true,
          exportGqlSchemaPath: "./schema.gql",
          showErrorStack: "json",
          extendedErrors: ["hint", "detail", "errcode"],
        },
  ),
);

app.use(publicPath || "/", staticsRouter());

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err, err.stack);
  res.status(500).send(String(err));
});

app.listen(config.SERVER_PORT, () => {
  console.log(
    `App listening on port=${config.SERVER_PORT}, path=${config.BASE_URL} at ${config.PUBLIC_URL}!`,
  );
});

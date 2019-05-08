import * as express from 'express';
import * as bodyParser from 'body-parser';
import { flightsRouter } from './routes/flights-router';
import { locationsRouter } from './routes/locations-router';
import { videosRouter } from './routes/videos-router';
import { staticsRouter } from './routes/statics-router';
import { staticsDevRouter } from './routes/statics-dev-router';
import * as config from './config';

const { postgraphile } = require("postgraphile");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");

const app = express();

app.use(bodyParser.json());

const publicUrl = config.PUBLIC_URL;

app.use(`${publicUrl}/api/flights`, flightsRouter());
app.use(`${publicUrl}/api/locations`, locationsRouter());
app.use(`${publicUrl}/api/videos`, videosRouter());

app.use(`${publicUrl}/api/`,
  postgraphile(`postgres://${config.DB_HOST}:5432/logbook`, {
    appendPlugins: [ConnectionFilterPlugin],
    exportGqlSchemaPath: './schema.gql',
    watchPg: true
  })
);

app.use(publicUrl, config.IS_PRODUCTION ? staticsRouter() : staticsDevRouter());

app.use(function (err, req, res, next) {
  console.log(err, err.stack);
  res.status(500).send(String(err));
});

app.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});

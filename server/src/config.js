let PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
if (!PUBLIC_URL.startsWith('http')) {
  PUBLIC_URL = `http://${PUBLIC_URL}`;
}

let url = require('url').parse(PUBLIC_URL);
const BASE_URL = url.path === '/' ? '' : url.path;
const PUBLIC_HOST = url.host;
const PUBLIC_HOSTNAME = url.hostname;

module.exports = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  SERVER_PORT: process.env.PORT || 3001,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'logbook',
  DB_PASSWORD: process.env.DB_PASSWORD || 'logbook',
  DB_NAME: process.env.DB_NAME || 'logbook',
  // Connect to Postgres over SSL/TLS. Enable when the server has `ssl = on`
  // and pg_hba.conf requires `hostssl`. node-postgres defaults to no SSL, so
  // without this the connection is dropped ("Connection terminated
  // unexpectedly") even though psql (sslmode=prefer) works.
  DB_SSL: process.env.DB_SSL === 'true',
  CSV_FOLDER: "LOGS/",
  VIDEO_FOLDER: "VIDEOS/",
  VIDEO_SERVER: process.env.VIDEO_SERVER || '',
  PUBLIC_URL,
  PUBLIC_HOST,
  PUBLIC_HOSTNAME,
  BASE_URL
};

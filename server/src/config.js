let PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
if (!PUBLIC_URL.startsWith('http')) {
  PUBLIC_URL = `http://${PUBLIC_URL}`;
}

let url = require('url').parse(PUBLIC_URL);
const PUBLIC_PATH = url.path === '/' ? '' : url.path;
const PUBLIC_HOST = url.host;
const PUBLIC_HOSTNAME = url.hostname;

module.exports = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  SERVER_PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  CSV_FOLDER: "LOGS/",
  VIDEO_FOLDER: "VIDEOS/",
  VIDEO_SERVER: process.env.VIDEO_SERVER,
  PUBLIC_URL,
  PUBLIC_HOST,
  PUBLIC_HOSTNAME,
  PUBLIC_PATH
};

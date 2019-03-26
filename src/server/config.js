module.exports = {
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  SERVER_PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  CSV_FOLDER: "LOGS/",
  VIDEO_FOLDER: "VIDEOS/",
  VIDEO_SERVER: process.env.VIDEO_SERVER
};

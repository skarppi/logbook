import { IMain, IDatabase } from "pg-promise";
import pgPromise from "pg-promise";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL } from "./config";

const pgOptions = {
  receive: (data: Record<string, unknown>[]) => {
    camelizeColumns(data);
  },
};

const camelizeColumns = (data: Record<string, unknown>[]) => {
  const template = data[0];
  for (let prop in template) {
    const camel = pgPromise.utils.camelize(prop);
    if (!(camel in template)) {
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
};

const pgp: IMain = pgPromise(pgOptions);

const connection = {
  host: DB_HOST,
  port: 5432,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  // When Postgres requires SSL, enable it. rejectUnauthorized is false to
  // allow self-signed server certs (matches libpq sslmode=require).
  ssl: DB_SSL ? { rejectUnauthorized: false } : false,
};

console.log(
  `Connecting to postgres://${DB_USER}@${DB_HOST}:5432/${DB_NAME} (ssl=${DB_SSL})`,
);

export const db: IDatabase<any> = pgp(connection);

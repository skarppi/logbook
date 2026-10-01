import { IMain, IDatabase } from "pg-promise";
import pgPromise from "pg-promise";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from "./config";

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

const url = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`;

// Avoid logging the password - log the connection target only.
console.log(`Connecting to postgres://${DB_USER}@${DB_HOST}:5432/${DB_NAME}`);

export const db: IDatabase<any> = pgp(url);

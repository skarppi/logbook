import { IMain, IDatabase } from 'pg-promise';
import * as pgPromise from 'pg-promise';
import { DB_HOST } from './config';

const pgOptions = {
  receive: data => {
    camelizeColumns(data);
  }
};

const camelizeColumns = data => {
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

console.log(`postgres://${DB_HOST}:5432/logbook`);

export const db: IDatabase<any> = pgp(`postgres://${DB_HOST}:5432/logbook`);

import { IMain, IDatabase } from "pg-promise";
import * as pgPromise from "pg-promise";

const pgp: IMain = pgPromise({});

export const db: IDatabase<any> = pgp("postgres://localhost:5432/logbook");

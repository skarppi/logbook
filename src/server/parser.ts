import csv from "./csv";
import FlySession from "./model/flight";
import { duration, formatDuration } from "./utils/date";
import { IFlight } from "../shared/IFlight";
import * as config from "./config";

// flight timer stops when you disarm, and continues when you arm and apply at least 5% throttle
const ARMED_SWITCH = "SB";
const ARMED_VALUE = "1";

const THR_TRESHOLD = 0.05;
const THR_MIN = -1024;
const THR_MAX = 1024;

function timestamp(row: object): Date {
  return new Date(`${row["Date"]} ${row["Time"]}`);
}

function armed(row: object): Boolean {
  return row[ARMED_SWITCH] === ARMED_VALUE;
}

function flying(row: object): Boolean {
  return parseInt(row["Thr"]) >= THR_MIN + (THR_MAX - THR_MIN) * THR_TRESHOLD;
}

function logDuration(startDate: Date, endDate: Date) {
  const logDuration = duration(startDate, endDate);

  console.log(`Log start ${startDate}`);
  console.log(`Log end ${endDate}`);

  console.log(`Log log duration ${formatDuration(logDuration)}`);
}

interface ParserState {
  session: FlySession;
  sessions: FlySession[];
  last?: Date;
}

export default function parse(filename: string): Promise<IFlight[]> {
  return csv(`${config.CSV_FOLDER}/${filename}`).then(results => {
    const first = results[0];
    const last = results[results.length - 1];

    console.log(first);
    console.log(last);

    logDuration(timestamp(first), timestamp(last));

    const plane = filename.split("-")[0];

    const summary = results.reduce<ParserState>(
      (state: ParserState, row) => {
        const now: Date = timestamp(row);

        if (armed(row)) {
          if (!state.session) {
            let name = filename.substring(0, filename.lastIndexOf("."));
            if (!filename.includes("Session")) {
              name += `-Session${state.sessions.length + 1}`;
            }

            state.session = new FlySession(name, plane, now);
          }

          state.session.startTimer(now, flying(row));
        } else {
          if (state.session) {
            state.session.stopTimer(now);
          }
        }

        if (duration(state.last, now) > 30000) {
          // no data past 30 seconds, split session

          if (state.session) {
            console.log("Paused but still fly session open");
            state.sessions.push(state.session.endSession());
            state.session = undefined;
          }
        }

        state.last = now;
        return state;
      },
      { session: undefined, sessions: [] }
    );

    if (summary.session) {
      console.log("Finished but still fly session open");
      summary.sessions.push(summary.session.endSession());
    }

    console.log(String(summary.sessions));
    console.log(summary);
    return summary.sessions;
  });
}

import { Router } from 'express';
import { CSV_FOLDER } from '../config';
import * as multer from 'multer';
import { parseFile, parseData } from '../parser';
import FlightRepository from '../model/flight';

export function flightsRouter() {
  const router = Router();

  router.put('/:day/:id/reset', (req, res, next) => {
    const id = req.params.id;
    FlightRepository.find(id)
      .then(flight =>
        parseData(
          flight.id,
          flight.segments.reduce(
            (res, segment) => [...res, ...segment.rows],
            []
          ),
          {
            splitFlightsAfterSeconds: Number.MAX_VALUE,
            timezoneOffset: 0
          }
        )
      )
      .then(updated => res.json(updated[0]))
      .catch(next);
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, CSV_FOLDER);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // + "-" + Date.now());
    }
  });

  const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error('Only csv files are allowed!'), false);
    }
    cb(null, true);
  };

  const upload = multer({ storage: storage, fileFilter: fileFilter });

  router.post('', upload.array('flight'), (req: any, res, next) => {

    const splitFlightsAfterSeconds = req.headers.split_flights_after_seconds || 30;
    const timezoneOffset = req.headers.timezone_offset || 0;

    Promise.all(req.files.map(file => parseFile(file.originalname, { splitFlightsAfterSeconds, timezoneOffset })))
      .then(flights => {
        const flatten = []
          .concat(...flights)
          .sort((a, b) => (a.id > b.id ? -1 : 1));
        res.json(flatten);
      })
      .catch(next);
  });

  return router;
}

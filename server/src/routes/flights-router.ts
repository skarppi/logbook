import { Router } from 'express';
import { CSV_FOLDER } from '../config';
import * as multer from 'multer';
import { parseFile, parseData } from '../parser';
import FlightRepository from '../model/flight';

export function flightsRouter() {
  const router = Router();

  router.put('/:day/:id/reset', (req, res, next) => {
    const id = req.params.id;
    const timezoneOffset: any = req.headers.timezone_offset || 0;
    const locationId: any = req.headers.location_id;

    FlightRepository.find(id)
      .then(flight =>
        parseData(
          flight.id,
          flight.segments.reduce(
            (res, segment) => [...res, ...segment.rows],
            []
          ),
          {
            timezoneOffset,
            locationId
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

  const upload = multer({ storage, fileFilter });

  router.post('', upload.array('flight'), (req: any, res, next) => {

    const timezoneOffset = req.headers.timezone_offset || 0;
    const locationId = req.headers.location_id;

    Promise.all(req.files.map(file => parseFile(file.originalname, { timezoneOffset, locationId })))
      .then(flights => {
        const flatten = []
          .concat(...flights)
          .sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
        res.json(flatten);
      })
      .catch(next);
  });

  return router;
}

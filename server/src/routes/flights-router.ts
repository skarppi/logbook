import { Router, Request } from "express";
import { CSV_FOLDER } from "../config";
import multer, { FileFilterCallback } from "multer";
import { parseFile, parseData, IParserOptions } from "../parser";
import FlightRepository from "../model/flight";
import { Flight, Segment, SegmentItem } from "../../../client/src/shared/flights/types";

function parseFiles(
  filenames: string[],
  options: IParserOptions
): Promise<Flight[]> {
  return filenames.reduce(
    (p, filename) =>
      p.then((results) =>
        parseFile(filename, options).then((result) => results.concat(...result))
      ),
    Promise.resolve([] as Flight[])
  );
}

export function flightsRouter() {
  const router = Router();

  router.put("/:day/:id/reset", (req, res, next) => {
    const id = req.params.id;
    const timezoneOffset: number = Number(req.headers.timezone_offset) || 0;
    const locationId: number | undefined = req.headers.location_id ? Number(req.headers.location_id) : undefined;

    FlightRepository.find(id)
      .then((flight) => {
        if (!flight) {
          throw new Error(`Flight ${id} not found`);
        }
        const rows = (flight.segments as Segment[]).reduce(
          (res: SegmentItem[], segment) => [...res, ...segment.rows],
          []
        );
        return parseData(
          flight.id,
          rows,
          {
            timezoneOffset,
            locationId,
          }
        );
      })
      .then((updated) => res.json(updated[0]))
      .catch(next);
  });

  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, CSV_FOLDER);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      cb(null, file.originalname); // + "-" + Date.now());
    },
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Only csv files are allowed!"));
    }
    cb(null, true);
  };

  const upload = multer({ storage, fileFilter });

  router.post("", upload.array("flight"), (req: Request, res, next) => {
    const timezoneOffset: number = Number(req.headers.timezone_offset) || 0;
    const locationId: number | undefined = req.headers.location_id ? Number(req.headers.location_id) : undefined;

    const files = req.files as Express.Multer.File[];
    parseFiles(
      files.map((file: Express.Multer.File) => file.originalname),
      { timezoneOffset, locationId }
    )
      .then((flights) => res.json(flights.reverse()))
      .catch(next);
  });

  return router;
}

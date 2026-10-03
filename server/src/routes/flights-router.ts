import { Router, Request } from "express";
import { CSV_FOLDER } from "../config";
import multer, { FileFilterCallback } from "multer";
import { parseFile, parseData, IParserOptions } from "../parser";
import FlightRepository from "../model/flight";
import { Flight, Segment, SegmentItem } from "../../../client/src/shared/flights/types";
import { db } from "../db";

interface Telemetry {
  id: string;
  default: boolean;
  ignore: boolean;
}

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

  // Get filtered segments for a flight (excludes ignored telemetries)
  router.get("/:id/segments", async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get flight with plane's telemetries in one query
      const result = await db.oneOrNone<{
        segments: Segment[];
        telemetries: Telemetry[] | null;
      }>(
        `SELECT f.segments, p.telemetries 
         FROM flights f 
         JOIN planes p ON f.plane_id = p.id 
         WHERE f.id = $1`,
        id
      );

      if (!result) {
        return res.status(404).json({ error: "Flight not found" });
      }

      const { segments, telemetries } = result;

      // Structural fields the client always needs (time axis, etc.) must never
      // be stripped, regardless of per-plane telemetry config.
      const protectedFields = new Set(["Date", "Time", "timestamp"]);

      // Get list of telemetry IDs to ignore
      const ignoredFields = new Set(
        (telemetries || [])
          .filter((t) => t.ignore)
          .map((t) => t.id)
          .filter((id) => !protectedFields.has(id))
      );

      // If nothing to filter, return segments as-is
      if (ignoredFields.size === 0) {
        return res.json(segments);
      }

      // Filter out ignored fields from each row
      const filteredSegments = segments.map((segment) => ({
        ...segment,
        rows: segment.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) => !ignoredFields.has(key))
          ) as SegmentItem
        ),
      }));

      res.json(filteredSegments);
    } catch (err) {
      next(err);
    }
  });

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

import { SegmentImpl } from "../model/segment";
import {
  Flight,
  FlightNotes,
  FlightStats,
  FlightSlope,
} from "../../../client/src/shared/flights/types";
import { SegmentType } from "../../../client/src/shared/flights";
import { Plane } from "../../../client/src/shared/planes/types";
import { differenceInSeconds } from "date-fns";
import { PlaneType } from "../../../client/src/shared/planes";
import { cycleFromFlight } from "../../../client/src/shared/batteries";
import { BatteryCycle } from "../../../client/src/shared/batteries/types";

export class FlightImpl implements Flight {
  public id: string;
  public planeId: string;
  public plane: Plane;
  public session: number;
  public startDate: Date;
  public endDate: Date;
  public duration: number;
  public armedTime: number;
  public flightTime: number;
  public notes: FlightNotes = {};
  public stats: FlightStats = {};
  public locationId?: number;
  public segments: SegmentImpl[];
  public batteries: BatteryCycle[];

  constructor(
    name: string,
    plane: Plane,
    session: number,
    segments: SegmentImpl[],
    locationId?: number,
  ) {
    // EdgeTX uses unique file names: PLANE-YYYY-MM-DD-hhmmss
    if (name.match(/\d{4}$/) || name.includes("Session")) {
      this.id = name;
    } else {
      // append unique session index for OpenTX
      this.id = `${name}-Session${session}`;
    }

    this.planeId = plane.id;
    this.plane = plane;
    this.session = session;
    this.segments = segments;
    this.startDate = segments[0].startDate;
    this.endDate = segments[segments.length - 1].endDate;
    this.duration = differenceInSeconds(this.endDate, this.startDate);

    if (locationId !== undefined && locationId >= 0) {
      this.locationId = locationId;
    }

    this.armedTime = this.segments
      .filter((segment) => segment.type !== SegmentType.stopped)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter((segment) => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.stats = this.generateStats() ?? {};

    this.batteries = [cycleFromFlight(this, null!)];
  }

  private findSlopes = (
    segment: SegmentImpl,
    zeroHeight: number,
  ): FlightSlope[] => {
    if (segment.type !== SegmentType.flying) {
      return [];
    }

    const items = segment.rows.reduce(
      ({ slopes, current }, item) => {
        const alt = item.alt ?? 0;
        const height = Math.round((alt - zeroHeight) * 10) / 10;

        const direction = current?.direction ?? 0;
        if (direction > 0) {
          // going up
          const maxHeight = current?.maxHeight ?? 0;
          if (height >= maxHeight) {
            current!.maxHeight = height;
            return { current, slopes };
          } else {
            // new peak found
            return {
              current: { minHeight: height, maxHeight: height, direction: -1 },
              slopes: [...slopes, current!],
            };
          }
        } else if (direction < 0) {
          // goind down
          const minHeight = current?.minHeight ?? 0;
          if (height <= minHeight) {
            current!.minHeight = height;
            return { current, slopes };
          } else {
            // new minimum found
            return {
              current: { minHeight: height, maxHeight: height, direction: 1 },
              slopes: [...slopes, current!],
            };
          }
        } else {
          // direction still unknown
          if (height > zeroHeight) {
            current!.direction = 1;
          } else if (height < zeroHeight) {
            current!.direction = -1;
          }
          current!.minHeight = current!.maxHeight = height;
          return { current, slopes };
        }
      },
      {
        current: {
          minHeight: zeroHeight,
          maxHeight: zeroHeight,
          direction: 0,
        } as FlightSlope | undefined,
        slopes: [] as FlightSlope[],
      },
    );
    return items.slopes;
  };

  private generateStats = (): FlightStats | null => {
    const launchSegment = this.segments.findIndex(
      (segment) => segment.type === SegmentType.flying,
    );

    if (launchSegment < 0) {
      return null;
    }

    const zeroHeight =
      launchSegment > 0 ? (this.segments[launchSegment - 1].last?.alt ?? 0) : 0;

    const slopes = this.segments
      .slice(launchSegment)
      .reduce((result, current) => {
        return [...result, ...this.findSlopes(current, zeroHeight)];
      }, [] as FlightSlope[]);

    const launchHeight: number | null | undefined =
      this.plane.type === PlaneType.glider && slopes[1]
        ? slopes[1].maxHeight
        : null;

    const maxHeight = slopes.reduce((currentMax, item) => {
      const itemMax = item.maxHeight ?? 0;
      return itemMax > (currentMax ?? 0) ? itemMax : currentMax;
    }, zeroHeight);

    return {
      zeroHeight,
      launchHeight: launchHeight ?? undefined,
      maxHeight,
      slopes,
    };
  };
}

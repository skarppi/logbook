import Segment from '../model/segment';
import { Flight, FlightNotes, FlightStats, FlightSlope } from '../../../shared/flights/types';
import { SegmentType } from '../../../shared/flights';
import { Plane } from '../../../shared/planes/types';
import { differenceInSeconds } from 'date-fns';
import { PlaneType } from '../../../shared/planes';
import { cycleFromFlight } from '../../../shared/batteries';
import { BatteryCycle } from '../../../shared/batteries/types';

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
  public segments: Segment[];
  public batteries: BatteryCycle[];

  constructor(name: string, plane: Plane, session: number, segments: Segment[], locationId?: number) {

    if (!name.includes('Session')) {
      this.id = `${name}-Session${session}`;
    } else {
      this.id = name;
    }

    this.planeId = plane.id;
    this.plane = plane;
    this.session = session;
    this.segments = segments;
    this.startDate = segments[0].startDate;
    this.endDate = segments[segments.length - 1].endDate;
    this.duration = differenceInSeconds(this.endDate, this.startDate);

    if (locationId >= 0) {
      this.locationId = locationId;
    }

    this.armedTime = this.segments
      .filter(segment => segment.type !== SegmentType.stopped)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter(segment => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.stats = this.generateStats();

    this.batteries = [cycleFromFlight(this, null)];
  }

  private findSlopes = (segment: Segment, zeroHeight: number): FlightSlope[] => {
    if (segment.type !== SegmentType.flying) {
      return [];
    }

    const items = segment.rows.reduce(({ slopes, current }, item) => {
      const height = Math.round((item.alt - zeroHeight) * 10) / 10;

      if (current.direction > 0) {
        // going up
        if (height >= current.maxHeight) {
          current.maxHeight = height;
          return { current, slopes };
        } else {
          // new peak found
          return { current: { minHeight: height, maxHeight: height, direction: -1 }, slopes: [...slopes, current] };
        }
      } else if (current.direction < 0) {
        // goind down
        if (height <= current.minHeight) {
          current.minHeight = height;
          return { current, slopes };
        } else {
          // new minimum found
          return { current: { minHeight: height, maxHeight: height, direction: 1 }, slopes: [...slopes, current] };
        }
      } else {
        // direction still unknown
        if (height > zeroHeight) {
          current.direction = 1;
        } else if (height < zeroHeight) {
          current.direction = -1;
        }
        current.minHeight = current.maxHeight = height;
        return { current, slopes };
      }

    }, { current: { minHeight: zeroHeight, maxHeight: zeroHeight, direction: 0 } as FlightSlope, slopes: [] as FlightSlope[] });
    return items.slopes;
  }

  private generateStats = () => {
    const launchSegment = this.segments
      .findIndex(segment => segment.type === SegmentType.flying);

    if (launchSegment < 0) {
      return null;
    }

    const zeroHeight = (launchSegment > 0)
      ? this.segments[launchSegment - 1].last.alt
      : null;


    const slopes = this.segments.slice(launchSegment).reduce((result, current) => {
      return [...result, ...this.findSlopes(current, zeroHeight)];
    }, [] as FlightSlope[]);

    console.log(slopes);

    const launchHeight = this.plane.type === PlaneType.glider ? slopes[1].maxHeight : null;

    const maxHeight = slopes.reduce((current, item) => {
      return item.maxHeight > current ? item.maxHeight : current;
    }, zeroHeight);

    return { zeroHeight, launchHeight, maxHeight, slopes };
  }
}
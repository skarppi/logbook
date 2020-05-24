import Segment from '../model/segment';
import { Flight, FlightNotes, FlightStats } from '../../../shared/flights/types';
import { SegmentType } from '../../../shared/flights';
import { Plane } from '../../../shared/planes/types';
import { differenceInSeconds } from 'date-fns';
import { PlaneType } from '../../../shared/planes';

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
  public notes: FlightNotes;
  public stats: FlightStats;
  public locationId?: number;
  public segments: Segment[];

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

    if (PlaneType.glider === plane.type) {
      this.stats = this.gliderStats();
    }
  }

  private gliderStats = () => {
    const launchSegment = this.segments
      .findIndex(segment => segment.type === SegmentType.flying);

    if (launchSegment < 0) {
      return null;
    }

    const zeroHeight = (launchSegment > 0)
      ? this.segments[launchSegment - 1].last.alt
      : 0;

    return this.segments[launchSegment].rows.reduce((stats, item) => {
      const height = Math.round((item.alt - stats.zeroHeight) * 10) / 10;

      if (!stats.maxHeight || height > stats.maxHeight) {
        stats.maxHeight = height;
      }

      if (!stats.launchHeight && height < stats.maxHeight) {
        // found the launch altitude
        stats.launchHeight = stats.maxHeight;
      }

      return { ...stats, };
    }, { zeroHeight } as FlightStats);
  }
}
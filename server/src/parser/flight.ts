import Segment from '../model/segment';
import { Flight, FlightNotes } from '../../../shared/flights/types';
import { SegmentType } from '../../../shared/flights';
import { Plane } from '../../../shared/planes/types';
import { differenceInSeconds } from 'date-fns';

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
  public notes: FlightNotes = undefined;
  public segments: Segment[];

  constructor(name: string, plane: Plane, session: number, segments: Segment[]) {

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
    this.duration = differenceInSeconds(this.startDate, this.endDate);

    this.armedTime = this.segments
      .filter(segment => segment.type !== SegmentType.stopped)
      .reduce((sum, segment) => sum + segment.duration, 0);

    this.flightTime = this.segments
      .filter(segment => segment.type === SegmentType.flying)
      .reduce((sum, segment) => sum + segment.duration, 0);
  }
}
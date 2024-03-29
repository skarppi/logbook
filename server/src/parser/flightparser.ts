import { SegmentImpl } from "../model/segment";
import SegmentParser from "./segmentparser";
import { Flight } from "../../../client/src/shared/flights/types";
import { Plane, LogicalSwitch } from "../../../client/src/shared/planes/types";
import { SegmentType } from "../../../client/src/shared/flights";
import { SegmentItem } from "../../../client/src/shared/flights/types";
import { LogicalFunction } from "../../../client/src/shared/planes";
import { FlightImpl } from "./flight";
import { IParserOptions } from ".";
import { SERVER_PORT, BASE_URL } from "../config";
import { request } from "graphql-request";
import SegmentItemParser from "./segmentitem";

export default class FlightParser {
  private name: string;
  private currentSegment: SegmentParser = new SegmentParser();
  private currentSegments: SegmentImpl[] = [];
  private sessionCounter: number = 0;
  private options: IParserOptions;
  private flights: Flight[] = [];
  private plane: Plane;
  private itemParser: SegmentItemParser;

  constructor(name: string, options: IParserOptions) {
    this.name = name;
    this.options = options;
    this.itemParser = new SegmentItemParser(options.timezoneOffset);
  }

  public getFlights(): Flight[] {
    return this.flights;
  }

  public getOptions(): IParserOptions {
    return this.options;
  }

  public appendItem(item: SegmentItem) {
    item.timestamp = this.itemParser.timestamp(item)
    item.alt = this.itemParser.alt(item)

    const type = this.currentSegmentType(item);

    const endFlightBecauseStopped =
      type === SegmentType.stopped &&
      this.currentSegment.type !== SegmentType.stopped &&
      this.plane.modeStoppedStartsNewFlight;

    if (
      endFlightBecauseStopped ||
      this.test(this.plane.logicalSwitchByModeRestart, item)
    ) {
      this.endFlight();
    } else if (this.currentSegment.type !== type) {
      this.endSegment();
    }

    this.currentSegment.appendItem(type, item);
  }

  public endFlight() {
    this.endSegment();

    this.sessionCounter++;

    if (this.currentSegments.length > 0) {
      const flight = new FlightImpl(
        this.name,
        this.plane,
        this.sessionCounter,
        this.currentSegments,
        this.options.locationId
      );

      if (flight.flightTime === 0) {
        console.log("Skipped empty flight", flight);
      } else {
        this.flights.push(flight);
        console.log("Ended flight", flight);
      }
    }
    this.currentSegments = [];
  }

  public async fetchPlane() {
    const query = `query {
      plane(id: "${this.planeName}") {
        id
        type
        telemetries
        batterySlots
        logicalSwitchByModeArmed {
          id
          func
          v1
          v2
          duration
        }
        logicalSwitchByModeFlying {
          id
          func
          v1
          v2
          duration
        }
        logicalSwitchByModeStopped {
          id
          func
          v1
          v2
          duration
        }
        logicalSwitchByModeRestart {
          id
          func
          v1
          v2
          duration
        }
        modeStoppedStartsNewFlight
      }
    }`;

    console.log(`http://localhost:${SERVER_PORT}/${BASE_URL}api/graphql`);

    try {
      const data = await request(
        `http://localhost:${SERVER_PORT}/${BASE_URL}api/graphql`,
        query
      );
      console.log(data);
      console.log(data["plane"]);
      this.plane = data["plane"];
    } catch (err) {
      console.trace(err);
      throw err;
    }

    if (!this.plane) {
      throw new Error(`Plane ${this.planeName} not found`);
    }
  }

  private currentSegmentType(item: SegmentItem): SegmentType {
    if (this.test(this.plane.logicalSwitchByModeArmed, item)) {
      if (this.test(this.plane.logicalSwitchByModeFlying, item)) {
        // started flying
        return SegmentType.flying;
      } else if (this.currentSegment.type === SegmentType.flying) {
        // check if we are still flying
        return this.test(this.plane.logicalSwitchByModeStopped, item)
          ? SegmentType.stopped
          : SegmentType.flying;
      } else {
        return SegmentType.armed;
      }
    } else {
      return SegmentType.stopped;
    }
  }

  private test(test: LogicalSwitch, item: SegmentItem): boolean {
    if (test.duration > 0) {
      const items = this.currentSegment.lastSecondsFromEnd(
        item.timestamp,
        test.duration
      );
      if (!items) {
        const firstItem =
          this.currentSegments.length === 0 && this.currentSegment.isEmpty;
        return !firstItem && this.testExpectNull(test);
      }

      return !items.find((current) => !this.testItem(test, current));
    } else {
      return this.testItem(test, item);
    }
  }

  private testExpectNull(test: LogicalSwitch): boolean {
    return test.v1 === null;
  }

  private testItem(test: LogicalSwitch, item: SegmentItem): boolean {
    if (!item) {
      return this.testExpectNull(test);
    }

    const v1 = item[test.v1];
    const v2 = Number(test.v2);

    if (test.func === LogicalFunction.greaterThan) {
      return v1 > v2;
    } else if (test.func === LogicalFunction.lessThan) {
      return v1 < v2;
    } else if (test.func === LogicalFunction.is) {
      return v1 === v2;
    } else if (test.func === LogicalFunction.not) {
      return v1 !== v2;
    }
  }

  private get planeName() {
    return this.name.split("-")[0];
  }

  private endSegment() {
    const segment = this.currentSegment.endSegment();
    if (segment) {
      this.currentSegments.push(segment);
    }
  }
}

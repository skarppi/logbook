import { Flight } from "../flights/types";
import { BatteryCycle } from "./types";
import { Telemetry } from "../utils/telemetry";

export enum BatteryState {
  discharged = "DISCHARGED",
  storage = "STORAGE",
  charged = "CHARGED",
}

export const cycleFromFlight = (
  flight: Flight,
  batteryName: string
): BatteryCycle => {
  const firstSegment = flight.segments[0];
  const firstTelemetry = firstSegment.rows[0];

  const lastSegment = flight.segments.slice(-1)[0];
  const lastTelemetry = lastSegment.rows.slice(-1)[0];

  const startVoltage = Telemetry.voltage(firstTelemetry);

  const endVoltage = Telemetry.voltage(lastTelemetry);
  const multipleBatteries =
    endVoltage && flight.plane.batterySlots > 1 && endVoltage > 4.5;
  const divider = multipleBatteries ? flight.plane.batterySlots : 1;

  return {
    date: flight.startDate.toString(),
    batteryName: batteryName,
    flightId: flight.id,
    state: BatteryState.discharged,
    restingVoltage: endVoltage && endVoltage / divider,
    startVoltage: startVoltage && startVoltage / divider,
    endVoltage: endVoltage && endVoltage / divider,
    discharged: Telemetry.capacity(lastTelemetry),
  };
};

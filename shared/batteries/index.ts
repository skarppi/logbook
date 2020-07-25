import { Flight } from '../flights/types';
import { Battery, BatteryCycle } from './types';
import { Telemetry } from '../utils/telemetry';

export enum BatteryState {
  discharged = 'DISCHARGED',
  storage = 'STORAGE',
  charged = 'CHARGED'
}

export const cycleFromFlight = (flight: Flight, batteryName?: string): BatteryCycle => {
  const firstSegment = flight.segments[0];
  const firstTelemetry = firstSegment.rows[0];

  const lastSegment = flight.segments.slice(-1)[0];
  const lastTelemetry = lastSegment.rows.slice(-1)[0];

  const voltage = Telemetry.voltage(lastTelemetry);
  const multipleBatteries = flight.plane.batterySlots > 1 && voltage > 4.5;
  const divider = multipleBatteries ? flight.plane.batterySlots : 1;

  return {
    date: flight.startDate.toString(),
    batteryName,
    flightId: flight.id,
    state: BatteryState.discharged,
    restingVoltage: voltage / divider,
    startVoltage: Telemetry.voltage(firstTelemetry) / divider,
    endVoltage: voltage / divider,
    discharged: Telemetry.capacity(lastTelemetry),
  };
};

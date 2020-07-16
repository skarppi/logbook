import * as React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { Flight } from '../../../../../shared/flights/types';
import { FlightBattery } from './FlightBattery';
import AddIcon from '@material-ui/icons/Add';
import { BatteryState } from '../../../../../shared/batteries';
import { Battery } from '../../../../../shared/batteries/types';
import gql from 'graphql-tag';
import { useMutation } from 'urql';
import { LoadingIcon } from '../../loading/Loading';
import { CREATE_BATTERY_CYCLE } from '../../batteries/Battery/BatteryCycle';
const css = require('../../../common/Form.css');

interface IBatteryProps {
  flight: Flight;
  batteries: Battery[];
  refreshFlight: () => void;
}

export const FlightBatteries = ({ flight, batteries, refreshFlight }: IBatteryProps) => {

  const plane = flight.plane;

  const cycles = flight.batteryCycles?.nodes || [];

  const [create, createCycle] = useMutation(CREATE_BATTERY_CYCLE);

  const addBattery = () => {

    const lastSegment = flight.segments.slice(-1)[0];
    const lastTelemetry = lastSegment.rows.slice(-1)[0];

    const usedBatteries = cycles.map(c => c.batteryName);

    const voltage = lastTelemetry?.['VFAS(V)'] || lastTelemetry?.['RxBt(V)'];
    const useCellVoltage = plane.batterySlots > 1 && voltage > 4.5;

    const cycle = {
      date: flight.startDate,
      batteryName: plane.planeBatteries.nodes.find(
        name => usedBatteries.indexOf(name.batteryName) === -1
      ).batteryName,
      flightId: flight.id,
      state: BatteryState.discharged,
      voltage: useCellVoltage ? voltage / plane.batterySlots : voltage,
      discharged: lastTelemetry && (Number(lastTelemetry['Fuel(mAh)'] || lastTelemetry['Capa(mAh)'])),
    };

    createCycle({ cycle }).then(refreshFlight);
  };

  const rows = cycles.map(cycle => {
    return cycle.id && (
      <FlightBattery
        key={cycle.id}
        plane={plane}
        flightCycle={cycle}
        battery={batteries.find(b => b.name === cycle.batteryName)}
      />);
  }
  );

  const batteryControl =
    <FormControl className={css.formControl} margin='normal'>
      <Button onClick={addBattery}>
        Add battery
        <AddIcon />
      </Button>
      <LoadingIcon
        spinning={create.fetching}
        error={create.error}
      />
    </FormControl>;

  const batterySlots = plane?.batterySlots || 0;
  const showControls = rows.length < batterySlots;

  return (
    <>
      {rows}
      {showControls && batteryControl}
    </>
  );
};
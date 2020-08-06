import * as React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { Flight } from '../../../../../shared/flights/types';
import { FlightBattery } from './FlightBattery';
import AddIcon from '@material-ui/icons/Add';
import { cycleFromFlight } from '../../../../../shared/batteries';
import { Battery } from '../../../../../shared/batteries/types';
import { useMutation } from 'urql';
import { LoadingIcon } from '../../loading/Loading';
import { CREATE_BATTERY_CYCLE } from '../../batteries/Battery/BatteryCycle';

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
    const usedBatteries = cycles.map(c => c.batteryName);

    const nextBatteryName = plane.planeBatteries.nodes.find(
      name => usedBatteries.indexOf(name.batteryName) === -1
    )?.batteryName;

    const battery = batteries.find(b => b.name === nextBatteryName);

    const cycle = cycleFromFlight(flight, battery?.name);
    createCycle({ cycle }).then(refreshFlight);
  };

  const rows = cycles.map(cycle => cycle.id && (
    <FlightBattery
      key={cycle.id}
      plane={plane}
      flightCycle={cycle}
      battery={batteries.find(b => b.name === cycle.batteryName)}
    />)
  );

  const batteryControl =
    <FormControl margin='normal'>
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
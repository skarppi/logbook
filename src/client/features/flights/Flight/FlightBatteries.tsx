import * as React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { Flight } from '../../../../shared/flights/types';
import { FlightBattery } from './FlightBattery';
import AddIcon from '@material-ui/icons/Add';
import { planes } from './Flight';
import { BatteryState } from '../../../../shared/batteries';
import { Battery } from '../../../../shared/batteries/types';
import gql from 'graphql-tag';
import { useMutation } from 'urql';
import Loading from '../../loading/Loading/Loading';
const css = require('../../../common/Form.css');

interface IBatteryProps {
  flight: Flight;
  batteries: Battery[];
  refreshFlight: () => void;
}

const Create = gql`
  mutation($cycle:BatteryCycleInput!) {
    createBatteryCycle(input: {batteryCycle: $cycle}) {
      batteryCycle {
        id
        date
        batteryName
        flightId
        state
        voltage
        discharged
        charged
      }
    }
  }`;


export const FlightBatteries = ({ flight, batteries, refreshFlight }: IBatteryProps) => {

  const plane = planes[flight.plane]

  const cycles = flight.batteryCyclesByFlightId && flight.batteryCyclesByFlightId.nodes || [];

  const [create, createCycle] = useMutation(Create);

  const addBattery = () => {

    const lastSegment = flight.segments.slice(-1)[0];
    const lastTelemetry = lastSegment.rows.slice(-1)[0];

    const usedBatteries = cycles.map(c => c.batteryName);

    const voltage = lastTelemetry && lastTelemetry['VFAS(V)']
    const useCellVoltage = plane.batterySlots > 1 && voltage > 4.5

    const cycle = {
      date: flight.startDate,
      batteryName: plane.batteries.find(
        name => usedBatteries.indexOf(name) === -1
      ),
      flightId: flight.id,
      state: BatteryState.discharged,
      voltage: useCellVoltage ? voltage / plane.batterySlots : voltage,
      discharged: lastTelemetry && Number(lastTelemetry['Fuel(mAh)']),
    };

    createCycle({ cycle }).then(refreshFlight);
  };

  const rows = cycles.map(cycle =>
    <FlightBattery
      key={cycle.id}
      plane={plane}
      flightCycle={cycle}
      battery={batteries.find(b => b.name === cycle.batteryName)}
    />
  );


  return (
    <>
      {rows}
      <FormControl className={css.formControl} margin='normal'>
        {rows.length < plane.batterySlots && (
          <>
            <Button onClick={addBattery}>
              Add battery
            <AddIcon />
            </Button>
            <Loading
              spinning={create.fetching}
              error={create.error}
              overlay={false}
            />
          </>
        )}
      </FormControl>
    </>
  );
}
import * as React from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import { Flight } from "../../../shared/flights/types";
import { FlightBattery } from "./FlightBattery";
import AddIcon from "@mui/icons-material/Add";
import { cycleFromFlight } from "../../../shared/batteries";
import { Battery } from "../../../shared/batteries/types";
import { useMutation } from "urql";
import { LoadingIcon } from "../../loading/Loading";
import { CREATE_BATTERY_CYCLE } from "../../batteries/Battery/BatteryCycle";
import { InputLabel, Typography } from "@mui/material";

interface IBatteryProps {
  flight: Flight;
  batteries: Battery[];
  refreshFlight: () => void;
}

export const FlightBatteries = ({
  flight,
  batteries,
  refreshFlight,
}: IBatteryProps) => {
  const plane = flight.plane;

  const cycles = flight.batteryCycles?.nodes || [];

  const [create, createCycle] = useMutation(CREATE_BATTERY_CYCLE);

  const addBattery = () => {
    const usedBatteries = cycles.map((c) => c.batteryName);

    const nextBatteryName = plane?.planeBatteries?.nodes.find(
      (name) => usedBatteries.indexOf(name.batteryName) === -1
    )?.batteryName;

    const battery = batteries.find((b) => b.name === nextBatteryName);

    const cycle = cycleFromFlight(flight, battery?.name ?? "-");
    createCycle({ cycle }).then(refreshFlight);
  };

  const rows = cycles.map(
    (cycle) =>
      cycle.id && (
        <FlightBattery
          key={cycle.id}
          plane={plane}
          flightCycle={cycle}
          battery={batteries.find((b) => b.name === cycle.batteryName)}
        />
      )
  );

  const batteryControl = (
    <Button onClick={addBattery}>
      Add battery
      <AddIcon />
    </Button>
  );

  const batterySlots = plane?.batterySlots || 0;
  const showControls = rows.length < batterySlots;

  return (
    <FormControl margin="dense">
      <Typography variant="subtitle1">Batteries</Typography>
      {rows}
      {showControls && batteryControl}
      <LoadingIcon spinning={create.fetching} error={create.error} />
    </FormControl>
  );
};

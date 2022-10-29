import * as React from "react";
import TextField from "@mui/material/TextField";
import {
  formatDuration,
  parseDurationIntoSeconds,
} from "../../../../../shared/utils/date";
import { Flight } from "../../../../../shared/flights/types";
import Box from "@mui/material/Box";

interface IFlightDurationProps {
  flight: Flight;
  save: (object: any) => {};
}

export const FlightDuration = ({ flight, save }: IFlightDurationProps) => {
  const [armedTime, setArmedTime] = React.useState("");
  const [flightTime, setFlightTime] = React.useState("");

  React.useEffect(() => {
    setArmedTime(formatDuration(flight.armedTime));
  }, [flight.armedTime]);

  React.useEffect(() => {
    setFlightTime(formatDuration(flight.flightTime));
  }, [flight.flightTime]);

  const changeArmedTime = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setArmedTime(value);
  };
  const changeFlightTime = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFlightTime(value);
  };

  const store = ({
    target: { name, value },
  }: React.FocusEvent<HTMLInputElement>) => {
    const seconds = parseDurationIntoSeconds(value);
    if (seconds) {
      save({
        id: flight.id,
        patch: {
          [name]: seconds,
        },
      });
    }
  };

  return (
    <Box display="flex" flexGrow="1">
      <TextField
        required
        error={parseDurationIntoSeconds(armedTime) === null}
        id="armedTime"
        label="Armed time"
        value={armedTime}
        name="armedTime"
        onChange={changeArmedTime}
        onBlur={store}
        margin="normal"
        fullWidth={true}
      />

      <TextField
        required
        error={parseDurationIntoSeconds(flightTime) === null}
        id="flightTime"
        label="Flight time"
        value={flightTime}
        name="flightTime"
        onChange={changeFlightTime}
        onBlur={store}
        margin="normal"
        fullWidth={true}
      />
    </Box>
  );
};

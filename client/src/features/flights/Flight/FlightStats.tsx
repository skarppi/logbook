import * as React from "react";
import TextField from "@mui/material/TextField";
import { Flight } from "../../../shared/flights/types";
import Box from "@mui/material/Box";

interface IFlightStatsProps {
  flight: Flight;
}

export const FlightStats = ({ flight }: IFlightStatsProps) => {
  if (!flight || !flight.stats) {
    return <></>;
  }

  return (
    <Box display="flex">
      {flight.stats?.zeroHeight && (
        <TextField
          InputProps={{
            readOnly: true,
          }}
          id="zeroHeight"
          label="Zero height"
          value={flight.stats?.zeroHeight}
          name="zeroHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
      {flight.stats?.launchHeight && (
        <TextField
          InputProps={{
            readOnly: true,
          }}
          id="launchHeight"
          label="Launch height"
          value={flight.stats?.launchHeight}
          name="launchHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
      {flight.stats?.maxHeight && (
        <TextField
          InputProps={{
            readOnly: true,
          }}
          id="maxHeight"
          label="Maximum height"
          value={flight.stats.maxHeight}
          name="maxHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
    </Box>
  );
};

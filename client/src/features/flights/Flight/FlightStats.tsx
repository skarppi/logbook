import TextField from "@mui/material/TextField";
import { FlightStats } from "../../../shared/flights/types";
import Box from "@mui/material/Box";

interface IFlightStatsProps {
  stats: FlightStats;
}

export const FlightStatistics = ({
  stats: { zeroHeight, launchHeight, maxHeight },
}: IFlightStatsProps) => {
  return (
    <Box sx={{ display: "flex" }}>
      {zeroHeight && (
        <TextField
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          id="zeroHeight"
          label="Zero height"
          value={zeroHeight}
          name="zeroHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
      {launchHeight && (
        <TextField
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          id="launchHeight"
          label="Launch height"
          value={launchHeight}
          name="launchHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
      {maxHeight && (
        <TextField
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          id="maxHeight"
          label="Maximum height"
          value={maxHeight}
          name="maxHeight"
          margin="normal"
          fullWidth={true}
        />
      )}
    </Box>
  );
};

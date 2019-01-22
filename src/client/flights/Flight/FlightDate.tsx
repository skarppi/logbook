import * as React from "react";
import { TextField } from "@material-ui/core";
import { formatTime, formatDate } from "../../../shared/utils/date";
import { Flight } from "../../../shared/flights/types";
const css = require("./Flight.css");

interface FlightDateProps {
  flight: Flight;
}

export class FlightDate extends React.Component<FlightDateProps, never> {
  render() {
    const { flight } = this.props;
    return (
      <>
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id="date"
          type="date"
          label="Date"
          value={formatDate(flight.startDate)}
          className={css.textField}
          margin="normal"
        />
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id="start_time"
          type="time"
          label="Started"
          className={css.textField}
          value={formatTime(flight.startDate)}
          margin="normal"
        />
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id="end_time"
          type="time"
          label="Stopped"
          className={css.textField}
          value={formatTime(flight.endDate)}
          margin="normal"
        />
      </>
    );
  }
}

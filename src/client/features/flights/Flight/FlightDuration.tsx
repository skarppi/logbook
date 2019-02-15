import * as React from "react";
import { TextField } from "@material-ui/core";
import {
  formatDuration,
  parseDurationIntoSeconds
} from "../../../../shared/utils/date";
import { Flight } from "../../../../shared/flights/types";
const css = require("../../../common/Form.css");

interface FlightDurationProps {
  flight: Flight;
  save: (id, object) => {};
}

interface LocalState {
  armedTime: string;
  flightTime: string;
  errors: {
    armedTime: boolean;
    flightTime: boolean;
  };
}

export class FlightDuration extends React.Component<
  FlightDurationProps,
  LocalState
> {
  constructor(props) {
    super(props);
    this.state = {
      armedTime: "",
      flightTime: "",
      errors: {
        armedTime: false,
        flightTime: false
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      armedTime: formatDuration(nextProps.flight.armedTime),
      flightTime: formatDuration(nextProps.flight.flightTime)
    });
  }

  changeFlightDuration = event => {
    const errors = {
      ...this.state.errors,
      [event.target.name]: parseDurationIntoSeconds(event.target.value) === null
    } as any;

    this.setState({
      [event.target.name]: event.target.value,
      errors: errors
    } as any);
  };

  storeFlightDuration = event => {
    const seconds = parseDurationIntoSeconds(event.target.value);
    if (seconds) {
      this.props.save(this.props.flight.id, {
        [event.target.name]: seconds
      });
    }
  };

  render() {
    const { flight } = this.props;
    const { armedTime, flightTime, errors } = this.state;
    return (
      <div className={css.subContainer}>
        <TextField
          required
          error={errors.armedTime}
          id="armedTime"
          label="Armed time"
          className={css.textField}
          value={armedTime}
          name="armedTime"
          onChange={this.changeFlightDuration}
          onBlur={this.storeFlightDuration}
          margin="normal"
        />

        <TextField
          required
          error={errors.flightTime}
          id="flightTime"
          label="Flight time"
          className={css.textField}
          value={flightTime}
          name="flightTime"
          onChange={this.changeFlightDuration}
          onBlur={this.storeFlightDuration}
          margin="normal"
        />
      </div>
    );
  }
}

import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Input,
  MenuItem,
  Checkbox
} from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  formatDuration,
  formatTime,
  formatDate,
  parseDurationIntoSeconds
} from "../../../shared/utils/date";
import { Plane } from "../../../shared/flights/types";
import TextField from "@material-ui/core/TextField";
import { FlightsState } from "../reducer";
import { RootState } from "../../store";
import {
  fetchFlight,
  deleteFlight,
  resetFlight,
  changeFlightFields
} from "../actions";
import { connect } from "react-redux";

const css = require("./Flight.css");
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";

interface LocalProps {
  armedTime: string;
  flightTime: string;
  errors: {
    armedTime: boolean;
    flightTime: boolean;
  };
}

export interface RouteParams {
  date: string;
  id: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams>;

const planes: { [key: string]: Plane } = {
  Reverb: {
    batteries: ["tattu1", "tattu2", "tattu3", "tattu4"]
  },
  TWR: {
    batteries: [
      "mylipo1",
      "mylipo2",
      "mylipo3",
      "mylipo4",
      "happy1",
      "happy2",
      "happy3",
      "happy4"
    ]
  },
  MOB7: {
    batteries: [
      "mylipo1",
      "mylipo2",
      "mylipo3",
      "mylipo4",
      "happy1",
      "happy2",
      "happy3",
      "happy4"
    ]
  }
};

class FlightDetails extends React.Component<AllProps, LocalProps> {
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

  public render() {
    const { flight } = this.props;
    const { armedTime, flightTime, errors } = this.state;

    if (!flight) {
      return <div>Loading...</div>;
    }

    return (
      <Card>
        <CardHeader
          title={`Flight: ${flight.id}`}
          action={
            <>
              <IconButton onClick={_ => this.props.resetFlight(flight)}>
                <RefreshIcon />
              </IconButton>

              <IconButton onClick={_ => this.props.deleteFlight(flight)}>
                <DeleteIcon />
              </IconButton>
            </>
          }
        />
        <CardContent className={css.container}>
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
          <TextField
            required
            InputProps={{
              readOnly: true
            }}
            id="duration"
            label="Duration"
            className={css.textField}
            value={formatDuration(flight.duration)}
            margin="normal"
          />

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

          <TextField
            id="osd"
            label="OSD"
            placeholder="OSD"
            multiline
            className={css.textField}
            value={flight.notes.osd}
            name="osd"
            onChange={this.props.changeNotes}
            margin="normal"
          />

          <TextField
            id="location"
            label="Location"
            placeholder="Location"
            className={css.textField}
            value={flight.notes.location}
            name="location"
            onChange={this.props.changeNotes}
            margin="normal"
          />

          <FormControl className={css.formControl} margin="normal">
            <InputLabel htmlFor="select-multiple-checkbox">
              Batteries
            </InputLabel>
            <Select
              multiple
              value={flight.notes.batteries}
              name="batteries"
              onChange={this.props.changeNotes}
              input={<Input id="select-multiple-checkbox" />}
              renderValue={selected => (selected as string[]).join(", ")}
            >
              {planes[flight.plane].batteries.map(name => (
                <MenuItem key={name} value={name}>
                  <Checkbox
                    checked={flight.notes.batteries.indexOf(name) > -1}
                  />
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id="chargeVoltage"
            label="Charged Voltage"
            placeholder="Charged Voltage"
            className={css.textField}
            value={flight.notes.chargeVoltage}
            name="chargeVoltage"
            onChange={this.props.changeNotes}
            margin="normal"
          />

          <TextField
            id="chargeFuel"
            label="Charged fuel"
            placeholder="Charged fuel"
            className={css.textField}
            value={flight.notes.chargeFuel}
            name="chargeFuel"
            onChange={this.props.changeNotes}
            margin="normal"
          />

          <TextField
            id="jornal"
            label="Journal"
            placeholder="Journal"
            multiline
            className={css.textField}
            value={flight.notes.journal}
            name="journal"
            onChange={this.props.changeNotes}
            margin="normal"
          />
        </CardContent>
      </Card>
    );
  }

  public async componentWillMount() {
    const flight = this.props.flightsPerDay.find(
      f => f.id === this.props.match.params.id
    );
    this.props.fetchFlight(flight);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      armedTime: formatDuration(nextProps.flight.armedTime),
      flightTime: formatDuration(nextProps.flight.flightTime)
    });
  }

  onBlur = event => {
    const seconds = parseDurationIntoSeconds(event.target.value);

    console.log("onBlur", event.target, seconds);

    if (seconds) {
      this.props.changeFlightFields({
        [event.target.name]: parseDurationIntoSeconds(event.target.value)
      });
    }
  };

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
      this.props.changeFlightFields({
        [event.target.name]: seconds
      });
    }
  };
}

const mapStateToProps = (state: RootState) => ({
  flightsPerDay: state.flights.flightsOfTheDay,
  flight: state.flights.flight,
  isLoadingFlight: state.flights.isLoadingFlightDays
});

const mapDispatchToProps = {
  fetchFlight: fetchFlight.request,
  resetFlight: resetFlight.request,
  deleteFlight: deleteFlight.request,
  changeNotes: event =>
    changeFlightFields({ notes: { [event.target.name]: event.target.value } }),
  changeFlightFields: changeFlightFields,
  updateFlightTimes: event =>
    changeFlightFields({
      [event.target.name]: parseDurationIntoSeconds(event.target.value)
    })
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

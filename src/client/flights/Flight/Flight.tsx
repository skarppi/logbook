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
  Checkbox,
  TextField
} from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  formatDuration,
  parseDurationIntoSeconds
} from "../../../shared/utils/date";
import { Plane } from "../../../shared/flights/types";
import { FlightsState } from "../reducer";
import { RootState } from "../../store";
import {
  fetchFlight,
  deleteFlight,
  resetFlight,
  changeFlightFields
} from "../actions";
import { connect } from "react-redux";

import { FlightDate } from "./FlightDate";
import { FlightDuration } from "./FlightDuration";

const css = require("./Flight.css");
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";

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

class FlightDetails extends React.Component<AllProps> {
  public render() {
    const { flight } = this.props;

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
          <FlightDate flight={flight} />
          <FlightDuration flight={flight} save={this.props.save} />

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
  save: changeFlightFields,
  updateFlightTimes: event =>
    changeFlightFields({
      [event.target.name]: parseDurationIntoSeconds(event.target.value)
    })
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

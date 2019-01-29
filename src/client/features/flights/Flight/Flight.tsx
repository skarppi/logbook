import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField
} from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { parseDurationIntoSeconds } from "../../../../shared/utils/date";
import { Plane } from "../../../../shared/flights/types";
import { FlightsState } from "../reducer";
import { RootState } from "../../../app";
import {
  fetchFlight,
  deleteFlight,
  resetFlight,
  changeFlightFields
} from "../actions";
import { connect } from "react-redux";

import { FlightDate } from "./FlightDate";
import { FlightDuration } from "./FlightDuration";
import FlightBatteries from "./FlightBatteries";

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

export const planes: { [key: string]: Plane } = {
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

export class FlightDetails extends React.Component<AllProps> {
  public render() {
    const { flight, batteries } = this.props;

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
        <CardContent>
          <div className={css.container}>
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
          </div>

          <FlightBatteries />

          <div className={css.container}>
            <TextField
              id="jornal"
              label="Journal"
              placeholder="Journal"
              multiline
              className={css.textFieldWide}
              value={flight.notes.journal}
              name="journal"
              onChange={this.props.changeNotes}
              margin="normal"
            />
          </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

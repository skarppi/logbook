import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Tooltip
} from "@material-ui/core";
import * as React from "react";
import { parseDurationIntoSeconds } from "../../../../shared/utils/date";
import { Plane, Flight } from "../../../../shared/flights/types";
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

import { Player, ControlBar, BigPlayButton } from "video-react";

const css = require("./Flight.css");
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";
import WarningIcon from "@material-ui/icons/Warning";
import { getFlight } from "../selectors";

export interface OwnProps {
  id: string;
}

export interface FlightDetailsProps {
  flight: Flight;
  isLoadingFlight: boolean;
  error?: string;
}

type AllProps = FlightDetailsProps & typeof mapDispatchToProps;

export const planes: { [key: string]: Plane } = {
  Reverb: {
    batteries: ["cnhl1", "cnhl2", "tattu1", "tattu2", "tattu3", "tattu4"]
  },
  TWR: {
    batteries: [
      "mylipo1",
      "mylipo2",
      "mylipo3",
      "mylipo4",
      "mylipo5",
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
    const { flight, error } = this.props;

    if (!flight) {
      return <div>Loading...</div>;
    }

    return (
      <Card className={css.card}>
        <CardHeader
          title={`Flight: ${flight.id}`}
          action={
            <>
              {error && (
                <Tooltip title={error}>
                  <IconButton>
                    <WarningIcon color="error" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Reset flight">
                <IconButton onClick={_ => this.props.resetFlight(flight)}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete flight">
                <IconButton onClick={_ => this.props.deleteFlight(flight)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
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
              value={(flight.notes && flight.notes.osd) || ""}
              name="osd"
              onChange={e => this.changeNotes(flight.id, e)}
              margin="normal"
            />

            <TextField
              id="location"
              label="Location"
              placeholder="Location"
              className={css.textField}
              value={(flight.notes && flight.notes.location) || ""}
              name="location"
              onChange={e => this.changeNotes(flight.id, e)}
              margin="normal"
            />
          </div>

          <FlightBatteries id={flight.id} />

          <div className={css.container}>
            <TextField
              id="jornal"
              label="Journal"
              placeholder="Journal"
              multiline
              className={css.textFieldWide}
              value={(flight.notes && flight.notes.journal) || ""}
              name="journal"
              onChange={e => this.changeNotes(flight.id, e)}
              margin="normal"
            />
          </div>

          {flight.videos &&
            flight.videos.map(video => (
              <Player key={video} src={"/videos/" + video}>
                <ControlBar autoHide={true} />
                <BigPlayButton position="center" />
              </Player>
            ))}
        </CardContent>
      </Card>
    );
  }

  public async componentWillMount() {
    // const flight = this.props.flights.find(f => f.id === this.props.id);
    this.props.fetchFlight(this.props.flight);
  }

  changeNotes = (flightId, event) =>
    this.props.save(flightId, {
      notes: { [event.target.name]: event.target.value }
    });
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  flight: getFlight(state, ownProps.id),
  isLoadingFlight: state.flights.isLoadingFlightDays,
  error: state.flights.error
});

const mapDispatchToProps = {
  fetchFlight: fetchFlight.request,
  resetFlight: resetFlight.request,
  deleteFlight: deleteFlight.request,
  save: (id, obj) => changeFlightFields({ ...obj, id })
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

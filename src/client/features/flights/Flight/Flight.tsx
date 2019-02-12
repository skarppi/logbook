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
  changeFlightFields,
  updateFlight
} from "../actions";
import { connect } from "react-redux";

import { FlightDate } from "./FlightDate";
import { FlightDuration } from "./FlightDuration";
import FlightBatteries from "./FlightBatteries";

import { Player, ControlBar, BigPlayButton } from "video-react";

const css = require("../../../common/Form.css");
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";
import { getFlight } from "../selectors";
import Loading from "../../loading/Loading/Loading";
import {
  insertBatteryCycle,
  updateBatteryCycle,
  deleteBatteryCycle
} from "../../batteries/actions";

export interface OwnProps {
  id: string;
}

export interface FlightDetailsProps {
  flight: Flight;
}

type AllProps = FlightDetailsProps & typeof mapDispatchToProps;

export const planes: { [key: string]: Plane } = {
  Reverb: {
    batterySlots: 1,
    batteries: ["cnhl1", "cnhl2", "tattu1", "tattu2", "tattu3", "tattu4"]
  },
  TWR: {
    batterySlots: 1,
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
    batterySlots: 2,
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

    return (
      <Card className={css.card}>
        <CardHeader
          title={`Flight: ${flight.id}`}
          action={
            <>
              <Loading
                actions={[
                  fetchFlight,
                  updateFlight,
                  resetFlight,
                  deleteFlight,
                  insertBatteryCycle,
                  updateBatteryCycle,
                  deleteBatteryCycle
                ]}
                overlay={false}
              />

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
    this.props.fetchFlight(this.props.flight);
  }

  changeNotes = (flightId, event) =>
    this.props.save(flightId, {
      notes: { [event.target.name]: event.target.value }
    });
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  flight: getFlight(state, ownProps.id)
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

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import * as React from "react";
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
import { FlightLocation } from "./FlightLocation";

import Videos from "../Videos/Videos";

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
  locations: string[];
}

type AllProps = FlightDetailsProps & typeof mapDispatchToProps;

export const planes: { [key: string]: Plane } = {
  Reverb: {
    batterySlots: 1,
    batteries: [
      "tattu1",
      "tattu2",
      "tattu3",
      "tattu4",
      "tattu5",
      "cnhl1",
      "cnhl2"
    ]
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
    const { flight, locations } = this.props;

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
          </div>

          <div className={css.container}>
            <TextField
              id="osd"
              label="OSD"
              placeholder="OSD"
              multiline
              className={css.textField}
              value={(flight.notes && flight.notes.osd) || ""}
              name="osd"
              onChange={e => this.saveNotes(flight.id, e)}
              margin="normal"
            />

            <FlightLocation
              flight={flight}
              locations={locations}
              saveNotes={this.saveNotes}
            />
          </div>

          <Divider variant="middle" />

          <FlightBatteries id={flight.id} />

          <div className={css.container}>
            <TextField
              id="jornal"
              label="Journal"
              placeholder="Journal"
              multiline
              className={`${css.textField} ${css.wide}`}
              value={(flight.notes && flight.notes.journal) || ""}
              name="journal"
              onChange={e => this.saveNotes(flight.id, e)}
              margin="normal"
            />
          </div>
          <Videos
            date={flight.startDate}
            plane={flight.plane}
            session={flight.session}
          />
        </CardContent>
      </Card>
    );
  }

  public async componentWillMount() {
    this.props.fetchFlight(this.props.flight);
  }

  saveNotes = (flightId, event) =>
    this.props.save(flightId, {
      notes: { [event.target.name]: event.target.value }
    });
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  flight: getFlight(state, ownProps.id),
  locations: state.flights.locations
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

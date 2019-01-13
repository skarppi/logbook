import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton
} from "@material-ui/core";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  formatDuration,
  formatTime,
  formatDate
} from "../../../shared/utils/date";
import TextField from "@material-ui/core/TextField";
import { FlightsState } from "../reducer";
import { RootState } from "../../store";
import { fetchFlight, deleteFlight } from "../actions";
import { connect } from "react-redux";

const css = require("./Flight.css");
import DeleteIcon from "@material-ui/icons/Delete";

interface LocalProps {}

export interface RouteParams {
  date: string;
  id: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams> &
  LocalProps;

class FlightDetails extends React.Component<AllProps> {
  public render() {
    const { flight, isLoadingFlight } = this.props;

    if (!flight) {
      return <div>Loading...</div>;
    }

    return (
      <Card>
        <CardHeader
          title={`Flight: ${flight.id}`}
          action={
            <IconButton onClick={_ => this.props.deleteFlight(flight)}>
              <DeleteIcon />
            </IconButton>
          }
        />
        <CardContent className={css.container}>
          <TextField
            required
            id="date"
            type="date"
            label="Date"
            value={formatDate(this.props.flight.startDate)}
            className={css.textField}
            margin="normal"
          />
          <TextField
            required
            id="start_time"
            type="time"
            label="Started"
            className={css.textField}
            value={formatTime(this.props.flight.startDate)}
            margin="normal"
          />
          <TextField
            required
            id="end_time"
            type="time"
            label="Stopped"
            className={css.textField}
            value={formatTime(this.props.flight.endDate)}
            margin="normal"
          />
          <TextField
            required
            id="duration"
            label="Duration"
            className={css.textField}
            value={formatDuration(this.props.flight.duration)}
            margin="normal"
          />

          <TextField
            id="armedTime"
            label="Armed time"
            className={css.textField}
            value={formatDuration(this.props.flight.armedTime)}
            margin="normal"
          />

          <TextField
            id="flightTime"
            label="Flight time"
            className={css.textField}
            value={formatDuration(this.props.flight.flightTime)}
            margin="normal"
          />

          <TextField
            id="filled-textarea"
            label="Journal"
            placeholder="Journal"
            multiline
            className={css.textField}
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
    console.log("mount", this.props);
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
  deleteFlight: deleteFlight.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { Table, TableRow, TableCell, TableBody } from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import {
  formatDuration,
  formatTime,
  formatDate
} from "../../../shared/utils/date";
import { FlightsState } from "../reducer";
import { RootState } from "../../store";
import { fetchFlight } from "../actions";
import { connect } from "react-redux";

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
        <CardHeader title={`Flight: ${flight.id}`} />
        <CardContent>
          <Typography variant="subheading">Id: {flight.id}</Typography>
          <Typography variant="subheading">Image Url: {flight.id}</Typography>
        </CardContent>
      </Card>
    );
  }

  public async componentWillMount() {
    console.log("MOUNT", this.props);

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
  fetchFlight: fetchFlight.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightDetails);

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody
} from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { fetchFlights } from "../actions";
import FlightsUpload from "./FlightsUpload";
import { FlightsState } from "../reducer";
import { connect } from "react-redux";
import { RootState } from "../../store";
import { formatDuration, formatDate } from "../../../shared/utils/date";

import FlightsOfTheDay from "./FlightsOfTheDay";

class FlightsList extends React.Component<
  FlightsState & typeof mapDispatchToProps
> {
  public render() {
    const { flightDays, isLoadingFlightDays } = this.props;

    if (isLoadingFlightDays) {
      return <div>Loading...</div>;
    }

    const rows = flightDays.map(flightDay => {
      const dayRow = (
        <TableRow key={String(flightDay.date)}>
          <TableCell>
            <NavLink to={`/flights/${flightDay.date}`}>
              {flightDay.date}
            </NavLink>
          </TableCell>
          <TableCell>{flightDay.flights}</TableCell>
          <TableCell>{flightDay.planes}</TableCell>
          <TableCell>{formatDuration(flightDay.flightTime)}</TableCell>
          <TableCell />
        </TableRow>
      );

      const flightsRow = (
        <Route
          key={flightDay.date + "-route"}
          path={"/flights/:date(" + flightDay.date + ")"}
          render={props => (
            <TableRow key={flightDay.date + "-flights"}>
              <TableCell colSpan={5}>
                <FlightsOfTheDay {...props} />
              </TableCell>
            </TableRow>
          )}
        />
      );

      return [dayRow, flightsRow];
    });

    return (
      <>
        <Grid item xs={12}>
          <FlightsUpload />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Flights List" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>Plane</TableCell>
                    <TableCell>Flight Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  public async componentWillMount() {
    this.props.fetchFlights();
  }
}

const mapStateToProps = (state: RootState) => ({
  flightDays: state.flights.flightDays,
  isLoadingFlightDays: state.flights.isLoadingFlightDays
});

const mapDispatchToProps = {
  fetchFlights: fetchFlights.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightsList);

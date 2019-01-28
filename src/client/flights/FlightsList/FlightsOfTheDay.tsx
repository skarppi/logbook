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
import { fetchFlightsPerDay } from "../actions";
import { connect } from "react-redux";
import FlightDetails from "../Flight/Flight";

interface RouteParams {
  date: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams>;

class FlightsOfTheDay extends React.Component<AllProps> {
  public render() {
    const { flightsOfTheDay, date } = this.props;

    const rows = flightsOfTheDay.map((flight, index) => {
      const flightRow = (
        <TableRow key={flight.id}>
          <TableCell>
            <NavLink
              to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}
            >
              {formatTime(flight.startDate)}
            </NavLink>
          </TableCell>
          <TableCell>{flightsOfTheDay.length - index}</TableCell>
          <TableCell>{flight.plane}</TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
          {flight.status && <TableCell>{flight.status}</TableCell>}
        </TableRow>
      );

      const detailsRow = (
        <Route
          exact
          key={flight.id + "-route"}
          path={
            "/flights/:date(" +
            this.props.match.params.date +
            ")/:id(" +
            flight.id +
            ")"
          }
          render={props => (
            <TableRow key={flight.id + "-details"}>
              <TableCell colSpan={5}>
                <FlightDetails {...props} />
              </TableCell>
            </TableRow>
          )}
        />
      );

      return [flightRow, detailsRow];
    });

    return (
      <Table>
        <TableBody>{rows}</TableBody>
      </Table>
    );
  }

  public async componentWillMount() {
    this.props.fetchFlightPerDay(this.props.match.params.date);
  }
}

const mapStateToProps = (state: RootState) => ({
  flightsOfTheDay: state.flights.flightsOfTheDay,
  isLoadingFlightsOfTheDay: state.flights.isLoadingFlightsOfTheDay
});

const mapDispatchToProps = {
  fetchFlightPerDay: fetchFlightsPerDay.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightsOfTheDay);

import { Table, TableRow, TableCell, TableBody } from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import {
  formatDuration,
  formatTime,
  formatDate
} from "../../../../shared/utils/date";
import classNames from "classnames";
import { FlightsState } from "../reducer";
import { RootState } from "../../../app";
import { fetchFlightsPerDay } from "../actions";
import { connect } from "react-redux";
import FlightDetails from "../Flight/Flight";

import ClosedIcon from "@material-ui/icons/ArrowRight";
import OpenedIcon from "@material-ui/icons/ArrowDropDown";

const css = require("./FlightOfTheDay.css");

interface RouteParams {
  date: string;
  id?: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams>;

class FlightsOfTheDay extends React.Component<AllProps> {
  public render() {
    const { flightsOfTheDay } = this.props;

    const path = `/flights/${this.props.match.params.date}`;

    const rows = flightsOfTheDay.map((flight, index) => {
      const current = this.props.match.params.id === flight.id;

      const detailsRow = current && (
        <TableRow key={flight.id + "-details"} className={css.opened}>
          <TableCell colSpan={5}>
            <FlightDetails id={flight.id} />
          </TableCell>
        </TableRow>
      );

      return (
        <>
          <TableRow key={flight.id}>
            <TableCell>
              <NavLink to={current ? path : `${path}/${flight.id}`}>
                {(current && <OpenedIcon />) || <ClosedIcon />}
                {formatTime(flight.startDate)}
              </NavLink>
            </TableCell>
            <TableCell>{flightsOfTheDay.length - index}</TableCell>
            <TableCell>
              {flight.plane} {flight.batteryIds && `(${flight.batteryIds})`}
            </TableCell>
            <TableCell>{formatDuration(flight.flightTime)}</TableCell>
            {flight.status && <TableCell>{flight.status}</TableCell>}
          </TableRow>
          {detailsRow}
        </>
      );
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

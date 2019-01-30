import { Table, TableRow, TableCell, TableBody } from "@material-ui/core";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { formatDuration, formatTime } from "../../../../shared/utils/date";
import { FlightsState } from "../reducer";
import { RootState } from "../../../app";
import { fetchFlights } from "../actions";
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
    const { flights, flightIds } = this.props;

    const path = `/flights/${this.props.match.params.date}`;

    const rows = flightIds.map((id, index) => {
      const flight = flights[id];
      const current = this.props.match.params.id === flight.id;

      const detailsRow = current && (
        <TableRow key={id + "-details"} className={css.opened}>
          <TableCell colSpan={5}>
            <FlightDetails id={id} />
          </TableCell>
        </TableRow>
      );

      return [
        <TableRow key={id}>
          <TableCell>
            <NavLink to={current ? path : `${path}/${id}`}>
              {(current && <OpenedIcon />) || <ClosedIcon />}
              {formatTime(flight.startDate)}
            </NavLink>
          </TableCell>
          <TableCell>{flightIds.length - index}</TableCell>
          <TableCell>
            {flight.plane} {flight.batteryIds && `(${flight.batteryIds})`}
          </TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
          {flight.status && <TableCell>{flight.status}</TableCell>}
        </TableRow>,
        detailsRow
      ];
    });

    return (
      <Table>
        <TableBody>{rows}</TableBody>
      </Table>
    );
  }

  public async componentWillMount() {
    this.props.fetchFlights(this.props.match.params.date);
  }
}

const mapStateToProps = (state: RootState) => ({
  flights: state.flights.flights,
  flightIds: state.flights.flightIds,
  isLoadingFlights: state.flights.isLoadingFlights
});

const mapDispatchToProps = {
  fetchFlights: fetchFlights.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightsOfTheDay);

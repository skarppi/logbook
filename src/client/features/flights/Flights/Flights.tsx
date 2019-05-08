import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
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
import Loading from "../../loading/Loading/Loading";

const css = require("./Flights.css");

interface RouteParams {
  date: string;
  id?: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams>;

class Flights extends React.Component<AllProps> {
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
              {formatTime(flight.startDate)}{" "}
              {flight.notes &&
                flight.notes.location &&
                `(${flight.notes.location})`}
            </NavLink>
          </TableCell>
          <TableCell>{flightIds.length - index}</TableCell>
          <TableCell>
            {flight.plane} {flight.batteryNames && `(${flight.batteryNames})`}
          </TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
          {flight.status && <TableCell>{flight.status}</TableCell>}
        </TableRow>,
        detailsRow
      ];
    });

    return (
      <div className={css.loadingParent}>
        <Table padding="none">
          <TableBody>{rows}</TableBody>
        </Table>
        <Loading actions={[fetchFlights]} overlay={true} />
      </div>
    );
  }

  public async componentWillMount() {
    this.props.fetchFlights(this.props.match.params.date);
  }
}

const mapStateToProps = (state: RootState) => ({
  flights: state.flights.flights,
  flightIds: state.flights.flightIds
});

const mapDispatchToProps = {
  fetchFlights: fetchFlights.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Flights);

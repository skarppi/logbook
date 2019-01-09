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

import { FlightsOfTheDay } from "./FlightsOfTheDay";

class FlightsList extends React.Component<
  FlightsState & typeof mapDispatchToProps
> {
  public render() {
    const { flights, isLoading } = this.props;

    if (isLoading) {
      return <div>Loading...</div>;
    }

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
                <TableBody>
                  {Object.keys(flights).map(date => (
                    <>
                      <TableRow key={date}>
                        <TableCell>
                          <NavLink to={`/flights/${date}`}>
                            {date === "upload"
                              ? "Uploaded"
                              : formatDate(new Date(date))}
                          </NavLink>
                        </TableCell>
                        <TableCell>{flights[date].length}</TableCell>
                        <TableCell>
                          {new Set(flights[date].map(flight => flight.plane))}
                        </TableCell>
                        <TableCell>
                          {formatDuration(
                            flights[date].reduce(
                              (time, flight) => time + flight.flightTime,
                              0
                            )
                          )}
                        </TableCell>
                        <TableCell />

                        {/* <TableCell>{flight.plane}</TableCell>
                      <TableCell>{formatDuration(flight.flightTime)}</TableCell>
                      <TableCell>{flight.status}</TableCell> */}
                      </TableRow>
                      <Route
                        key={date + "-flights"}
                        path={"/flights/" + date}
                        render={props => (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              children={FlightsOfTheDay(date, flights[date])}
                            />
                          </TableRow>
                        )}
                      />
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  public async componentDidMount() {
    this.props.fetchFlights();
  }
}

const mapStateToProps = (state: RootState) => ({
  flights: state.flights.flights,
  isLoading: state.flights.isLoading
});

const mapDispatchToProps = {
  fetchFlights: fetchFlights.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightsList);

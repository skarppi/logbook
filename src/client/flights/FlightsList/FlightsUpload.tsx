import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter
} from "@material-ui/core";
import * as React from "react";
import { addFlights } from "../actions";
import classNames from "classnames";
import Dropzone from "react-dropzone";
import { connect } from "react-redux";
import { NavLink, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Flight } from "../../../shared/flights/types";
import { uploadFlightsAPI } from "../../utils/api-facade";
import { RootState } from "../../store";
import { FlightsState } from "../reducer";
import FlightDetails from "../Flight/Flight";
import {
  formatDate,
  formatDuration,
  formatDateTime
} from "../../../shared/utils/date";

const css = require("./FlightsUpload.css");

interface LocalState {
  loaded: number;
  error?: string;
}

export interface RouteParams {
  id: string;
}

type AllProps = FlightsState &
  typeof mapDispatchToProps &
  RouteComponentProps<RouteParams> &
  LocalState;

class FlightsUpload extends React.Component<AllProps, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      loaded: 0,
      error: undefined
    };
    this.handleDrop = this.handleDrop.bind(this);
  }

  dropRendered(getRootProps, getInputProps, isDragActive) {
    return (
      <div
        {...getRootProps()}
        className={classNames(css.dropzone, {
          "dropzone--isActive": isDragActive
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <div>
            <p hidden={this.state.loaded > 0 || this.state.error !== undefined}>
              Drag and drop log files or <u>click</u>
            </p>
            <p
              hidden={this.state.loaded === 0 || this.state.error !== undefined}
            >
              Uploaded {this.state.loaded} %. Drag and drop more.
            </p>
            <p hidden={this.state.error === undefined}>
              Failed with message "{this.state.error}". Try again.
            </p>
          </div>
        )}
      </div>
    );
  }

  public render() {
    const { flightsOfTheDay } = this.props;

    const rows = flightsOfTheDay.map((flight, index) => {
      const flightRow = (
        <TableRow key={flight.id}>
          <TableCell>
            <NavLink
              to={`/upload/${formatDate(flight.startDate)}/${flight.id}`}
            >
              {formatDateTime(flight.startDate)}
            </NavLink>
          </TableCell>
          <TableCell>{flightsOfTheDay.length - index}</TableCell>
          <TableCell>{flight.plane}</TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
          <TableCell>{flight.status}</TableCell>
        </TableRow>
      );

      const detailsRow = (
        <Route
          exact
          key={flight.id + "-route"}
          path={
            "/upload/:date(" +
            formatDate(flight.startDate) +
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
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Upload New Flights" />
            <CardContent>
              <Dropzone onDrop={this.handleDrop}>
                {({ getRootProps, getInputProps, isDragActive }) =>
                  this.dropRendered(getRootProps, getInputProps, isDragActive)
                }
              </Dropzone>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Uploaded Flights" />
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
                <TableFooter className={css.footer}>
                  <TableRow>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>{flightsOfTheDay.length}</TableCell>
                    <TableCell />
                    <TableCell>
                      {formatDuration(
                        flightsOfTheDay.reduce(
                          (total, flight) => total + flight.flightTime,
                          0
                        )
                      )}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  private handleDrop(files: File[]) {
    this.setState({ loaded: 0, error: undefined });

    const data = new FormData();
    files.forEach(file => data.append("flight", file, file.name));

    uploadFlightsAPI(data, (progressEvent: any) => {
      this.setState({
        loaded: (progressEvent.loaded / progressEvent.total) * 100
      });
    })
      .then(res => {
        const flights = res.data as Flight[];
        this.props.addFlights(
          flights.map(f => {
            f.status = res.statusText;
            return f;
          })
        );
      })
      .catch(err => {
        console.log(err);
        this.setState({
          error: (err.response && err.response.data) || err.message
        });
      });
  }
}

const mapStateToProps = (state: RootState) => ({
  flightsOfTheDay: state.flights.flightsOfTheDay,
  flightDays: state.flights.flightDays
});

const mapDispatchToProps = {
  addFlights: addFlights
};

export default connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(FlightsUpload);

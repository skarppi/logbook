import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem
} from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { fetchFlights } from "../actions";
import { Flight } from "../Flight/Flight";
import FlightsUpload from "./FlightsUpload";
import { FlightsState } from "../reducer";
import { connect } from "react-redux";
import { RootState } from "../../store";

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
              <List>
                {flights.map(flight => (
                  <ListItem key={flight.id}>
                    <NavLink to={`/flights/${flight.id}`}>{flight.id}</NavLink>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Route
            exact
            path="/flights/:id"
            render={props => (
              <Flight flight={this.getFlightById(props.match.params.id)} />
            )}
          />
        </Grid>
      </>
    );
  }

  public async componentDidMount() {
    this.props.fetchFlights();
  }

  private getFlightById(id) {
    return this.props.flights.find(u => u.id === id);
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

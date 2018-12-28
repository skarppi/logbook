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
import { IFlight } from "../../../shared/IFlight";
import { loadFlightsAPI } from "../../utils/api-facade";
import { Flight } from "../Flight/Flight";
import { FlightsUpload } from "./FlightsUpload";

interface IState {
  flights: IFlight[];
  isLoading: boolean;
}

export class FlightsList extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      flights: [],
      isLoading: true
    };
  }

  public render() {
    if (this.state.isLoading) {
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
                {this.state.flights.map(flight => (
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
    const flights = await loadFlightsAPI();
    this.setState({ flights, isLoading: false });
  }

  private getFlightById(id) {
    return this.state.flights.find(u => u.id === id);
  }
}

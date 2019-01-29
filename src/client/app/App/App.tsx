import { Grid } from "@material-ui/core";
import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
// Pages
import { Header } from "../Header/Header";
import Dashboard from "../../features/dashboard/Home/Home";
import FlightsList from "../../features/flights/FlightsList/FlightsList";
import BatteriesList from "../../features/batteries/BatteriesList/Batteries";
import FlightsUpload from "../../features/flights/FlightsList/FlightsUpload";

export const App = () => (
  <BrowserRouter>
    <div>
      <Grid container spacing={24}>
        <Header />
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/flights" component={FlightsList} />
          <Route path="/batteries" component={BatteriesList} />
          <Route path="/upload" component={FlightsUpload} />
        </Switch>
      </Grid>
    </div>
  </BrowserRouter>
);

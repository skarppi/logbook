import { Grid } from "@material-ui/core";
import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
// Pages
import { Header } from "./Header/Header";
import { Home } from "./Home/Home";
import FlightsList from "../flights/FlightsList/FlightsList";

export const App = () => (
  <BrowserRouter>
    <div>
      <Grid container spacing={24}>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/flights" component={FlightsList} />
        </Switch>
      </Grid>
    </div>
  </BrowserRouter>
);

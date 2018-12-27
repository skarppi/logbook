import { Grid } from "@material-ui/core";
import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
// Pages
import { Header } from "./components/Header/Header";
import { Home } from "./components/Home/Home";
import { FlightsList } from "./components/FlightsList/FlightsList";

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

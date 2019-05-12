import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// Pages
import { Header } from '../Header/Header';
import { Dashboard } from '../../features/dashboard/Home/Home';
import { FlightDays } from '../../features/flights/Days/FlightDays';
import { BatteriesList } from '../../features/batteries/BatteriesList/Batteries';
import { FlightsUpload } from '../../features/flights/Upload/FlightsUpload';

export const App = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <div>
      <Grid container spacing={24}>
        <Header />
        <Switch>
          <Route exact path='/' component={Dashboard} />
          <Route path='/flights/:date?/:id?' component={FlightDays} />
          <Route path='/batteries/:id?' component={BatteriesList} />
          <Route path='/upload/:id?' component={FlightsUpload} />
        </Switch>
      </Grid>
    </div>
  </BrowserRouter>
);

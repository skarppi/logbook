import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// Pages
import { Header } from '../Header/Header';
import { Dashboard } from '../../features/dashboard/Home/Home';
import { FlightDays } from '../../features/flights/Days/FlightDays';
import { PlanesList } from '../../features/planes/PlanesList/Planes';
import { BatteriesList } from '../../features/batteries/BatteriesList/Batteries';
import { LocationsList } from '../../features/locations/LocationsList/Locations';
import { FlightsUpload } from '../../features/flights/Upload/FlightsUpload';

export const App = () => (
  <BrowserRouter basename={process.env.PUBLIC_PATH}>
    <div>
      <Grid container spacing={6}>
        <Header />
        <Switch>
          <Route exact path='/' component={Dashboard} />
          <Route path='/flights/:date?/:id?' component={FlightDays} />
          <Route path='/planes/:id?' component={PlanesList} />
          <Route path='/batteries/:id?' component={BatteriesList} />
          <Route path='/locations/:id?' component={LocationsList} />
          <Route path='/upload/:id?' component={FlightsUpload} />
        </Switch>
      </Grid>
    </div>
  </BrowserRouter>
);

import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// Pages
import { Header } from '../Header/Header';
import { Dashboard } from '../../features/dashboard/Home/Home';
import FlightDays from '../../features/flights/Days/FlightDays';
import { BatteriesList } from '../../features/batteries/BatteriesList/Batteries';
import { FlightsUpload } from '../../features/flights/Upload/FlightsUpload';
import { ConnectedRouter } from 'connected-react-router';

interface AppProps {
  history: History;
}

export const App = ({ history }: AppProps) => (
  <ConnectedRouter history={history}>
    <div>
      <Grid container spacing={24}>
        <Header />
        <Switch>
          <Route exact path='/' component={Dashboard} />
          <Route path='/flights/:date?' component={FlightDays} />
          <Route path='/batteries/:id?' component={BatteriesList} />
          <Route path='/upload/:id?' component={FlightsUpload} />
        </Switch>
      </Grid>
    </div>
  </ConnectedRouter>
);

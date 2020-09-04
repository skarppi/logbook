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
import Container from '@material-ui/core/Container';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import { Toolbar, makeStyles, AppBar, Box, IconButton, Typography, Button } from '@material-ui/core';
import MenuIcon from "@material-ui/icons/Menu";


const breakpoints = createBreakpoints({});

const mobilePaddingNone = {
  [breakpoints.down('xs')]: {
    padding: 0
  }
};

const mobilePaddingReduced = {
  [breakpoints.down('xs')]: {
    padding: 10
  }
}

const theme = createMuiTheme({
  overrides: {
    MuiCardHeader: { root: mobilePaddingNone },
    MuiCardContent: { root: mobilePaddingNone },
    MuiExpansionPanelSummary: { root: mobilePaddingReduced },
    MuiExpansionPanelDetails: { root: mobilePaddingReduced },
    MuiTableCell: {
      root: {
        // less empty space when on mobile
        'paddingLeft': '0.2em',
        'paddingRight': '0.2em',

        // links have no decoration
        '& a': {
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit'
        }
      }
    },
    MuiFormControl: {
      root: {
        marginLeft: '0px',
        marginRight: '10px',
      }
    },
    MuiInputBase: {
      input: {
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          'margin': 0
        }
      }
    }
  }
});

const useStyles = makeStyles(theme => ({
  offset: theme.mixins.toolbar,
}))

export const App = () => {
  const classes = useStyles();
  return <BrowserRouter basename={process.env.PUBLIC_PATH}>
    <ThemeProvider theme={theme}>
      <Header />
      <Container disableGutters={true}>
        <Switch>
          <Route exact path='/' component={Dashboard} />
          <Route path='/flights/:date?/:id?' component={FlightDays} />
          <Route path='/planes/:id?' component={PlanesList} />
          <Route path='/batteries/:id?' component={BatteriesList} />
          <Route path='/locations/:id?' component={LocationsList} />
          <Route path='/upload/:id?' component={FlightsUpload} />
        </Switch>
      </Container>
    </ThemeProvider>
  </BrowserRouter >
};

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LinkProps } from '@material-ui/core/Link';

const link = (url: string) => React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) => <Link to={url} {...props} ref={ref} />);

export const Header = () => (
  <AppBar position='static' color='transparent'>
    <Toolbar>
      <Button color='primary' component={link('/')}>
        Home
      </Button>
      <Button
        color='primary'
        component={link('/flights')}
      >
        Flights
      </Button>

      <Button
        color='primary'
        component={link('/planes')}
      >
        Planes
      </Button>

      <Button
        color='primary'
        component={link('/batteries')}
      >
        Batteries
      </Button>

      <Button
        color='primary'
        component={link('/locations')}
      >
        Locations
      </Button>

      <Button
        color='primary'
        component={link('/upload')}
      >
        Upload
      </Button>
    </Toolbar>
  </AppBar>
);

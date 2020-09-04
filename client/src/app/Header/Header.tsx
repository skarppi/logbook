import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LinkProps } from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Container from '@material-ui/core/Container';

import HomeIcon from '@material-ui/icons/Home';
import FlightsIcon from '@material-ui/icons/List';
import PlanesIcon from '@material-ui/icons/AirplanemodeActive';
import BatteriesIcon from '@material-ui/icons/BatteryChargingFull';
import LocationIcon from '@material-ui/icons/LocationOn';
import UploadIcon from '@material-ui/icons/CloudUpload';

const link = (url: string) => React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) => <Link to={url} {...props} ref={ref} />);

const useStyles = makeStyles(theme => ({
  bar: {
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    }
  },
  button: {
    minWidth: '1em',
    [theme.breakpoints.down('xs')]: {
      width: '15%',
    }
  },
  text: {
    marginLeft: '0.2em',
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    }
  }
}
));

const ToolBarButton = ({ url, text, Icon }) => {
  const css = useStyles();

  return <Button
    color='inherit'
    component={link(url)}
    classes={{ root: css.button }}
  >
    <Icon />
    <Typography variant='button' className={css.text}>{text}</Typography>
  </Button >;
};

export const Header = () => {
  const css = useStyles();

  return <>
    <AppBar position='fixed' >
      <Container disableGutters={true}>
        <Toolbar classes={{ gutters: css.bar }}>
          <ToolBarButton url='/' text='Home' Icon={HomeIcon} />

          <ToolBarButton url='/flights' text='Flights' Icon={FlightsIcon} />

          <ToolBarButton url='/planes' text='Planes' Icon={PlanesIcon} />

          <ToolBarButton url='/batteries' text='Batteries' Icon={BatteriesIcon} />

          <ToolBarButton url='/locations' text='Locations' Icon={LocationIcon} />

          <ToolBarButton url='/upload' text='Upload' Icon={UploadIcon} />
        </Toolbar>
      </Container>
    </AppBar>
    <Toolbar />
  </>;
};

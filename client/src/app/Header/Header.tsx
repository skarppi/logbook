import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LinkProps } from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

import HomeIcon from '@material-ui/icons/Home';
import FlightsIcon from '@material-ui/icons/List';
import PlanesIcon from '@material-ui/icons/AirplanemodeActive';
import BatteriesIcon from '@material-ui/icons/BatteryChargingFull';
import LocationIcon from '@material-ui/icons/LocationOn';
import UploadIcon from '@material-ui/icons/CloudUpload';


const link = (url: string) => React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) => <Link to={url} {...props} ref={ref} />);

const ToolBarButton = ({ url, text, Icon }) => {
  const css = useStyles();

  return <Button
    color='primary'
    component={link(url)}
  >
    <Icon className={css.icon} />
    <Typography variant='button' className={css.text}>{text}</Typography>
  </Button>;
};

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  text: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    }
  }
}
));

export const Header = () => {
  const css = useStyles();

  return <AppBar position='static' color='transparent'>
    <Toolbar>
      <ToolBarButton url='/' text='Home' Icon={HomeIcon} />

      <ToolBarButton url='/flights' text='Batteries' Icon={BatteriesIcon} />

      <ToolBarButton url='/planes' text='Planes' Icon={PlanesIcon} />

      <ToolBarButton url='/batteries' text='Batteries' Icon={BatteriesIcon} />

      <ToolBarButton url='/locations' text='Locations' Icon={LocationIcon} />

      <ToolBarButton url='/upload' text='Upload' Icon={UploadIcon} />
    </Toolbar>
  </AppBar>;
};

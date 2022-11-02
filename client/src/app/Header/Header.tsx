import AppBar from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import { Link } from "react-router-dom";
import { LinkProps } from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import HomeIcon from "@mui/icons-material/Home";
import FlightsIcon from "@mui/icons-material/List";
import PlanesIcon from "@mui/icons-material/AirplanemodeActive";
import BatteriesIcon from "@mui/icons-material/BatteryChargingFull";
import LocationIcon from "@mui/icons-material/LocationOn";
import UploadIcon from "@mui/icons-material/CloudUpload";

const PREFIX = "Header";

const classes = {
  bar: `${PREFIX}-bar`,
  button: `${PREFIX}-button`,
  text: `${PREFIX}-text`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
  [`& .${classes.bar}`]: {
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
    },
  },

  [`& .${classes.button}`]: {
    minWidth: "1em",
    [theme.breakpoints.down("sm")]: {
      width: "15%",
    },
  },

  [`& .${classes.text}`]: {
    marginLeft: "0.2em",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const ToolBarButton = ({
  url,
  text,
  icon,
}: {
  url: string;
  text: String;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      color="inherit"
      component={Link}
      to={url}
      classes={{ root: classes.button }}
    >
      {icon}
      <Typography variant="button" className={classes.text}>
        {text}
      </Typography>
    </Button>
  );
};

export const Header = () => {
  return (
    <Root>
      <AppBar position="fixed">
        <Container disableGutters={true}>
          <Toolbar classes={{ gutters: classes.bar }}>
            <ToolBarButton url="/" text="Home" icon={<HomeIcon />} />

            <ToolBarButton
              url="/flights"
              text="Flights"
              icon={<FlightsIcon />}
            />

            <ToolBarButton url="/planes" text="Planes" icon={<PlanesIcon />} />

            <ToolBarButton
              url="/batteries"
              text="Batteries"
              icon={<BatteriesIcon />}
            />

            <ToolBarButton
              url="/locations"
              text="Locations"
              icon={<LocationIcon />}
            />

            <ToolBarButton url="/upload" text="Upload" icon={<UploadIcon />} />
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
    </Root>
  );
};

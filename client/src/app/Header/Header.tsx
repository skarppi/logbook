import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import HomeIcon from "@mui/icons-material/Home";
import FlightsIcon from "@mui/icons-material/List";
import PlanesIcon from "@mui/icons-material/AirplanemodeActive";
import BatteriesIcon from "@mui/icons-material/BatteryChargingFull";
import LocationIcon from "@mui/icons-material/LocationOn";
import UploadIcon from "@mui/icons-material/CloudUpload";

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
    <Button color="inherit" component={Link} to={url}>
      {icon}
      <Typography
        variant="button"
        sx={{
          marginLeft: "0.2em",
          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        {text}
      </Typography>
    </Button>
  );
};

export const Header = () => {
  return (
    <>
      <AppBar position="fixed">
        <Container disableGutters={true}>
          <Toolbar disableGutters={true}>
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
    </>
  );
};

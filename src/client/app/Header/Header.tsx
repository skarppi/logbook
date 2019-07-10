import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import * as React from "react";
import { Link } from "react-router-dom";

export const Header = () => (
  <AppBar position="static" color="default">
    <Toolbar>
      <Button color="primary" component={(p: any) => <Link to="/" {...p} />}>
        Home
      </Button>
      <Button
        color="primary"
        component={(p: any) => <Link to="/flights" {...p} />}
      >
        Flights
      </Button>

      <Button
        color="primary"
        component={(p: any) => <Link to="/planes" {...p} />}
      >
        Planes
      </Button>

      <Button
        color="primary"
        component={(p: any) => <Link to="/batteries" {...p} />}
      >
        Batteries
      </Button>

      <Button
        color="primary"
        component={(p: any) => <Link to="/upload" {...p} />}
      >
        Upload
      </Button>
    </Toolbar>
  </AppBar>
);

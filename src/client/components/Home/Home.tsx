import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";

const css = require("./Home.css");
const logoImg = require("../../../../assets/images/logo.png");

export const Home = () => (
  <Grid item xs={12}>
    <Card>
      <CardHeader title="OpenTX Logbook" />
      <CardContent>
        <Typography variant="subheading">
          Flight logbook from OpenTX logs
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

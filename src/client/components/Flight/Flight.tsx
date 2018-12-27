import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import * as React from "react";
import { IFlight } from "../../../shared/IFlight";

interface IProps {
  flight: IFlight;
}

export const Flight: React.StatelessComponent<IProps> = (props: IProps) => (
  <Card>
    <CardHeader title={`Flight: ${props.flight.id}`} />
    <CardContent>
      <Typography variant="subheading">Id: {props.flight.id}</Typography>
      <Typography variant="subheading">Image Url: {props.flight.id}</Typography>
    </CardContent>
  </Card>
);

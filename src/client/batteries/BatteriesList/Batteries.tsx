import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody
} from "@material-ui/core";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { fetchBatteries } from "../actions";
import { connect } from "react-redux";
import { RootState } from "../../store";
import { formatDate, formatDateTime } from "../../../shared/utils/date";
import { Battery } from "../../../shared/batteries/types";

interface BatteryProps {
  batteries: { [key: string]: Battery };
  isLoadingBatteries: boolean;
}

class BatteriesList extends React.Component<
  BatteryProps & typeof mapDispatchToProps
> {
  lastUsed(battery) {
    if (!battery.lastCycle) {
      return;
    }
    const timestamp = formatDateTime(battery.lastCycle.date);

    if (!battery.lastCycle.flightId) {
      return timestamp;
    }

    return (
      <NavLink
        to={`/flights/${formatDate(battery.lastCycle.date)}/${
          battery.lastCycle.flightId
        }`}
      >
        {timestamp}
      </NavLink>
    );
  }

  public render() {
    const { batteries, isLoadingBatteries } = this.props;

    if (isLoadingBatteries) {
      return <div>Loading...</div>;
    }

    const rows = Object.keys(batteries).map(id => {
      const battery = batteries[id];
      return (
        <TableRow key={String(id)}>
          <TableCell>
            <NavLink to={`/batteries/${id}`}>{id}</NavLink>
          </TableCell>
          <TableCell>
            {battery.type} {battery.cells}s {battery.capacity}mAh
          </TableCell>
          <TableCell>{battery.lastCycle && battery.lastCycle.state}</TableCell>
          <TableCell>{this.lastUsed(battery)}</TableCell>
        </TableRow>
      );
    });

    return (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Batteries" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Current status</TableCell>
                    <TableCell>Last used</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  public async componentWillMount() {
    this.props.fetchBatteries();
  }
}

const mapStateToProps = (state: RootState) => ({
  batteries: state.batteries.batteries,
  isLoadingBatteries: state.batteries.isLoadingBatteries
});

const mapDispatchToProps = {
  fetchBatteries: fetchBatteries.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(BatteriesList);

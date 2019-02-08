import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Tooltip
} from "@material-ui/core";
import * as React from "react";
import { NavLink, Route, Link } from "react-router-dom";
import { fetchBatteries, insertBatteryCycle } from "../actions";
import { connect } from "react-redux";
import { RootState } from "../../../app";
import { formatDate, formatDateTime } from "../../../../shared/utils/date";
import { Battery } from "../../../../shared/batteries/types";
import Loading from "../../loading/Loading/Loading";

import NewBatteryIcon from "@material-ui/icons/Add";
import FullChargeIcon from "@material-ui/icons/BatteryChargingFull";
import StorageChargeIcon from "@material-ui/icons/BatteryCharging50";
import { BatteryState } from "../../../../shared/batteries";

const css = require("./Batteries.css");

interface BatteryProps {
  batteries: { [key: string]: Battery };
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

  batteryOps(battery) {
    if (!battery.lastCycle) {
      return;
    }

    return (
      <>
        <IconButton
          onClick={_ => this.charge(battery.name, BatteryState.storage)}
        >
          <StorageChargeIcon />
        </IconButton>
        <IconButton
          onClick={_ => this.charge(battery.name, BatteryState.charged)}
        >
          <FullChargeIcon />
        </IconButton>
      </>
    );
  }

  charge = (name, state) => {
    this.props.insertBatteryCycle({
      id: -1,
      date: new Date(),
      batteryName: name,
      flightId: null,
      state: state,
      voltage: null,
      discharged: null,
      charged: null
    });
  };

  public render() {
    const { batteries } = this.props;

    const rows = Object.keys(batteries).map(id => {
      const battery = batteries[id];
      return [
        <TableRow key={String(id)}>
          <TableCell>
            <NavLink to={`/batteries/${id}`}>{battery.name}</NavLink>
          </TableCell>
          <TableCell>
            {battery.type} {battery.cells}s {battery.capacity}mAh
          </TableCell>
          <TableCell>{battery.lastCycle && battery.lastCycle.state}</TableCell>
          <TableCell>{this.lastUsed(battery)}</TableCell>
          <TableCell>{this.batteryOps(battery)}</TableCell>
        </TableRow>
      ];
    });

    const AddLink = props => <Link to="/batteries/add" {...props} />;

    return (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Batteries"
              action={
                <Tooltip title="Add new battery">
                  <IconButton component={AddLink}>
                    <NewBatteryIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent className={css.loadingParent}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Current status</TableCell>
                    <TableCell>Last used</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
              </Table>
              <Loading actions={[fetchBatteries]} overlay={true} />
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
  batteries: state.batteries.batteries
});

const mapDispatchToProps = {
  fetchBatteries: fetchBatteries.request,
  insertBatteryCycle: insertBatteryCycle.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(BatteriesList);

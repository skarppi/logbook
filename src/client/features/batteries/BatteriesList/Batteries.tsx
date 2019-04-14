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
import { RouteComponentProps } from "react-router";
import { fetchBatteries, insertBatteryCycle } from "../actions";
import { connect } from "react-redux";
import { RootState } from "../../../app";
import { formatDate, formatDateTime } from "../../../../shared/utils/date";
import { Battery } from "../../../../shared/batteries/types";
import Loading from "../../loading/Loading/Loading";
import BatteryDetails from "../Battery/Battery";

import ClosedIcon from "@material-ui/icons/KeyboardArrowRight";
import OpenedIcon from "@material-ui/icons/KeyboardArrowDown";

import NewBatteryIcon from "@material-ui/icons/Add";
import FullChargeIcon from "@material-ui/icons/BatteryChargingFull";
import StorageChargeIcon from "@material-ui/icons/BatteryCharging50";
import { BatteryState } from "../../../../shared/batteries";

const css = require("./Batteries.css");

interface RouteParams {
  id: number;
}

interface BatteryProps {
  batteries: { [key: string]: Battery };
}

class BatteriesList extends React.Component<
  BatteryProps & typeof mapDispatchToProps & RouteComponentProps<RouteParams>
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

  details(id: number, path: string) {
    if (this.props.match.params.id === path) {
      return (<TableRow key={id + "-battery"} className={css.opened}>
        <TableCell colSpan={5}>
          <BatteryDetails id={id} />
        </TableCell>
      </TableRow>)
    } else {
      return (<></>);
    }
  }

  public render() {
    const { batteries } = this.props;

    const rows = Object.keys(batteries).map(id => {
      const battery = batteries[id];
      const current = this.props.match.params.id === id;
      return [
        <TableRow key={String(id)}>
          <TableCell>
            {(current && <NavLink to={'/batteries'}>
              <OpenedIcon />
              {battery.name}
            </NavLink>) || <NavLink to={`/batteries/${id}`}>
                <ClosedIcon />
                {battery.name}
              </NavLink>}
          </TableCell>
          <TableCell>
            {battery.type} {battery.cells}s {battery.capacity}mAh
          </TableCell>
          <TableCell>{battery.lastCycle && battery.lastCycle.state}</TableCell>
          <TableCell>{this.lastUsed(battery)}</TableCell>
          <TableCell>{this.batteryOps(battery)}</TableCell>
        </TableRow>,
        this.details(battery.id, `${battery.id}`)
      ];
    });

    const AddLink = props => <Link to="/batteries/add" {...props} />;

    return (
      <>
        <Grid item xs={12} className={css.grid}>
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
              <Table padding="none">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Current status</TableCell>
                    <TableCell>Last used</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.details(-1, "add")}
                  {rows}
                </TableBody>
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

import * as React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  Input,
  MenuItem,
  IconButton,
  InputAdornment
} from "@material-ui/core";
import { Flight } from "../../../../shared/flights/types";
import { BatteryCycle } from "../../../../shared/batteries/types";
import { planes } from "./Flight";
const css = require("./Flight.css");

import FullChargeIcon from "@material-ui/icons/BatteryChargingFull";
import StorageChargeIcon from "@material-ui/icons/BatteryCharging50";
import EmptyChargeIcon from "@material-ui/icons/BatteryCharging20Rounded";
import ClearIcon from "@material-ui/icons/Clear";
import { BatteryState } from "../../../../shared/batteries";

interface BatteryProps {
  flight: Flight;
  battery: BatteryCycle;
  update: (object) => {};
  delete: (object) => {};
}

interface LocalState {
  battery: BatteryCycle;
}

export class FlightBattery extends React.Component<BatteryProps, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      battery: this.props.battery
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        battery: nextProps.battery
      });
    }
  }

  changeBattery = event => {
    this.setState({
      battery: {
        ...this.state.battery,
        [event.target.name]: event.target.value
      }
    } as any);
  };

  storeBatteryState = state => {
    this.props.update({
      ...this.state.battery,
      state: state
    });
  };

  storeBattery = _ => this.props.update(this.state.battery);

  removeBattery = _ => this.props.delete(this.state.battery);

  render() {
    const { flight } = this.props;
    const { battery } = this.state;

    return (
      <div key={battery.id} className={css.container}>
        <FormControl className={css.formControl} margin="normal">
          <InputLabel htmlFor="select-multiple-checkbox">Battery</InputLabel>
          <Select
            value={battery.batteryId || ""}
            name={"batteryId"}
            onChange={this.changeBattery}
            onBlur={this.storeBattery}
            input={<Input id="select-multiple-checkbox" />}
          >
            {planes[flight.plane].batteries.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="discharged"
          label="Fuel"
          placeholder="Used"
          className={css.textFieldNarrow}
          value={battery.discharged || ""}
          name={"discharged"}
          type="number"
          onChange={this.changeBattery}
          onBlur={this.storeBattery}
          InputProps={{
            endAdornment: <InputAdornment position="end">mAh</InputAdornment>
          }}
          margin="normal"
        />
        <TextField
          id="resting"
          label="Resting"
          placeholder="Resting"
          className={css.textFieldNarrow}
          value={battery.voltage || ""}
          name={"voltage"}
          type="number"
          onChange={this.changeBattery}
          onBlur={this.storeBattery}
          InputProps={{
            endAdornment: <InputAdornment position="end">V</InputAdornment>
          }}
          margin="normal"
        />

        <IconButton
          onClick={_ => this.storeBatteryState(BatteryState.discharged)}
          color={
            this.state.battery.state === BatteryState.discharged
              ? "primary"
              : "default"
          }
        >
          <EmptyChargeIcon />
        </IconButton>

        <IconButton
          onClick={_ => this.storeBatteryState(BatteryState.storage)}
          color={
            this.state.battery.state === BatteryState.storage
              ? "primary"
              : "default"
          }
        >
          <StorageChargeIcon />
        </IconButton>
        <IconButton
          onClick={_ => this.storeBatteryState(BatteryState.charged)}
          color={
            this.state.battery.state === BatteryState.charged
              ? "primary"
              : "default"
          }
        >
          <FullChargeIcon />
        </IconButton>

        {this.state.battery.state === BatteryState.charged && (
          <TextField
            id="charged"
            label="Charged"
            placeholder="Charged"
            className={css.textFieldNarrow}
            value={battery.charged || ""}
            name={"charged"}
            type="number"
            onChange={this.changeBattery}
            onBlur={this.storeBattery}
            margin="normal"
            InputProps={{
              endAdornment: <InputAdornment position="end">mAh</InputAdornment>
            }}
          />
        )}

        <IconButton onClick={this.removeBattery}>
          <ClearIcon />
        </IconButton>
      </div>
    );
  }
}

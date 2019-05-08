import * as React from "react";
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { Flight } from "../../../../shared/flights/types";
import { Battery, BatteryCycle } from "../../../../shared/batteries/types";
import { planes } from "./Flight";
const css = require("../../../common/Form.css");

import FullChargeIcon from "@material-ui/icons/BatteryChargingFull";
import StorageChargeIcon from "@material-ui/icons/BatteryCharging50";
import EmptyChargeIcon from "@material-ui/icons/BatteryCharging20Rounded";
import ClearIcon from "@material-ui/icons/Clear";
import { BatteryState } from "../../../../shared/batteries";

interface BatteryProps {
  flight: Flight;
  cycle: BatteryCycle;
  battery: Battery;
  update: (object) => {};
  delete: (object) => {};
}

interface LocalState {
  cycle: BatteryCycle;
}

class FlightBattery extends React.Component<BatteryProps, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      cycle: this.props.cycle
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        cycle: nextProps.cycle
      });
    }
  }

  changeBattery = event => {
    this.setState({
      cycle: {
        ...this.state.cycle,
        [event.target.name]: event.target.value
      }
    } as any);
  };

  changeBatteryResistance = (index, value) => {
    const { battery } = this.props;

    console.log("RESI " + index + " to " + value);

    const resistances =
      (this.state.cycle.resistance && [...this.state.cycle.resistance]) ||
      Array(battery.cells).fill("");

    if (resistances.length < battery.cells) {
      resistances.push(Array(battery.cells - resistances.length).fill(""));
    }

    resistances.splice(index, 1, value);

    this.setState({
      cycle: {
        ...this.state.cycle,
        resistance: resistances
      }
    } as any);
  };

  storeBatteryState = state => {
    this.props.update({
      ...this.state.cycle,
      state: state
    });
  };

  storeBattery = _ => this.props.update(this.state.cycle);

  removeBattery = _ => this.props.delete(this.state.cycle);

  renderResistance(index: number) {
    const { cycle } = this.state;

    return (
      <TextField
        key={`resistance-${index}`}
        label={`Cell ${index + 1}`}
        placeholder={`Cell ${index + 1}`}
        className={`${css.textField} ${css.tiny}`}
        value={
          (cycle.resistance &&
            cycle.resistance.length >= index &&
            cycle.resistance[index]) ||
          ""
        }
        name={"resistance"}
        type="number"
        onChange={e => this.changeBatteryResistance(index, e.target.value)}
        onBlur={this.storeBattery}
        margin="normal"
        InputProps={{
          endAdornment: <InputAdornment position="end">Ω</InputAdornment>
        }}
      />
    );
  }

  render() {
    const { flight, battery } = this.props;
    const { cycle } = this.state;

    if (!battery) {
      return <></>;
    }

    const resistances = Array(battery.cells)
      .fill("")
      .map((_, index) => {
        return this.renderResistance(index);
      });

    return (
      <ExpansionPanel
        key={cycle.id}
        expanded={this.state.cycle.state === BatteryState.charged}
        className={css.container}
      >
        <ExpansionPanelSummary classes={{ root: css.zero }}>
          <FormControl className={css.formControl} margin="normal">
            <InputLabel htmlFor="select-multiple-checkbox" shrink>
              Battery
            </InputLabel>
            <Select
              value={cycle.batteryName || ""}
              name={"batteryName"}
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
            label="Used"
            className={`${css.textField} ${css.narrow}`}
            value={cycle.discharged || ""}
            name={"discharged"}
            type="number"
            onChange={this.changeBattery}
            onBlur={this.storeBattery}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: <InputAdornment position="end">mAh</InputAdornment>
            }}
            margin="normal"
          />
          <TextField
            id="resting"
            label="Resting"
            className={`${css.textField} ${css.narrow}`}
            value={cycle.voltage || ""}
            name={"voltage"}
            type="number"
            onChange={this.changeBattery}
            onBlur={this.storeBattery}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: <InputAdornment position="end">V</InputAdornment>
            }}
            margin="normal"
          />

          <IconButton
            onClick={_ => this.storeBatteryState(BatteryState.discharged)}
            color={
              this.state.cycle.state === BatteryState.discharged
                ? "primary"
                : "default"
            }
          >
            <EmptyChargeIcon />
          </IconButton>

          <IconButton
            onClick={_ => this.storeBatteryState(BatteryState.storage)}
            color={
              this.state.cycle.state === BatteryState.storage
                ? "primary"
                : "default"
            }
          >
            <StorageChargeIcon />
          </IconButton>
          <IconButton
            onClick={_ => this.storeBatteryState(BatteryState.charged)}
            color={
              this.state.cycle.state === BatteryState.charged
                ? "primary"
                : "default"
            }
          >
            <FullChargeIcon />
          </IconButton>

          <IconButton onClick={this.removeBattery} className={css.last}>
            <ClearIcon />
          </IconButton>
        </ExpansionPanelSummary>

        <ExpansionPanelDetails>
          <TextField
            id="charged"
            label="Charged"
            placeholder="Charged"
            className={`${css.textField} ${css.narrow}`}
            value={cycle.charged || ""}
            name={"charged"}
            type="number"
            onChange={this.changeBattery}
            onBlur={this.storeBattery}
            margin="normal"
            InputProps={{
              endAdornment: <InputAdornment position="end">mAh</InputAdornment>
            }}
          />

          {resistances}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default FlightBattery;

import * as React from 'react';
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
import { Plane } from '../../../../../shared/planes/types';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';
const css = require('../../../common/Form.css');

import FullChargeIcon from '@material-ui/icons/BatteryChargingFull';
import StorageChargeIcon from '@material-ui/icons/BatteryCharging50';
import EmptyChargeIcon from '@material-ui/icons/BatteryCharging20Rounded';
import ClearIcon from '@material-ui/icons/Clear';
import { BatteryState } from '../../../../../shared/batteries';
import gql from 'graphql-tag';
import { useMutation } from 'urql';
import { Loading } from '../../loading/Loading';

interface IFlightBatteryProps {
  plane: Plane;
  flightCycle: BatteryCycle;
  battery: Battery;
  // update: (object) => {};
  // delete: (object) => {};
}

const Update = gql`
  mutation($id:Int!, $cycle:BatteryCyclePatch!) {
    updateBatteryCycle(input: {id: $id, patch: $cycle}) {
      batteryCycle {
        id
        date
        batteryName
        flightId
        state
        voltage
        discharged
        charged
      }
    }
  }`;

const Delete = gql`
  mutation($id:Int!) {
    deleteBatteryCycle(input: {id: $id}) {
      batteryCycle {
        id
      }
    }
  }`;


const FlightBatteryComponent = ({ plane, flightCycle, battery }: IFlightBatteryProps) => {

  const [update, updateCycle] = useMutation(Update);
  const [del, deleteCycle] = useMutation(Delete);

  const [cycle, setCycle] = React.useState<BatteryCycle>(flightCycle);
  React.useEffect(() => setCycle(flightCycle), [flightCycle]);

  if (!plane || !battery) {
    return <></>;
  }

  // modify local state
  const changeNumber = ({ target: { name, value } }) =>
    setCycle({ ...cycle, [name]: Number(value) });

  const changeCycle = ({ target: { name, value } }) =>
    setCycle({ ...cycle, [name]: value });

  const changeCycleResistance = (index, value) => {

    const resistances =
      (cycle.resistance && [...cycle.resistance]) ||
      Array(battery.cells).fill('');

    if (resistances.length < battery.cells) {
      resistances.push(Array(battery.cells - resistances.length).fill(''));
    }

    resistances.splice(index, 1, value);

    setCycle({ ...cycle, resistance: resistances as [number] });
  };

  const storeBatteryState = state => {
    updateCycle({ id: cycle.id, cycle: { state } });
  };

  const storeBattery = _ => {
    delete cycle['__typename'];
    updateCycle({ id: cycle.id, cycle });
  };

  const removeBattery = _ => deleteCycle({ id: cycle.id });

  const renderResistance = (index: number) => {

    return (
      <TextField
        key={`resistance-${index}`}
        label={`Cell ${index + 1}`}
        placeholder={`Cell ${index + 1}`}
        className={`${css.textField} ${css.tiny}`}
        value={
          (cycle.resistance?.length >= index &&
            cycle.resistance[index]) ||
          ''
        }
        name={'resistance'}
        type='number'
        onChange={e => changeCycleResistance(index, e.target.value)}
        onBlur={storeBattery}
        margin='normal'
        InputProps={{
          endAdornment: <InputAdornment position='end'>Ω</InputAdornment>
        }}
      />
    );
  }

  const resistances = Array(battery.cells)
    .fill('')
    .map((_, index) => {
      return renderResistance(index);
    });

  return (
    <ExpansionPanel
      key={cycle.id}
      expanded={cycle.state === BatteryState.charged}
      className={css.container}
    >
      <ExpansionPanelSummary classes={{ root: css.zero }}>
        <FormControl className={css.formControl} margin='normal'>
          <InputLabel htmlFor='select-multiple-checkbox' shrink>
            Battery
            </InputLabel>
          <Select
            value={cycle.batteryName || ''}
            name='batteryName'
            onChange={changeCycle}
            onBlur={storeBattery}
            input={<Input id='select-multiple-checkbox' />}
          >
            {plane.planeBatteries.nodes.map(name => (
              <MenuItem key={name.batteryName} value={name.batteryName}>
                {name.batteryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id='discharged'
          label='Used'
          className={`${css.textField} ${css.narrow}`}
          value={cycle.discharged || ''}
          name='discharged'
          type='number'
          onChange={changeNumber}
          onBlur={storeBattery}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: <InputAdornment position='end'>mAh</InputAdornment>
          }}
          margin='normal'
        />
        <TextField
          id='resting'
          label='Resting'
          className={`${css.textField} ${css.narrow}`}
          value={cycle.voltage || ''}
          name='voltage'
          type='number'
          onChange={changeNumber}
          onBlur={storeBattery}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: <InputAdornment position='end'>V</InputAdornment>
          }}
          margin='normal'
        />

        <IconButton
          onClick={_ => storeBatteryState(BatteryState.discharged)}
          color={
            cycle.state === BatteryState.discharged
              ? 'primary'
              : 'default'
          }
        >
          <EmptyChargeIcon />
        </IconButton>

        <IconButton
          onClick={_ => storeBatteryState(BatteryState.storage)}
          color={
            cycle.state === BatteryState.storage
              ? 'primary'
              : 'default'
          }
        >
          <StorageChargeIcon />
        </IconButton>
        <IconButton
          onClick={_ => storeBatteryState(BatteryState.charged)}
          color={
            cycle.state === BatteryState.charged
              ? 'primary'
              : 'default'
          }
        >
          <FullChargeIcon />
        </IconButton>

        <IconButton onClick={removeBattery} className={css.last}>
          <ClearIcon />
        </IconButton>
        <Loading
          spinning={update.fetching || del.fetching}
          error={update.error || del.error}
          overlay={false}
        />
      </ExpansionPanelSummary>

      <ExpansionPanelDetails>
        <TextField
          id='charged'
          label='Charged'
          placeholder='Charged'
          className={`${css.textField} ${css.narrow}`}
          value={cycle.charged || ''}
          name={'charged'}
          type='number'
          onChange={changeNumber}
          onBlur={storeBattery}
          margin='normal'
          InputProps={{
            endAdornment: <InputAdornment position='end'>mAh</InputAdornment>
          }}
        />

        {resistances}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

export const FlightBattery = FlightBatteryComponent;

import * as React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Plane } from '../../../../../shared/planes/types';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';

import FullChargeIcon from '@mui/icons-material/BatteryChargingFull';
import StorageChargeIcon from '@mui/icons-material/BatteryCharging50';
import EmptyChargeIcon from '@mui/icons-material/BatteryCharging20Rounded';
import ClearIcon from '@mui/icons-material/Clear';
import { BatteryState } from '../../../../../shared/batteries';
import gql from 'graphql-tag';
import { useMutation } from 'urql';
import { LoadingIcon } from '../../loading/Loading';
import { Box } from '@mui/material';
const PREFIX = 'FlightBattery';

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  details: `${PREFIX}-details`
};

const StyledAccordion = styled(Accordion)((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    margin: '0!important',
    padding: '12px 0'
  },

  [`& .${classes.content}`]: {
    margin: '0!important'
  },

  [`& .${classes.details}`]: {
    paddingTop: '0',
    paddingBottom: '0',
  }
}));

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
        restingVoltage
        startVoltage
        endVoltage
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


export const FlightBattery = ({ plane, flightCycle, battery }: IFlightBatteryProps) => {

  if (!plane || !battery) {
    return <></>;
  }

  const [update, updateCycle] = useMutation(Update);
  const [del, deleteCycle] = useMutation(Delete);

  const [cycle, setCycle] = React.useState<BatteryCycle>(flightCycle);
  React.useEffect(() => setCycle(flightCycle), [flightCycle]);



  // modify local state
  const changeNumber = ({ target: { name, value } }) =>
    setCycle({ ...cycle, [name]: (value.length > 0 ? Number(value) : null) });

  const changeCycle = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCycle({ ...cycle, [name]: value });
  };

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
        style={{ width: 75 }}
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
        inputProps={{
          step: 0.1,
          min: '0'
        }}
      />
    );
  };

  const resistances = Array(cycle.state === BatteryState.charged ? battery.cells : 0)
    .fill('')
    .map((_, index) => {
      return renderResistance(index);
    });

  const textFieldVolts = (name: string, label: string, value?: number) => {
    const perCell = battery.cells > 1 ? ` ${Math.round(value / battery.cells * 100) / 100}v` : '';
    return <TextField
      id={name}
      label={label + perCell}
      style={{ width: 75 }}
      value={value || ''}
      name={name}
      type='number'
      onChange={changeNumber}
      onBlur={storeBattery}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        endAdornment: <InputAdornment position='end'>V</InputAdornment>
      }}
      inputProps={{ step: 0.01 }}
      margin='normal'
    />;
  }

  return (
    <StyledAccordion
      key={cycle.id}
      expanded={cycle.state !== BatteryState.discharged}
      classes={{ root: css.root }}
    >
      <AccordionSummary classes={{ content: css.content }}>
        <Box display='flex' flexWrap='wrap'>
          <Box>
            <FormControl margin='normal'>
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
          </Box>
          <Box>
            <TextField
              id='discharged'
              label='Used'
              style={{ width: 80 }}
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
            {textFieldVolts('startVoltage', 'From', cycle.startVoltage)}
            {textFieldVolts('endVoltage', 'To', cycle.endVoltage)}
            {textFieldVolts('restingVoltage', 'Rest', cycle.restingVoltage)}
          </Box>

          <Box alignSelf='center'>
            <IconButton
              onClick={_ => storeBatteryState(BatteryState.discharged)}
              color={
                cycle.state === BatteryState.discharged
                  ? 'primary'
                  : 'default'
              }
              size="large">
              <EmptyChargeIcon />
            </IconButton>
            <IconButton
              onClick={_ => storeBatteryState(BatteryState.storage)}
              color={
                cycle.state === BatteryState.storage
                  ? 'primary'
                  : 'default'
              }
              size="large">
              <StorageChargeIcon />
            </IconButton>
            <IconButton
              onClick={_ => storeBatteryState(BatteryState.charged)}
              color={
                cycle.state === BatteryState.charged
                  ? 'primary'
                  : 'default'
              }
              size="large">
              <FullChargeIcon />
            </IconButton>
            <IconButton onClick={removeBattery} size="large">
              <ClearIcon />
            </IconButton>
            <LoadingIcon
              spinning={update.fetching || del.fetching}
              error={update.error || del.error}
            />
          </Box>
        </Box >
      </AccordionSummary >

      <AccordionDetails classes={{ root: css.details }}>
        <TextField
          id='charged'
          label='Charged'
          placeholder='Charged'
          style={{ width: 90 }}
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

        <Box>
          {resistances}
        </Box>

      </AccordionDetails>
    </StyledAccordion>
  );
};

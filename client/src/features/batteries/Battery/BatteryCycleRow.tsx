import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';
import { BatteryCycleResistance } from './BatteryCycleResistance';

import { NavLink } from 'react-router-dom';
import { useMutation } from 'urql';

import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';

import { formatDate, formatDateTimeLocal } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Flight } from '../../../../../shared/flights/types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { LoadingIcon } from '../../loading/Loading';
import { CREATE_BATTERY_CYCLE, UPDATE_BATTERY_CYCLE, DELETE_BATTERY_CYCLE } from './BatteryCycle';

const SWITCHES = [
  'DISCHARGED',
  'CHARGED',
  'STORAGE'
];

interface IBatteryCycleProps {
  cells: number;
  cycle: BatteryCycle;
  batteries?: Battery[];
  removeEntry?: () => void;
}

export const BatteryCycleRow = ({ cells, cycle, batteries, removeEntry }: IBatteryCycleProps) => {

  // graphql CRUD operations
  const [creating, createCycle] = useMutation(CREATE_BATTERY_CYCLE);
  const [updating, updateCycle] = useMutation(UPDATE_BATTERY_CYCLE);
  const [deleting, deleteCycle] = useMutation(DELETE_BATTERY_CYCLE);

  // local state
  const [editing, setEditing] = React.useState<BatteryCycle>(!cycle.id ? cycle : null);

  const isEditing = editing && editing.id === cycle.id;

  const changeValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: (value.length > 0 ? value : null) });
  };

  const changeNumber = ({ target: { name, value } }) =>
    setEditing({ ...editing, [name]: (value.length > 0 ? Number(value) : null) });

  const changeDateTimeLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: new Date(`${value}:00`) });
  };

  useHotkeys('esc', () => setEditing(null));

  // update to server

  const save = () => {
    const { ['__typename']: _, flight, ...cycle } = editing;
    if (editing.id) {
      updateCycle({ id: editing.id, cycle }).then((res) => !res.error && setEditing(null));
    } else {
      createCycle({ cycle }).then((res) => !res.error && setEditing(null));
    }
  };

  const remove = () => {
    if (editing.id) {
      deleteCycle({ id: editing.id }).then(() => setEditing(null));
    } else {
      // not yet saved
      removeEntry();
    }
  };

  const renderFlight = (flight: Flight) =>
    <NavLink to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}>
      {flight.planeId} {formatDuration(flight.flightTime)}
    </NavLink>;

  const renderNumber = (name: string, value: number, unit: string, placeholder: string) =>
    isEditing ? <TextField
      id={name}
      value={editing[name] || ''}
      name={name}
      placeholder={placeholder}
      onChange={changeNumber}
      type='number'
      style={{ width: 75 }}
      InputProps={{
        endAdornment: <InputAdornment position='end'>{unit}</InputAdornment>
      }}
      inputProps={{
        step: (unit === 'V' ? 0.01 : 1),
        min: '0'
      }}
    /> : (value && `${value}${unit}` || '');

  const renderDate = (name: string, value: string) =>
    isEditing ? <TextField
      id={name}
      name={name}
      type='datetime-local'
      value={formatDateTimeLocal(editing[name])}
      onChange={changeDateTimeLocal}
      margin='normal'
    /> : formatDate(value);

  const selectBattery = () =>
    isEditing ?
      <FormControl margin='normal'>
        <InputLabel htmlFor='select-multiple-checkbox' shrink>
          Battery
      </InputLabel>
        <Select
          value={editing.batteryName || ''}
          name='batteryName'
          onChange={changeValue}
          input={<Input id='select-multiple-checkbox' />}
        >
          {batteries.map(battery => (
            <MenuItem key={battery.name} value={battery.name}>
              {battery.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl> : cycle.batteryName;

  return <TableRow key={cycle.id}>
    <TableCell padding='none'>{renderDate('date', cycle.date)}</TableCell>
    <TableCell>{cycle.flight && renderFlight(cycle.flight) || batteries && selectBattery()}</TableCell>
    <TableCell padding='none'>{renderNumber('discharged', cycle.discharged, 'mAh', 'Used')}</TableCell>
    <TableCell>{renderNumber('restingVoltage', cycle.restingVoltage, 'V', 'Resting')}</TableCell>
    <TableCell padding='none'>{cycle.state}</TableCell>
    <TableCell>{renderNumber('charged', cycle.charged, 'mAh', 'Charged')}</TableCell>
    <TableCell padding='none'>
      <BatteryCycleResistance editing={isEditing} cells={cells} cycle={isEditing ? editing : cycle} setCycle={setEditing} />
    </TableCell>
    <TableCell padding='none'>
      {isEditing ?
        <>
          <LoadingIcon
            spinning={updating.fetching || deleting.fetching}
            error={updating.error || deleting.error} />
          <Tooltip title='Save entry'>
            <IconButton onClick={save}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Remove entry'>
            <IconButton onClick={remove}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
        : <Tooltip title='Edit entry'>
          <IconButton onClick={() => setEditing(cycle)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      }
    </TableCell>
  </TableRow>;
}
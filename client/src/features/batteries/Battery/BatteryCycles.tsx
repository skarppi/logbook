import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';
import { BatteryCycleResistance } from './BatteryCycleResistance';

import { NavLink } from 'react-router-dom';

import gql from 'graphql-tag';
import { useMutation } from 'urql';

const css = require('../../../common/Form.css');
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';

import { formatDate, formatDateTimeLocal } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { TableHead } from '@material-ui/core';
import { Flight } from '../../../../../shared/flights/types';

const Update = gql`
mutation($id:Int!, $cycle:BatteryCyclePatch!) {
  updateBatteryCycle(input: {id: $id, patch: $cycle}) {
    batteryCycle {
      id
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

interface IQueryResponse {
  batteryCycle: BatteryCycle;
}

const SWITCHES = [
  'DISCHARGED',
  'CHARGED',
  'STORAGE'
];


interface IBatteryCycleProps {
  battery: Battery;
  cycles: BatteryCycle[];
}

export const BatteryCycles = ({ battery, cycles }: IBatteryCycleProps) => {

  // graphql CRUD operations
  const [update, updateCycle] = useMutation(Update);
  const [del, deleteCycle] = useMutation(Delete);

  // local state
  const [editing, setEditing] = React.useState<BatteryCycle>(null);

  const changeValue = ({ target: { name, value } }) =>
    setEditing({ ...editing, [name]: (value.length > 0 ? value : null) });

  const changeNumber = ({ target: { name, value } }) =>
    setEditing({ ...editing, [name]: value.length > 0 ? Number(value) : null });

  const changeDateTimeLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: new Date(`${value}:00`) });
  };


  useHotkeys('esc', () => setEditing(null));

  // update to server

  const save = () => {
    const { ['__typename']: _, flight, ...cycle } = editing;
    updateCycle({ id: editing.id, cycle }).then(() => setEditing(null));
  };

  const remove = () => {
    deleteCycle({ id: editing.id }).then(() => setEditing(null));
  };

  const renderFlight = (flight: Flight) =>
    <NavLink to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}>
      {flight.planeId} {formatDuration(flight.flightTime)}
    </NavLink>;

  const renderNumber = (current: boolean, name: string, value: number, unit: string, placeholder: string) =>
    current ? <TextField
      id={name}
      value={editing[name] || ''}
      name={name}
      placeholder={placeholder}
      onChange={changeNumber}
      inputProps={{ maxLength: 4 }}
      style={{ width: 75 }}
      InputProps={{
        endAdornment: <InputAdornment position='end'>{unit}</InputAdornment>
      }}
    /> : (value && `${value}${unit}` || '');

  const renderDate = (current: boolean, name: string, value: string) =>
    current ? <TextField
      id={name}
      name={name}
      type='datetime-local'
      value={formatDateTimeLocal(editing[name])}
      onChange={changeDateTimeLocal}
      className={css.textField}
      margin='normal'
    /> : formatDate(value);

  const renderButtons = (current: boolean, cycle: BatteryCycle) =>
    current ?
      <>
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
      </Tooltip>;

  const rows = cycles.map(cycle => {
    const current = editing && editing.id === cycle.id;
    return <TableRow key={cycle.id}>
      <TableCell padding='none'>{renderDate(current, 'date', cycle.date)}</TableCell>
      <TableCell>{cycle.flight && renderFlight(cycle.flight)}</TableCell>
      <TableCell padding='none'>{renderNumber(current, 'discharged', cycle.discharged, 'mAh', 'Used')}</TableCell>
      <TableCell>{renderNumber(current, 'voltage', cycle.voltage, 'V', 'Resting')}</TableCell>
      <TableCell padding='none'>{cycle.state}</TableCell>
      <TableCell>{renderNumber(current, 'charged', cycle.charged, 'mAh', 'Charged')}</TableCell>
      <TableCell padding='none'>
        <BatteryCycleResistance editing={current} battery={battery} cycle={current ? editing : cycle} setCycle={setEditing} />
      </TableCell>
      <TableCell padding='none'>
        {renderButtons(current, cycle)}
      </TableCell>
    </TableRow>;
  });

  return <Table padding='default'>
    <TableHead>
      <TableRow>
        <TableCell padding='none'>Date</TableCell>
        <TableCell>Flight</TableCell>
        <TableCell padding='none'>Used</TableCell>
        <TableCell>Resting</TableCell>
        <TableCell padding='none'>Action</TableCell>
        <TableCell>Charged</TableCell>
        <TableCell padding='none'>Resistance</TableCell>
        <TableCell padding='none'></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows}
    </TableBody>
  </Table>;
}
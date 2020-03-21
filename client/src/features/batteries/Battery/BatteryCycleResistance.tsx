import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';
import { BatteryGraph } from './BatteryGraph';

import { useHistory, NavLink } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const batteryCss = require('./Battery.css');
const css = require('../../../common/Form.css');
import DeleteIcon from '@material-ui/icons/Delete';
import NewSwitchIcon from '@material-ui/icons/Add';
import EditPlaneIcon from '@material-ui/icons/Edit';
import SavePlaneIcon from '@material-ui/icons/Save';


import { Loading } from '../../loading/Loading';
import { formatDate } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { BatteryState } from '../../../../../shared/batteries';
import { TableHead } from '@material-ui/core';
import { Flight } from '../../../../../shared/flights/types';

interface IResistanceProps {
  editing: boolean;
  battery: Battery;
  cycle: BatteryCycle;
  setCycle: React.Dispatch<React.SetStateAction<BatteryCycle>>;
}

export const BatteryCycleResistance = ({ editing, battery, cycle, setCycle }: IResistanceProps) => {
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

  const renderResistance = (index: number) => {
    const value = (cycle.resistance?.length >= index && cycle.resistance[index]);

    if (!editing) {
      return <span>{value} </span>;
    }

    return (
      <TextField
        key={`resistance-${index}`}
        label={`Cell ${index + 1}`}
        placeholder={`Cell ${index + 1}`}
        className={`${css.textField} ${css.micro}`}
        value={value || ''}
        name={'resistance'}
        onChange={e => changeCycleResistance(index, e.target.value)}
        style={{ width: 75 }}
        inputProps={{ maxLength: 4 }}
        InputProps={{
          endAdornment: <InputAdornment position='end'>Ω</InputAdornment>
        }}
      />
    );
  }

  if (editing) {
    return <>{Array(battery.cells)
      .fill('')
      .map((_, index) => {
        return renderResistance(index);
      })}
    </>;
  } else {
    const sum = cycle.resistance?.reduce((prev, current) => prev + Number(current), 0);
    if (battery?.cells === 1) {
      return <>{cycle.resistance?.join(' ')}</>;
    } else if (sum > 0) {
      return <>Average: {Math.round(sum / cycle.resistance.length)} Cells: {cycle.resistance?.join(' ')}</>;
    }
    return <></>;
  }
}
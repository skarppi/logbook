import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import { Plane } from '../../../../shared/planes/types';
import { PlaneType } from '../../../../shared/planes';
import { Battery } from '../../../../shared/batteries/types';

const planeCss = require('./Plane.css');
const css = require('../../../common/Form.css');

interface IProps {
  plane: Plane;
  allBatteries: Battery[];
  setPlane: (event) => void;
  save: (event) => void;
}

export const PlaneForm = ({ plane, allBatteries, setPlane, save }: IProps) => {
  const changePlane = ({ target: { name, value } }) =>
    setPlane({ ...plane, [name]: value });

  const changeBatteries = ({ target: { name, value } }) => {
    const nodes = value.map(v => ({ batteryName: v }));

    setPlane({ ...plane, [name]: { nodes } });
  };

  const batteries = plane.planeBatteries.nodes.map(b => b.batteryName);

  return <>
    <FormControl className={css.formControl} margin='normal'>
      <InputLabel htmlFor='select-multiple-checkbox'>Type</InputLabel>
      <Select
        value={plane.type}
        name={'type'}
        onChange={changePlane}
        onBlur={save}
        input={<Input id='select-multiple-checkbox' />}
      >
        {Object.keys(PlaneType).sort().map(name => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControl className={css.formControl} margin='normal'>
      <InputLabel htmlFor='select-multiple-checkbox'>Battery Slots</InputLabel>
      <Select
        value={plane.batterySlots}
        name={'batterySlots'}
        onChange={changePlane}
        onBlur={save}
        input={<Input id='select-multiple-checkbox' />}
      >
        <MenuItem key={0} value={0}>0</MenuItem>
        <MenuItem key={1} value={1}>1</MenuItem>
        <MenuItem key={2} value={2}>2</MenuItem>
      </Select>
    </FormControl>

    <FormControl className={css.formControl} margin='normal'>
      <InputLabel htmlFor='select-multiple-chip'>Available Batteries</InputLabel>
      <Select
        multiple
        value={batteries}
        name={'planeBatteries'}
        onChange={changeBatteries}
        onBlur={save}
        input={<Input id='select-multiple-chip' />}
        renderValue={selected => (
          <div className={planeCss.chips}>
            {batteries.map(battery => (
              <Chip key={battery} label={battery} className={planeCss.chip} />
            ))}
          </div>
        )}
      >
        {allBatteries.map(battery => (
          <MenuItem key={battery.name} value={battery.name} selected={batteries.indexOf(battery.name) !== -1}>
            {battery.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </>
};
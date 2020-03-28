import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';

const css = require('../../../common/Form.css');

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
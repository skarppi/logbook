import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import {
  formatDuration,
  parseDurationIntoSeconds
} from '../../../../shared/utils/date';
import { Flight } from '../../../../shared/flights/types';
const css = require('../../../common/Form.css');

interface IFlightDurationProps {
  flight: Flight;
  save: (object) => {};
}

export const FlightDuration = ({ flight, save }: IFlightDurationProps) => {

  const [armedTime, setArmedTime] = React.useState('');
  const [flightTime, setFlightTime] = React.useState('');

  React.useEffect(() => {
    setArmedTime(formatDuration(flight.armedTime))
  }, [flight.armedTime]);

  React.useEffect(() => {
    setFlightTime(formatDuration(flight.flightTime))
  }, [flight.flightTime]);

  const changeArmedTime = ({ target: { value } }) => {
    setArmedTime(value);
  }
  const changeFlightTime = ({ target: { value } }) => {
    setFlightTime(value);
  }

  const store = ({ target: { name, value } }) => {
    const seconds = parseDurationIntoSeconds(value);
    if (seconds) {
      save({
        id: flight.id,
        patch: {
          [name]: seconds
        }
      });
    }
  };

  return (
    <div className={css.subContainer}>
      <TextField
        required
        error={parseDurationIntoSeconds(armedTime) === null}
        id='armedTime'
        label='Armed time'
        className={css.textField}
        value={armedTime}
        name='armedTime'
        onChange={changeArmedTime}
        onBlur={store}
        margin='normal'
      />

      <TextField
        required
        error={parseDurationIntoSeconds(flightTime) === null}
        id='flightTime'
        label='Flight time'
        className={css.textField}
        value={flightTime}
        name='flightTime'
        onChange={changeFlightTime}
        onBlur={store}
        margin='normal'
      />
    </div>
  );
}

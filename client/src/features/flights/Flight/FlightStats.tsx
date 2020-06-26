import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { Flight } from '../../../../../shared/flights/types';
const css = require('../../../common/Form.css');

interface IFlightStatsProps {
  flight: Flight;
}

export const FlightStats = ({ flight }: IFlightStatsProps) => {
  if (!flight || !flight.stats) {
    return <></>;
  }

  return (
    <div className={css.subContainer}>
      {flight.stats.zeroHeight > 0 &&
        <TextField
          InputProps={{
            readOnly: true
          }}
          id='zeroHeight'
          label='Zero height'
          className={css.textField}
          value={flight.stats.zeroHeight}
          name='zeroHeight'
          margin='normal'
        />}
      {flight.stats.launchHeight > 0 &&
        (<TextField
          InputProps={{
            readOnly: true
          }}
          id='launchHeight'
          label='Launch height'
          className={css.textField}
          value={flight.stats.launchHeight}
          name='launchHeight'
          margin='normal'
        />)
      }
      {flight.stats.maxHeight > 0 &&
        <TextField
          InputProps={{
            readOnly: true
          }}
          id='maxHeight'
          label='Maximum height'
          className={css.textField}
          value={flight.stats.maxHeight}
          name='maxHeight'
          margin='normal'
        />}

    </div>
  );
}

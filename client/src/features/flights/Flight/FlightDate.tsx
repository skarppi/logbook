import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { formatDuration } from '../../../../../shared/utils/date';
import { Flight } from '../../../../../shared/flights/types';
import { formatDate, formatTime } from '../../../utils/date';
import Box from '@material-ui/core/Box';
const css = require('../../../common/Form.css');

interface IFlightDateProps {
  flight: Flight;
}

export function FlightDate({ flight }: IFlightDateProps) {
  return (
    <>
      <Box display='flex' flexGrow='1'>
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id='date'
          type='date'
          label='Date'
          value={formatDate(flight.startDate)}
          fullWidth={true}
          margin='normal'
        />
      </Box>
      <Box display='flex' flexGrow='1'>
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id='start_time'
          type='time'
          label='Started'
          fullWidth={true}
          value={formatTime(flight.startDate)}
          margin='normal'
        />
        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id='end_time'
          type='time'
          label='Stopped'
          fullWidth={true}
          value={formatTime(flight.endDate)}
          margin='normal'
        />

        <TextField
          required
          InputProps={{
            readOnly: true
          }}
          id='duration'
          label='Duration'
          className={`${css.textField} ${css.narrow}`}
          value={formatDuration(flight.duration)}
          margin='normal'
        />
      </Box>
    </>
  );
}

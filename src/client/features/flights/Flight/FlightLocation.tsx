import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { Flight } from '../../../../shared/flights/types';
const css = require('../../../common/Form.css');

interface IFlightLocationProps {
  flight: Flight;
  locations: string[];
  save: (object) => {};
}

export const FlightLocation = ({ flight, locations, save }: IFlightLocationProps) => {

  const [location, setLocation] = React.useState(flight.notes && flight.notes.location || '');
  const [createNew, setCreateNew] = React.useState(false);

  const changeFlightLocation = ({ target: { value } }) => {
    if (value === 'new') {
      setCreateNew(true);
    } else {
      setLocation(value);
    }
  };

  const storeFlightLocation = () => {
    setCreateNew(false)
    save({
      id: flight.id,
      patch: {
        notes: {
          ...flight.notes,
          location
        }
      }
    });
  };

  const renderExistingLocations = () => {
    if (locations.indexOf(location) === -1) {
      locations.push(location);
      locations.sort();
    }

    return (
      <FormControl className={css.formControl} margin='normal'>
        <InputLabel htmlFor='select-multiple-checkbox' shrink>
          Location
        </InputLabel>
        <Select
          value={location}
          name='location'
          onChange={changeFlightLocation}
          onBlur={storeFlightLocation}
          input={<Input id='select-multiple-checkbox' />}
        >
          <MenuItem key='new' value='new'>
            Other...
          </MenuItem>

          {locations.map(loc => (
            <MenuItem key={loc} value={loc}>
              {loc}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const renderNewLocation = () => {
    return (
      <TextField
        id='location'
        label='Location'
        placeholder='Location'
        className={css.textField}
        value={location}
        name='location'
        onChange={changeFlightLocation}
        onBlur={storeFlightLocation}
        margin='normal'
        inputRef={((input) => input && input.focus())}
      />
    );
  }

  if (createNew) {
    return renderNewLocation();
  } else {
    return renderExistingLocations();
  }
}

import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { Flight } from '../../../../../shared/flights/types';
import { useState } from 'react';
import { useQuery } from 'urql';
import gql from 'graphql-tag';
const css = require('../../../common/Form.css');

interface IFlightLocationProps {
  flight: Flight;
  save: (object) => {};
}

const Query = gql`
  query {
    flightLocations {
      nodes {
        location
        flights
        latitude,
        longitude
      }
    }
  }`;

interface IQueryResponse {
  flightLocations: {
    nodes: Array<{
      location: string,
      flights: number
    }>;
  };
}


export const FlightLocation = ({ flight, save }: IFlightLocationProps) => {

  const [query] = useQuery<IQueryResponse>({ query: Query });

  const [location, setLocation] = useState(flight.notes && flight.notes.location || '');
  const [createNew, setCreateNew] = useState(false);

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
    const locations = query.data && query.data.flightLocations.nodes.map(l =>
      l.location) || [];

    if (location.length > 0 && locations.indexOf(location) === -1) {
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

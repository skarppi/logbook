import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { Flight } from '../../../../../shared/flights/types';
import { Location } from '../../../../../shared/locations/types';
import { useState } from 'react';
import { useQuery } from 'urql';
import { useStateAndListenChanges } from '../../../utils/hooks';
import gql from 'graphql-tag';
const css = require('../../../common/Form.css');

interface IFlightLocationProps {
  flight: Flight;
  save: (object) => {};
}

const Query = gql`
  query {
    locations(orderBy:NAME_ASC) {
      nodes {
        id
        name
        latitude,
        longitude
      }
    }
  }`;

interface IQueryResponse {
  locations: {
    nodes: Location[];
  };
}


export const FlightLocation = ({ flight, save }: IFlightLocationProps) => {

  const [query] = useQuery<IQueryResponse>({ query: Query });

  const [locationId, setLocationId] = useStateAndListenChanges(flight.location?.id);

  const [createNew, setCreateNew] = useState(false);

  const changeFlightLocation = ({ target: { value } }) => {
    if (value === 'new') {
      setCreateNew(true);
    } else {
      setLocationId(value);
    }
  };

  const storeFlightLocation = () => {
    setCreateNew(false);
    save({
      id: flight.id,
      patch: {
        locationId
      }
    });
  };

  const renderExistingLocations = () => {
    const locations = query.data?.locations?.nodes || [];

    return (
      <FormControl className={css.formControl} margin='normal'>
        <InputLabel htmlFor='select-multiple-checkbox' shrink>
          Location
        </InputLabel>
        <Select
          value={locationId || 0}
          name='location'
          onChange={changeFlightLocation}
          onBlur={storeFlightLocation}
          input={<Input id='select-multiple-checkbox' />}
        >
          <MenuItem key='new' value='new'>
            Other...
          </MenuItem>

          {locations.map(loc => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const renderNewLocation = () => {
    const locations = query.data?.locations?.nodes || [];

    return (
      <TextField
        id='location'
        label='Location'
        placeholder='Location'
        className={css.textField}
        value={locations.find(l => l.id === locationId)?.name || ''}
        name='location'
        onChange={changeFlightLocation}
        onBlur={storeFlightLocation}
        margin='normal'
        inputRef={(input => input?.focus())}
      />
    );
  }

  if (createNew) {
    return renderNewLocation();
  } else {
    return renderExistingLocations();
  }
}

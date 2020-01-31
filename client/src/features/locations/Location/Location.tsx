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

import { withRouter } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const locationCss = require('./Location.css');
const css = require('../../../common/Form.css');
import DeleteIcon from '@material-ui/icons/Delete';
import { Loading } from '../../loading/Loading';
import { formatDate } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { Location } from '../../../../../shared/locations/types';

interface IQueryResponse {
  location: Location;
}

const Create = gql`
  mutation($location:LocationInput!) {
    createLocation(input: {location: $location}) {
      location {
        id
        name
        latitude
        longitude
      }
    }
  }`;

const Update = gql`
  mutation($id:Int!, $location:LocationPatch!) {
    updateLocation(input: {id: $id, patch: $location}) {
      location {
        id
        name
        latitude
        longitude
      }
    }
  }`;

const Delete = gql`
  mutation($id:Int!) {
    deleteLocation(input: {id: $id}) {
      location {
        id
      }
    }
  }`;


const NEW_LOCATION: Location = {
  name: '',
  latitude: 0,
  longitude: 0
};

const LocationDetailsComponent = ({ data, history }) => {

  // graphql CRUD operations
  const [create, createLocation] = useMutation(Create);
  const [update, updateLocation] = useMutation(Update);
  const [del, deleteLocation] = useMutation(Delete);

  // local state
  const [location, setLocation] = React.useState(data || NEW_LOCATION);

  // modify local state
  const changeNumber = ({ target: { name, value } }) =>
    setLocation({ ...location, [name]: Number(value) });

  const changelocation = ({ target: { name, value } }) =>
    setLocation({ ...location, [name]: value });

  // update to server
  const save = () => {
    if (!location.id) {
      createLocation({ location }).then(res => {
        if (!res.error) {
          history.push(`/locations/${res.data.createLocation.location.id}`);
        }
      });
    } else {
      delete location['__typename'];
      updateLocation({ id: location.id, location });
    }
  };
  const executeDelete = _ => {
    deleteLocation({ id: location.id }).then(res => {
      if (!res.error) {
        history.push('/locations');
      }
    });
  };

  return (
    <Card className={css.card}>
      <CardHeader
        title={
          <>
            <span ref={this.onTop}>Location name: </span>
            <TextField
              required
              error={location.id === NEW_LOCATION.id && location.name.length === 0}
              id='name'
              placeholder='Name'
              className={css.textField}
              value={location.name}
              name='name'
              onChange={changelocation}
              onBlur={({ target: { value } }) => value.length > 0 && save()}
              margin='none'
            />
          </>
        }
        action={
          <>
            <Loading
              spinning={update.fetching || create.fetching || del.fetching}
              error={update.error || create.error || del.error}
              overlay={false}
            />

            {location.id &&
              <Tooltip title='Delete location'>
                <IconButton onClick={executeDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>}
          </>
        }
      />
      <CardContent hidden={location.name === ''}>
        <div className={css.container}>

          <TextField
            type='number'
            id='latitude'
            label='Latitude'
            placeholder='Latitude'
            className={css.textField}
            value={location.latitude || ''}
            name='latitude'
            onChange={changeNumber}
            onBlur={save}
            margin='normal'
          />

          <TextField
            type='number'
            id='longitude'
            label='Longitude'
            placeholder='Longitude'
            className={css.textField}
            value={location.longitude || ''}
            name='longitude'
            onChange={changeNumber}
            onBlur={save}
            margin='normal'
          />

        </div>

      </CardContent>
    </Card>
  );
};

export const LocationDetails = withRouter(LocationDetailsComponent);
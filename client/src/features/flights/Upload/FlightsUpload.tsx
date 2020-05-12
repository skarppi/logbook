import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import * as React from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { NavLink } from 'react-router-dom';
import { Flight } from '../../../../../shared/flights/types';
import { uploadFlightsAPI } from '../../../utils/api-facade';
import { FlightDetails } from '../Flight/Flight';
import { FlightTimezone } from '../Flight/FlightTimezone';
import { formatDuration } from '../../../../../shared/utils/date';
import { Location } from '../../../../../shared/locations/types';

import ClosedIcon from '@material-ui/icons/ArrowRight';
import OpenedIcon from '@material-ui/icons/ArrowDropDown';
import { useState } from 'react';
import { useQuery } from 'urql';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { formatDateTime } from '../../../utils/date';
import gql from 'graphql-tag';
import Input from '@material-ui/core/Input';

const css = require('./FlightsUpload.css');

const Query = gql`
  query($lat:Float, $lon:Float) {
    locationsByCoordinate(lat: $lat, lon: $lon) {
      nodes {
        id
        name
        latitude
        longitude
        distance
      }
    }
  }`;

interface IQueryResponse {
  locationsByCoordinate: {
    nodes: Location[]
  };
}

interface ILocationsContext {
  locationsByCoordinate: Location[];
}

export const FlightsUpload = ({ match: { params: { id } } }) => {

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [error, setError] = useState<string>(undefined);

  const [splitSeconds, setSplitSeconds] = React.useState(30);
  const [timezoneOffset, setTimezoneOffset] = React.useState(-new Date().getTimezoneOffset() / 60);
  const [locationId, setLocationId] = React.useState(-1);

  const [currentLocation, setCurrentLocation] = useState({ lat: null, lon: null });

  const [res, queryWithCoords] = useQuery<IQueryResponse>({ query: Query, variables: currentLocation });
  const locations = res.data?.locationsByCoordinate?.nodes ?? [];

  React.useEffect(() => {
    if (locations.length > 0) {
      setLocationId(locations[0].id);
    }
  }, [locations]);

  navigator.geolocation.getCurrentPosition(position => {
    setCurrentLocation({
      lat: position.coords.latitude,
      lon: position.coords.longitude
    });
  }, err => console.log(err));

  const dropRendered = (getRootProps, getInputProps, isDragActive) => {
    return (
      <div
        {...getRootProps()}
        className={classNames(css.dropzone, {
          'dropzone--isActive': isDragActive
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
            <div>
              <p hidden={loaded > 0 || error !== undefined}>
                Drag and drop log files or <u>click</u>
              </p>
              <p
                hidden={loaded === 0 || error !== undefined}
              >
                Uploaded {loaded} %. Drag and drop more.
            </p>
              <p hidden={error === undefined}>
                Failed with message "{error}". Try again.
            </p>
            </div>
          )}
      </div>
    );
  }

  const path = `/upload/`;

  const rows = flights.map((flight, index) => {
    const current = id === flight.id;

    const detailsRow = current && (
      <TableRow key={flight.id + '-details'}>
        <TableCell colSpan={5}>
          <FlightDetails
            entry={flight}
            nextFlightLink={flights[index - 1] && `${path}${flights[index - 1].id}`}
            previousFlightLink={flights[index + 1] && `${path}${flights[index + 1].id}`} />
        </TableCell>
      </TableRow>
    );

    return [
      <TableRow key={flight.id}>
        <TableCell>
          <NavLink to={current ? path : `${path}${flight.id}`}>
            {(current && <OpenedIcon />) || <ClosedIcon />}
            {formatDateTime(flight.startDate)}
          </NavLink>
        </TableCell>
        <TableCell>{flights.length - index}</TableCell>
        <TableCell>{flight.plane}</TableCell>
        <TableCell>{formatDuration(flight.flightTime)}</TableCell>
        <TableCell>{flight.notes && flight.notes.journal}</TableCell>
      </TableRow>,
      detailsRow
    ];
  });

  const handleDrop = (files: File[]) => {
    setLoaded(0);
    setError(undefined);

    const data = new FormData();
    files.forEach(file => data.append('flight', file, file.name));

    uploadFlightsAPI(data, splitSeconds, timezoneOffset, locationId, (progressEvent: any) => {
      setLoaded((progressEvent.loaded / progressEvent.total) * 100);
    }).then(res => {
      setFlights(res.data.map(f => {
        f.notes = { journal: res.statusText };
        return f;
      }));
    }).catch(err => {
      setError((err.response && err.response.data) || err.message)
    });
  };

  const printDistance = (distance: number) => {
    if (!distance) {
      return '';
    }
    if (distance >= 10000) {
      return `${Math.round(distance / 1000)} km`;
    } else {
      return `${Math.round(distance / 100) / 10} km`;
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Upload New Flights' />
          <CardContent>
            <span>Split flights after a gap of </span>
            <Select value={splitSeconds} onChange={({ target: { value } }) => {
              setSplitSeconds(Number(value));
            }}>
              <MenuItem value={5}>5 seconds</MenuItem>
              <MenuItem value={15}>15 seconds</MenuItem>
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
            </Select>
            <br />
            <span>Timezone offset </span>
            <FlightTimezone offset={timezoneOffset} onChange={setTimezoneOffset} />

            <br />
            <span>Location </span>
            <Select
              value={locationId || 0}
              name='location'
              onChange={({ target: { name, value } }) => setLocationId(Number(value))}
              input={<Input id='select-multiple-checkbox' />}
            >
              {locations.map(loc => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name} {printDistance(loc.distance)}
                </MenuItem>
              ))}
            </Select>

            <Dropzone onDrop={handleDrop}>
              {({ getRootProps, getInputProps, isDragActive }) =>
                dropRendered(getRootProps, getInputProps, isDragActive)
              }
            </Dropzone>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Uploaded Flights' />
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Plane</TableCell>
                  <TableCell>Flight Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{rows}</TableBody>
              <TableFooter className={css.footer}>
                <TableRow>
                  <TableCell align='right'>Total</TableCell>
                  <TableCell>{flights.length}</TableCell>
                  <TableCell />
                  <TableCell>
                    {formatDuration(
                      flights.reduce(
                        (total, flight) => total + flight.flightTime,
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}
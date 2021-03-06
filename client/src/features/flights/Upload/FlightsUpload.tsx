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
import { useState, useMemo } from 'react';
import { useQuery } from 'urql';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { formatDateTime, formatDateTimeLocal } from '../../../utils/date';
import gql from 'graphql-tag';
import Input from '@material-ui/core/Input';
import { BatteryCycle, Battery } from '../../../../../shared/batteries/types';
import { BatteryCycleRow } from '../../batteries/Battery/BatteryCycleRow';
import { BatteryState } from '../../../../../shared/batteries';
import { ListTemplate } from '../../../common/ListTemplate';

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

const QueryUsedBatteries = gql`
  query {
    batteries {
      nodes {
        name
      }
    },
    batteryCycles(orderBy: ID_ASC, filter: {flightId: {isNull: true}, state: {equalTo: DISCHARGED}}) {
      nodes {
        id
        date
        batteryName
        flightId
        state
        restingVoltage
        startVoltage
        endVoltage
        discharged
        charged
      }
    }
  }`;


interface IQueryResponse {
  locationsByCoordinate: {
    nodes: Location[]
  };
}

interface IBatteryCycleQueryResponse {
  batteries: {
    nodes: Battery[]
  },
  batteryCycles: {
    nodes: BatteryCycle[]
  };
}

interface ILocationsContext {
  locationsByCoordinate: Location[];
}

export const FlightsUpload = ({ match: { params: { id } } }) => {

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [error, setError] = useState<string>(undefined);

  const context = useMemo(() => ({ additionalTypenames: ['BatteryCycle'] }), []);

  const [usedBatteriesResponse] = useQuery<IBatteryCycleQueryResponse>({
    query: QueryUsedBatteries,
    requestPolicy: 'cache-and-network',
    context
  });
  const usedBatteries = usedBatteriesResponse.data?.batteryCycles?.nodes ?? [];
  const allBatteries = usedBatteriesResponse.data?.batteries?.nodes || [];

  const [usedBattery, setUsedBattery] = React.useState<BatteryCycle>(null);
  React.useEffect(() => {
    setUsedBattery(null);
  }, [usedBatteries]);


  const [timezoneOffset, setTimezoneOffset] = React.useState(-new Date().getTimezoneOffset() / 60);
  const [locationId, setLocationId] = React.useState(null);

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

  const addUsedBattery = () => {
    setUsedBattery({
      date: formatDateTimeLocal(new Date()),
      state: BatteryState.discharged,
      batteryName: allBatteries?.[0].name ?? ''
    });
  };

  const batteryCycles = [...usedBatteries, ...(usedBattery ? [usedBattery] : [])].map(cycle => {
    return <BatteryCycleRow
      key={`cycle-${cycle.id}`}
      cells={0} cycle={cycle}
      batteries={allBatteries}
      removeEntry={() => setUsedBattery(null)} />;
  });

  const rows = flights.map((flight, index) => {
    const current = id === flight.id;

    const detailsRow = current && (
      <TableRow key={flight.id + '-details'}>
        <TableCell colSpan={5}>
          <FlightDetails
            entry={flight}
            path={path}
            nextLink={flights?.[index - 1]}
            previousLink={flights?.[index + 1]} />
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

    uploadFlightsAPI(data, timezoneOffset, locationId, (progressEvent: any) => {
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
      <ListTemplate title='Upload New Flights'>
        <span>Timezone offset </span>
        <FlightTimezone offset={timezoneOffset} onChange={setTimezoneOffset} />

        <br />
        <span>Location </span>
        <Select
          value={locationId || ''}
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
      </ListTemplate>
      <ListTemplate title='Used Batteries' createNewAction={addUsedBattery}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Battery</TableCell>
              <TableCell>Used</TableCell>
              <TableCell>Resting</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{batteryCycles}</TableBody>
        </Table>

      </ListTemplate>

      <ListTemplate title='Uploaded Flights'>
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
      </ListTemplate>
    </>
  );
}
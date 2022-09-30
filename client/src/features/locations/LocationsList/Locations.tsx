import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { formatDate, formatDateTime } from '../../../utils/date';
import { LocationDetails } from '../Location/Location';

import { useParams } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery } from 'urql';

import ClosedIcon from '@mui/icons-material/KeyboardArrowRight';
import OpenedIcon from '@mui/icons-material/KeyboardArrowDown';
import { ListTemplate } from '../../../common/ListTemplate';
import { Location } from '../../../../../shared/locations/types';
import { LocationMap } from './LocationMap';
import { Flight } from '../../../../../shared/flights/types';
import { LinkProps } from '@mui/material/Link';
import { useScroll } from '../../../common/useScroll';
import { LoadingTable } from '../../loading/Loading';

const Query = gql`
  query {
    locations(orderBy:NAME_ASC) {
      nodes {
        id
        name
        latitude
        longitude
        flights(first:1, orderBy:START_DATE_DESC) {
          totalCount
          nodes {
            id
            startDate
          }
        }
      }
    }
  }`;

const NEWID = 'add';

interface IQueryResponse {
  locations: {
    nodes: Location[]
  };
}

interface ILocationsContext {
  locations: Location[];
}

export const LocationsContext = React.createContext<ILocationsContext>({ locations: [] });

export const LocationsList = () => {

  const { id } = useParams();

  function lastUsed(flight: Flight) {
    if (!flight) {
      return;
    }

    const timestamp = formatDateTime(flight.startDate);
    return (
      <NavLink
        to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}
      >
        {timestamp}
      </NavLink>
    );
  }

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const locations = res.data?.locations?.nodes ?? [];

  const scrollRef = useScroll([id, res.fetching]);

  function details(location: Location, index: number) {
    return (<TableRow ref={scrollRef}>
      <TableCell colSpan={5}>
        <LocationDetails
          data={location}
          nextLink={locations?.[index - 1]}
          previousLink={locations?.[index + 1]}
        />
      </TableCell>
    </TableRow>);
  }

  const rows = locations.map((location, index) => {
    const current = id === String(location.id);
    return <React.Fragment key={String(location.id)}>
      <TableRow>
        <TableCell>
          {(current && <NavLink to={'/locations'}>
            <OpenedIcon />
            {location.name}
          </NavLink>) || <NavLink to={`/locations/${location.id}`}>
              <ClosedIcon />
              {location.name}
            </NavLink>}
        </TableCell>
        <TableCell>
          {location.flights?.totalCount}
        </TableCell>
        <TableCell>
          {lastUsed(location.flights?.nodes[0])}
        </TableCell>
        <TableCell>
          {location.latitude}
        </TableCell>
        <TableCell>
          {location.longitude}
        </TableCell>
      </TableRow>
      {current && details(location, index)}
    </React.Fragment>;
  });

  return <ListTemplate
    type='location'
    path='/locations'
    title='Locations'>
    <LocationMap locations={locations}></LocationMap>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Flights</TableCell>
          <TableCell>Last flight</TableCell>
          <TableCell>Latitude</TableCell>
          <TableCell>Longitide</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <LoadingTable spinning={res.fetching} error={res.error} colSpan={5} />
        {id === NEWID && details(null, Number.MIN_SAFE_INTEGER)}
        {rows}
      </TableBody>
    </Table>
  </ListTemplate>
};
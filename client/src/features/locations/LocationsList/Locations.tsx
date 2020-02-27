import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { formatDate, formatDateTime } from '../../../utils/date';
import { LocationDetails } from '../Location/Location';

import { useParams } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const planeCss = require('./Locations.css');
const css = require('../../../common/Form.css');

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';
import NewLocationIcon from '@material-ui/icons/Add';
import { Loading } from '../../loading/Loading';
import { Location } from '../../../../../shared/locations/types';
import { LocationMap } from './LocationMap';
import { Flight } from '../../../../../shared/flights/types';

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


  function details(location: Location) {
    return (<TableRow className={css.opened}>
      <TableCell colSpan={5}>
        <LocationDetails data={location} />
      </TableCell>
    </TableRow>);
  }

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const locations = res.data?.locations?.nodes ?? [];

  const rows = locations.map(location => {
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
      {current && details(location)}
    </React.Fragment>;
  });

  const AddLink = props => <Link to={`/locations/${NEWID}`} {...props} />;

  return (
    <>
      <Grid item xs={12} className={css.grid}>
        <Card>
          <CardHeader
            title='Locations'
            action={
              <Tooltip title='Add new location'>
                <IconButton component={AddLink}>
                  <NewLocationIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent className={css.loadingParent}>
            <LocationMap locations={locations}></LocationMap>
            <Table padding='none'>
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
                {id === NEWID && details(null)}
                {rows}
              </TableBody>
            </Table>
            <Loading
              spinning={res.fetching}
              error={res.error}
              overlay={true} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
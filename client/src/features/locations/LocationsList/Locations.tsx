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
import { useQuery } from 'urql';

const css = require('../../../common/Form.css');

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';
import NewLocationIcon from '@material-ui/icons/Add';
import { LoadingTable } from '../../loading/Loading';
import { Location } from '../../../../../shared/locations/types';
import { LocationMap } from './LocationMap';
import { Flight } from '../../../../../shared/flights/types';
import { LinkProps } from '@material-ui/core/Link';
import { useScroll } from '../../../common/useScroll';

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
    return (<TableRow ref={scrollRef} className={css.opened}>
      <TableCell colSpan={5}>
        <LocationDetails
          data={location}
          nextLink={locations[index - 1] && `/locations/${locations[index - 1].id}`}
          previousLink={locations[index + 1] && `/locations/${locations[index + 1].id}`}
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

  const AddLink = React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) => <Link to={`/locations/${NEWID}`} {...props} ref={ref} />);

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
          <CardContent>
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
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
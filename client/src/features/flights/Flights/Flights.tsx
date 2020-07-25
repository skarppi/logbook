import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { formatDuration } from '../../../../../shared/utils/date';
import { FlightDetails } from '../Flight/Flight';

import ClosedIcon from '@material-ui/icons/ArrowRight';
import OpenedIcon from '@material-ui/icons/ArrowDropDown';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';

import { LoadingTable } from '../../loading/Loading';
import gql from 'graphql-tag';
import { Flight } from '../../../../../shared/flights/types';
import { useQuery } from 'urql';
import { addDays } from 'date-fns';
import { formatTime, formatDate } from '../../../utils/date';
import { makeStyles } from '@material-ui/core/styles';

const Query = gql`
  query($from:Datetime!,$to:Datetime!) {
    flights(orderBy:START_DATE_DESC, filter: {startDate: {
        greaterThanOrEqualTo: $from,
        lessThan: $to
      }}) {
      nodes {
        id
        planeId
        session
        startDate
        endDate
        duration
        armedTime
        flightTime
        location {
          id
          name
        }
        favorite
        stats
        batteryCycles {
          nodes {
            batteryName
          }
        }
      }
    }
  }`;

interface IQueryResponse {
  flights: {
    nodes: Flight[];
  };
}

const useStyles = makeStyles(theme => ({
  openedCell: {
    padding: 0,
    backgroundColor: '#fafafa'
  }
}));

const renderStats = (flight: Flight) => {
  const stats = flight.stats;

  if (stats) {
    if (stats.launchHeight && stats.launchHeight !== stats.maxHeight) {
      return `${flight.session}: ${stats?.launchHeight} -> ${stats.maxHeight}m`;
    } else if (stats.maxHeight) {
      return `${flight.session}: ${stats?.maxHeight}m`;
    } else if (stats.launchHeight) {
      return `${flight.session}: ${stats?.launchHeight}m`;
    }
  }
  return flight.session;
}

export const Flights = () => {

  const { date, id } = useParams();

  const [read] = useQuery<IQueryResponse>({
    query: Query,
    variables: { from: date, to: formatDate(addDays(new Date(date), 1)) }
  });

  const path = `/flights/${date}`;

  const flights = read.data && read.data.flights.nodes || [];

  const css = useStyles();

  const rows = flights.map((flight, index) => {
    const isCurrent = id === flight.id;

    const batteries = flight.batteryCycles.nodes
      .map(b => b.batteryName)
      .join(',');

    return <React.Fragment key={flight.id}>
      <TableRow>
        <TableCell>
          <NavLink to={isCurrent ? path : `${path}/${flight.id}`}>
            {(isCurrent && <OpenedIcon />) || <ClosedIcon />}
            {formatTime(flight.startDate)}{' '}
            {flight.location &&
              `(${flight.location.name})`}
          </NavLink>
        </TableCell>
        <TableCell>
          {renderStats(flight)}
        </TableCell>
        <TableCell>
          {(flight.favorite === 1) && <FavoriteIcon />}
        </TableCell>
        <TableCell>
          {flight.planeId} {batteries && `(${batteries})`}
        </TableCell>
        <TableCell>{formatDuration(flight.flightTime)}</TableCell>
      </TableRow>
      {isCurrent && (
        <TableRow>
          <TableCell colSpan={5} className={css.openedCell}>
            <FlightDetails entry={flight}
              nextFlightLink={flights[index - 1] && `${path}/${flights[index - 1].id}`}
              previousFlightLink={flights[index + 1] && `${path}/${flights[index + 1].id}`} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment >;
  });

  return (
    <>
      <LoadingTable spinning={read.fetching} error={read.error} colSpan={4} />
      {rows}
    </>
  );
};
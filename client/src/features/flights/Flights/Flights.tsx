import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { formatDuration } from '../../../../../shared/utils/date';
import { FlightDetails } from '../Flight/Flight';

import ClosedIcon from '@material-ui/icons/ArrowRight';
import OpenedIcon from '@material-ui/icons/ArrowDropDown';
import { LoadingTable } from '../../loading/Loading';
import gql from 'graphql-tag';
import { Flight } from '../../../../../shared/flights/types';
import { useQuery } from 'urql';
import { addDays } from 'date-fns';
import { formatTime, formatDate } from '../../../utils/date';

const css = require('./Flights.css');

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
  }
}

export const Flights = () => {

  const { date, id } = useParams();

  const [read] = useQuery<IQueryResponse>({
    query: Query,
    variables: { from: date, to: formatDate(addDays(new Date(date), 1)) }
  });

  const path = `/flights/${date}`;

  const flights = read.data && read.data.flights.nodes || [];

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
        <TableCell>{flight.session}</TableCell>
        <TableCell>
          {flight.planeId} {batteries && `(${batteries})`}
        </TableCell>
        <TableCell>{formatDuration(flight.flightTime)}</TableCell>
      </TableRow>
      {isCurrent && (
        <TableRow className={css.opened}>
          <TableCell colSpan={5}>
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
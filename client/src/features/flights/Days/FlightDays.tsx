import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { formatDuration } from '../../../../../shared/utils/date';

import { Flights } from '../Flights/Flights';

import ClosedIcon from '@material-ui/icons/ChevronRight';
import OpenedIcon from '@material-ui/icons/ExpandMore';
import { Loading } from '../../loading/Loading';
import { useQuery } from 'urql';
import { ITotalRows } from '../../dashboard/Home/GraphOverTime';
import gql from 'graphql-tag';
import { formatDate, formatMonth } from '../../../utils/date';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Flight } from '../../../../../shared/flights/types';
import { parseISO } from 'date-fns';

const layout = require('../../../common/Layout.css');
const css = require('./FlightDays.css');

const Query = gql`
  query($orderBy:[FlightsByDaysOrderBy!]) {
    flightsByDays(orderBy: $orderBy) {
      nodes {
        date
        planeId
        flights
        totalTime
      }
    }
  }
`;

interface IQueryResponse {
  flightsByDays: {
    nodes: ITotalRows[]
  };
}

const groupFlightsPerMonthAndDay = (queryResponse: IQueryResponse) => {
  const flightsByDays = queryResponse?.flightsByDays.nodes || [];

  return flightsByDays.reduce((acc, obj) => {
    const month = formatMonth(obj.date);
    const day = formatDate(obj.date);

    const days = acc[month] || {};

    days[day] = (days[day] || []).concat(obj);

    acc[month] = days;
    return acc;
  }, {} as Record<string, Record<string, ITotalRows[]>>);
};

const calculateTotalsPerDay = ([day, flights]: [string, ITotalRows[]]): [string, ITotalRows] => {
  const totals: ITotalRows = {
    date: parseISO(day),
    planeId: flights.map(flight => flight.planeId).join(', '),
    flights: flights.reduce((sum, flight) => sum + flight.flights, 0),
    totalTime: flights.reduce((sum, flight) => sum + flight.totalTime, 0),
  };
  return [day, totals];
};

const calculateTotalsPerMonthAndDay = (flightsPerMonthAndDay: Record<string, Record<string, ITotalRows[]>>) => {
  return Object.entries(flightsPerMonthAndDay).reduce((acc, monthEntry) => {
    const [month, flightsPerDay] = monthEntry;

    const totalsPerDay = Object.entries(flightsPerDay).map(calculateTotalsPerDay);
    acc[month] = Object.fromEntries(totalsPerDay);
    return acc;
  }, {} as Record<string, Record<string, ITotalRows>>);
};

export const FlightDays = () => {

  const { date } = useParams();

  const [orderBy, setOrderBy] = React.useState('DATE_DESC');

  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { orderBy } });

  const flightPerMonths = groupFlightsPerMonthAndDay(read.data);
  const totalsPerMonth = calculateTotalsPerMonthAndDay(flightPerMonths);

  const flightDayRows = (flightDay: string, totals: ITotalRows, flights: ITotalRows[]) => {
    const isCurrent = date === flightDay;

    return <React.Fragment key={flightDay + '-day'}>
      <TableRow selected={isCurrent} hover={true}>
        <TableCell>
          {(isCurrent && <NavLink to={'/flights'}>
            <OpenedIcon />
            {flightDay}
          </NavLink>) || <NavLink to={`/flights/${flightDay}`}>
              <ClosedIcon />
              {flightDay}
            </NavLink>}
        </TableCell>
        <TableCell>{totals.flights}</TableCell>
        <TableCell>{totals.planeId}</TableCell>
        <TableCell>{formatDuration(totals.totalTime)}</TableCell>
      </TableRow>
      {isCurrent && (
        <TableRow className={css.opened}>
          <TableCell colSpan={4}>
            <Flights />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>;
  };

  const rows = Object.entries(flightPerMonths).map(([month, flightsPerDay]) => {
    const totalsPerDay = totalsPerMonth[month];
    const dayRows = Object.entries(flightsPerDay).map(([day, flights]) => flightDayRows(day, totalsPerDay[day], flights));

    return <React.Fragment key={month + '-month'}>
      <TableRow>
        <TableCell style={{ fontWeight: 'bold', height: 50 }}>
          {month}
        </TableCell>
        <TableCell style={{ fontWeight: 'bold' }} colSpan={2}>{Object.values(totalsPerDay).reduce((sum, row) => sum + row.flights, 0)}</TableCell>
        <TableCell style={{ fontWeight: 'bold' }}>{formatDuration(Object.values(totalsPerDay).reduce((sum, row) => sum + row.totalTime, 0))}</TableCell>
      </TableRow>
      {dayRows}
    </React.Fragment >;
  });

  return (
    <>
      <Grid item xs={12} className={layout.grid}>
        <Card>
          <CardHeader title='Flights List' />
          <CardContent className={layout.loadingParent}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy.startsWith('DATE')}
                      direction={orderBy === 'DATE_ASC' ? 'desc' : 'asc'}
                      onClick={() => setOrderBy(orderBy === 'DATE_DESC' ? 'DATE_ASC' : 'DATE_DESC')}>
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy.startsWith('FLIGHTS')}
                      direction={orderBy === 'FLIGHTS_DESC' ? 'desc' : 'asc'}
                      onClick={() => setOrderBy(orderBy === 'FLIGHTS_DESC' ? 'FLIGHTS_ASC' : 'FLIGHTS_DESC')}>
                      Flights
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Plane</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy.startsWith('TOTAL_TIME')}
                      direction={orderBy === 'TOTAL_TIME_DESC' ? 'desc' : 'asc'}
                      onClick={() => setOrderBy(orderBy === 'TOTAL_TIME_DESC' ? 'TOTAL_TIME_ASC' : 'TOTAL_TIME_DESC')}>
                      Flight Time
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{rows}</TableBody>
            </Table>
            <Loading spinning={read.fetching} error={read.error} overlay={true} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
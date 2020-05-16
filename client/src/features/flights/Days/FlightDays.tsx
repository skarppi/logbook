import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { formatDuration } from '../../../../../shared/utils/date';

import { Flights } from '../Flights/Flights';

import ClosedIcon from '@material-ui/icons/ChevronRight';
import OpenedIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import { LoadingTable } from '../../loading/Loading';
import { useQuery } from 'urql';
import { ITotalRows } from '../../dashboard/Home/GraphOverTime';
import gql from 'graphql-tag';
import { formatDate, formatMonth } from '../../../utils/date';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import makeStyles from '@material-ui/styles/makeStyles';

const Query = gql`
  query($orderBy:[FlightsByDaysOrderBy!]) {
    flightsByDays(orderBy: $orderBy) {
      nodes {
        date
        planeId
        flights
        totalTime
        favorites
      }
    }
  }
`;

interface IQueryResponse {
  flightsByDays: {
    nodes: ITotalRows[]
  };
}

export interface IMonthTotals {
  month: string;
  flights: number;
  totalTime: number;
  favorites: number;
  days: IDayTotals[]
}

export interface IDayTotals {
  day: string;
  planes: string,
  flights: number;
  totalTime: number;
  favorites: number;
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

const calculateTotalsPerDay = ([day, flights]: [string, ITotalRows[]]): IDayTotals => {
  return {
    day,
    planes: flights.map(flight => flight.planeId).join(', '),
    flights: flights.reduce((sum, flight) => sum + flight.flights, 0),
    totalTime: flights.reduce((sum, flight) => sum + flight.totalTime, 0),
    favorites: flights.reduce((sum, flight) => sum + flight.favorites, 0),
  }
};

const calculateTotalsPerMonthAndDay = (flightsPerMonthAndDay: Record<string, Record<string, ITotalRows[]>>): IMonthTotals[] => {
  return Object.entries(flightsPerMonthAndDay).map(([month, flightsPerDay]) => {
    const totalsPerDay = Object.entries(flightsPerDay).map(calculateTotalsPerDay);

    return {
      month,
      flights: totalsPerDay.reduce((sum, row) => sum + row.flights, 0),
      totalTime: totalsPerDay.reduce((sum, row) => sum + row.totalTime, 0),
      favorites: totalsPerDay.reduce((sum, row) => sum + row.favorites, 0),
      days: totalsPerDay
    };
  });
};

const useStyles = makeStyles({
  action: {
    marginRight: 0
  }
});

export const FlightDays = () => {

  const { date } = useParams();

  const [orderBy, setOrderBy] = React.useState('DATE_DESC');

  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { orderBy } });

  const groupedFlights = groupFlightsPerMonthAndDay(read.data);
  const totalsPerMonthDays = calculateTotalsPerMonthAndDay(groupedFlights);

  const flightDayRows = (totals: IDayTotals) => {
    const isCurrent = date === totals.day;

    return <React.Fragment key={totals.day + '-day'}>
      <TableRow selected={isCurrent} hover={true}>
        <TableCell>
          {(isCurrent && <NavLink to={'/flights'}>
            <OpenedIcon />
            {totals.day}
          </NavLink>) || <NavLink to={`/flights/${totals.day}`}>
              <ClosedIcon />
              {totals.day}
            </NavLink>}
        </TableCell>
        <TableCell>{totals.flights}</TableCell>
        <TableCell>{totals.favorites > 0 ? totals.favorites : ''}</TableCell>
        <TableCell>{totals.planes}</TableCell>
        <TableCell>{formatDuration(totals.totalTime)}</TableCell>
      </TableRow>
      {isCurrent && (<Flights />)}
    </React.Fragment>;
  };

  const getSorting = () => {
    const UP = orderBy.endsWith('_ASC') ? -1 : 1;
    const DOWN = orderBy.endsWith('_DESC') ? -1 : 1;

    if (orderBy.startsWith('FLIGHTS_')) {
      return (a: IMonthTotals, b: IMonthTotals) => a.flights > b.flights ? DOWN : UP;
    } else if (orderBy.startsWith('TOTAL_TIME_')) {
      return (a: IMonthTotals, b: IMonthTotals) => a.totalTime > b.totalTime ? DOWN : UP;
    } else {
      return () => null;
    }
  }

  const rows = totalsPerMonthDays.sort(getSorting()).map(monthTotals => {
    const dayRows = monthTotals.days.map(flightDayRows);

    return <React.Fragment key={monthTotals.month + '-month'}>
      <TableRow>
        <TableCell style={{ fontWeight: 'bold', height: 50 }}>
          {monthTotals.month}
        </TableCell>
        <TableCell style={{ fontWeight: 'bold' }} colSpan={3}>{monthTotals.flights}</TableCell>
        <TableCell style={{ fontWeight: 'bold' }}>{formatDuration(monthTotals.totalTime)}</TableCell>
      </TableRow>
      {dayRows}
    </React.Fragment >;
  });

  const sortLabel = (col: string, title: string) =>
    <TableSortLabel
      active={orderBy.startsWith(col)}
      direction={orderBy === `${col}_ASC` ? 'asc' : 'desc'}
      onClick={() => setOrderBy(orderBy === `${col}_DESC` ? `${col}_ASC` : `${col}_DESC`)}>
      {title}
    </TableSortLabel>;

  const css = useStyles();

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Flights List'
            style={{ marginRight: 0 }}
            classes={{ action: css.action }}
            action={
              <TextField
                id='search'
                placeholder='Search'
                type='search'
                margin='normal'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            } />
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{sortLabel('DATE', 'Date')}</TableCell>
                  <TableCell style={{ maxWidth: '1em' }}>{sortLabel('FLIGHTS', 'Flights')}</TableCell>
                  <TableCell style={{ maxWidth: '1em' }}>Favorite</TableCell>
                  <TableCell>Plane</TableCell>
                  <TableCell style={{ maxWidth: '2em' }}>{sortLabel('TOTAL_TIME', 'Flight Time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <LoadingTable spinning={read.fetching} error={read.error} colSpan={5} />
                {rows}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
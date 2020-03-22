import * as React from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Select from '@material-ui/core/Select';

import { startOfYear, addYears, startOfMonth, addMonths, startOfDay, addDays } from 'date-fns';

import { DashboardUnit } from '../../../../../shared/dashboard';

import { GraphOverTime, ITotalRows } from './GraphOverTime'
import gql from 'graphql-tag';
import { useQuery } from 'urql';

const css = require('./Home.css');

function defaultSize(unit: DashboardUnit) {
  if (unit === DashboardUnit.day) {
    return 30;
  } else if (unit === DashboardUnit.month) {
    return 12;
  } else {
    return 5;
  }
}

function sizesForUnit(unit: DashboardUnit) {
  if (unit === DashboardUnit.day) {
    return [7, 14, 30, 60, 90, 180, 365];
  } else if (unit === DashboardUnit.month) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 48];
  } else {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
}

function startDateFrom(unit: DashboardUnit, size: number) {
  const now = new Date();
  if (unit === DashboardUnit.year) {
    return startOfYear(addYears(now, -size + 1));
  } else if (unit === DashboardUnit.month) {
    return startOfMonth(addMonths(now, -size + 1));
  } else {
    return startOfDay(addDays(now, -size + 1));
  }
}

const currentResource = (unit: DashboardUnit) => {
  return `flightsBy${unit[0].toUpperCase() + unit.substring(1)}s`
}

const Query = (unit: DashboardUnit, size: number) => {
  return gql`
  query GetDashboard($since: String!) {
    ${currentResource(unit)}(filter:
      {date: {
        greaterThanOrEqualTo: $since
      }}) {
      nodes {
        date
        planeId
        flights
        totalTime
      }
    }
  }
`};

interface IQueryResponse {
  flightsByDays: {
    nodes: ITotalRows[]
  };
  flightsByMonths: {
    nodes: ITotalRows[]
  };
  flightsByYears: {
    nodes: ITotalRows[]
  };
}

const EMPTY = { nodes: [] };

export const Dashboard = () => {

  const [unit, setUnit] = React.useState(DashboardUnit.month);
  const [size, setSize] = React.useState(12);

  const sizes = sizesForUnit(unit).map(value => (
    <MenuItem key={value} value={value}>{value}</MenuItem>
  ));

  const since = startDateFrom(unit, size).toISOString();
  const [res] = useQuery<IQueryResponse>({
    query: Query(unit, size),
    variables: {
      since
    }
  });

  const data = res.data ? res.data : { allTotals: EMPTY };

  if (res.error) {
    return (<b>{res.error.message}</b>)
  }

  const flights = data[currentResource(unit)] || EMPTY;

  return (
    <Grid item xs={12} >
      <Card>
        <CardHeader title='Flights Over Time' />
        <CardContent>
          <span>Compare: </span>
          <Select value={size || sizes[2]} onChange={e => setSize(Number(e.target.value))}>
            {sizes}
          </Select>
          <Select value={unit} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newUnit = DashboardUnit[e.target.value];
            setUnit(newUnit);
            setSize(defaultSize(newUnit));
          }}>
            <MenuItem value={DashboardUnit.day}>Days</MenuItem>
            <MenuItem value={DashboardUnit.month}>Months</MenuItem>
            <MenuItem value={DashboardUnit.year}>Years</MenuItem>
          </Select>

          <div className={css.flights}>
            <GraphOverTime rows={flights.nodes} unit={unit} />
          </div>
        </CardContent>
      </Card>
    </Grid >
  );
}
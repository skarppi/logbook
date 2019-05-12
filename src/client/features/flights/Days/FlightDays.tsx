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
import { withRouter } from 'react-router-dom';
import { formatDuration, formatDate } from '../../../../shared/utils/date';

import { Flights } from '../Flights/Flights';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';
import { Loading } from '../../loading/Loading';
import { useQuery } from 'urql';
import { ITotalRows } from '../../dashboard/Home/GraphOverTime';
import gql from 'graphql-tag';

const css = require('./FlightDays.css');

const Query = gql`
  query {
    allFlightsByDays(orderBy:DATE_DESC) {
      nodes {
        date
        plane
        flights
        totalTime
      }
    }
  }
`;

interface IQueryResponse {
  allFlightsByDays: {
    nodes: ITotalRows[]
  };
}

const FlightDaysComponent = ({ match: { params: { date } } }) => {
  const [read] = useQuery<IQueryResponse>({ query: Query });

  const flightDaysAndPlanes = read.data && read.data.allFlightsByDays.nodes || [];

  const flightDays = flightDaysAndPlanes.reduce((objectsByKeyValue, obj) => {
    const value = formatDate(obj.date);
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

  const rows = Object.keys(flightDays).map(flightDay => {
    const planes = flightDays[flightDay];
    const isCurrent = date === flightDay;

    return <React.Fragment key={flightDay + '-day'}>
      <TableRow>
        <TableCell>
          {(isCurrent && <NavLink to={'/flights'}>
            <OpenedIcon />
            {flightDay}
          </NavLink>) || <NavLink to={`/flights/${flightDay}`}>
              <ClosedIcon />
              {flightDay}
            </NavLink>}
        </TableCell>
        <TableCell>{planes.reduce((sum, plane) => sum + plane.flights, 0)}</TableCell>
        <TableCell>{planes.map(plane => plane.plane).join(', ')}</TableCell>
        <TableCell>{formatDuration(planes.reduce((sum, plane) => sum + plane.totalTime, 0))}</TableCell>
      </TableRow>
      {isCurrent && (
        <TableRow className={css.opened}>
          <TableCell colSpan={4}>
            <Flights />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>;
  });

  return (
    <>
      <Grid item xs={12} className={css.grid}>
        <Card>
          <CardHeader title='Flights List' />
          <CardContent className={css.loadingParent}>
            <Table padding='none'>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Plane</TableCell>
                  <TableCell>Flight Time</TableCell>
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
}

export const FlightDays = withRouter(FlightDaysComponent);
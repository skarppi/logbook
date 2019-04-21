import * as React from 'react';

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { useQuery } from 'urql';
import gql from 'graphql-tag';

import { formatDuration } from '../../../../shared/utils/date';

import { FC } from 'react';

const TotalsQuery = gql`
  query {
    allTotals {
      nodes {
        plane
        flights
        totalTime
      }
    }
  }
`;

interface IPlaneTotals {
  plane: string;
  flights: number;
  totalTime: number;
}

interface IQueryResponse {
  allTotals: {
    nodes: IPlaneTotals[]
  };
}

export const Totals: FC = () => {

  const [res] = useQuery<IQueryResponse>({ query: TotalsQuery });

  if (res.fetching || !res.data) {
    return (<b>Loading</b>);
  }

  if (res.error) {
    return (<b>{res.error.message}</b>)
  }

  const planes = res.data.allTotals.nodes

  const rows = planes.map(plane =>
    <TableRow key={plane.plane}>
      <TableCell>
        {plane.plane}
      </TableCell>
      <TableCell>{plane.flights}</TableCell>
      <TableCell>
        {formatDuration(plane.totalTime)}
      </TableCell>
    </TableRow>
  )

  return (
    <Table padding='none'>
      <TableHead>
        <TableRow>
          <TableCell>Plane</TableCell>
          <TableCell>Flights</TableCell>
          <TableCell>Total Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{rows}</TableBody>
      <TableFooter>
        <TableRow key={'totals'}>
          <TableCell>
            Total
          </TableCell>
          <TableCell>{planes.reduce((sum, current) => sum + current.flights, 0)}</TableCell>
          <TableCell>
            {formatDuration(planes.reduce((sum, current) => sum + current.totalTime, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>)
}
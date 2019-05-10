import * as React from 'react';

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { formatDuration } from '../../../../shared/utils/date';

interface ITotalProps {
  planes: IPlaneTotals[];
}

export interface IPlaneTotals {
  plane: string;
  flights: number;
  totalTime: number;
}

export const Totals = ({ planes }: ITotalProps) => {

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
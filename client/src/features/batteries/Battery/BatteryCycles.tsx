import * as React from 'react';
import { Battery, BatteryCycle } from '../../../../../shared/batteries/types';
import { BatteryCycleRow } from './BatteryCycleRow';

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { TableHead } from '@material-ui/core';

interface IBatteryCycleProps {
  cells: number;
  cycles: BatteryCycle[];
}

export const BatteryCycles = ({ cells, cycles }: IBatteryCycleProps) => {

  const rows = cycles.map(cycle => {
    return <BatteryCycleRow key={cycle.id} cells={cells} cycle={cycle} />;
  });

  return <Table padding='default'>
    <TableHead>
      <TableRow>
        <TableCell padding='none'>Date</TableCell>
        <TableCell>Flight</TableCell>
        <TableCell padding='none'>Used</TableCell>
        <TableCell>Resting</TableCell>
        <TableCell padding='none'>Action</TableCell>
        <TableCell>Charged</TableCell>
        <TableCell padding='none'>Resistance</TableCell>
        <TableCell padding='none'></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows}
    </TableBody>
  </Table>;
}
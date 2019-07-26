import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import * as React from 'react';
import { LogicalSwitch } from '../../../../shared/planes/types';

import NewPlaneIcon from '@material-ui/icons/Add';

const layout = require('../../../common/Layout.css');

const NEWID = 'add';

interface IProps {
  switches: LogicalSwitch[];
}

export const LogicalSwitches = ({ switches }: IProps) => {
  if (!switches) {
    return <></>;
  }

  const AddLink = props => <Link to={`/planes/${NEWID}`} {...props} />;

  const rows = switches.map(ls => {
    return <React.Fragment key={ls.id}>
      <TableRow>
        <TableCell>
          {ls.id}
        </TableCell>
        <TableCell>
          {ls.func}
        </TableCell>
        <TableCell>
          {ls.v1}
        </TableCell>
        <TableCell>
          {ls.v2}
        </TableCell>
        <TableCell>
          {ls.andSwitch}
        </TableCell>
        <TableCell>
          {ls.duration}
        </TableCell>
        <TableCell>
          {ls.delay}
        </TableCell>
        <TableCell>
          {ls.description}
        </TableCell>
      </TableRow>
    </React.Fragment>;
  });

  return (
    <>
      <Grid item xs={12} className={layout.grid}>
        <Card>
          <CardHeader
            title='Logical Switches'
            action={
              <Tooltip title='Add new plane'>
                <IconButton component={AddLink}>
                  <NewPlaneIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent className={layout.loadingParent}>
            <Table padding='none'>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>V1</TableCell>
                  <TableCell>V2</TableCell>
                  <TableCell>And</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Delay</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
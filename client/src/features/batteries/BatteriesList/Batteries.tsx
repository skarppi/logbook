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
import { NavLink, Link } from 'react-router-dom';
import { formatDate, formatDateTime } from '../../../utils/date';
import { Battery } from '../../../../../shared/batteries/types';
import { LoadingIcon, LoadingTable } from '../../loading/Loading';
import { BatteryDetails } from '../Battery/Battery';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';

import NewBatteryIcon from '@material-ui/icons/Add';
import FullChargeIcon from '@material-ui/icons/BatteryChargingFull';
import StorageChargeIcon from '@material-ui/icons/BatteryCharging50';
import { BatteryState } from '../../../../../shared/batteries';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';
import { CreateBatteryCycle } from '../Battery/BatteryCycleRow';

const Query = gql`
  query {
    batteries(orderBy: NAME_ASC) {
      nodes {
        id
			  name
        type
        cells
        capacity
        batteryCycles(first:1, orderBy: DATE_DESC) {
          nodes {
            id
            date
            state
            flightId
          }
        }
      }
    }
  }`;

interface IQueryResponse {
  batteries: {
    nodes: Battery[]
  };
}

const NEWID = 'add';

export const BatteriesList = ({ match: { params } }) => {

  function lastState({ nodes }) {
    const [cycle] = nodes;
    if (!cycle) {
      return;
    }
    return cycle.state;
  }

  function lastUsed({ nodes }) {
    const [cycle] = nodes;
    if (!cycle) {
      return;
    }

    const timestamp = formatDateTime(cycle.date);

    if (!cycle.flightId) {
      return timestamp;
    }

    return (
      <NavLink
        to={`/flights/${formatDate(cycle.date)}/${
          cycle.flightId
          }`}
      >
        {timestamp}
      </NavLink>
    );
  }

  const [charged, chargeBattery] = useMutation(CreateBatteryCycle);

  function batteryOps(battery) {
    return (
      <>
        <IconButton
          onClick={_ => chargeBattery({
            cycle: {
              date: new Date(),
              batteryName: battery.name,
              state: BatteryState.storage,
            }
          })}
        >
          <StorageChargeIcon />
        </IconButton>
        <IconButton
          onClick={_ => chargeBattery({
            cycle: {
              date: new Date(),
              batteryName: battery.name,
              state: BatteryState.charged,
            }
          })}
        >
          <FullChargeIcon />
        </IconButton>
        <LoadingIcon spinning={charged.fetching} error={charged.error} />
      </>
    );
  }

  const details = (id: number) =>
    <TableRow>
      <TableCell colSpan={5}>
        <BatteryDetails id={id} />
      </TableCell>
    </TableRow>;

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const batteries = res.data && res.data.batteries ? res.data.batteries.nodes : [];

  const rows = batteries.map(battery => {
    const current = params.id === String(battery.id);
    return <React.Fragment key={String(battery.id)}>
      <TableRow>
        <TableCell>
          {(current && <NavLink to={'/batteries'}>
            <OpenedIcon />
            {battery.name}
          </NavLink>) || <NavLink to={`/batteries/${battery.id}`}>
              <ClosedIcon />
              {battery.name}
            </NavLink>}
        </TableCell>
        <TableCell>
          {battery.type} {battery.cells}s {battery.capacity}mAh
          </TableCell>
        <TableCell>{lastState(battery.batteryCycles)}</TableCell>
        <TableCell>{lastUsed(battery.batteryCycles)}</TableCell>
        <TableCell>{batteryOps(battery)}</TableCell>
      </TableRow>
      {params.id === String(battery.id) && details(battery.id)}
    </React.Fragment>;
  });

  const AddLink = props => <Link to={`/batteries/${NEWID}`} {...props} />;

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Batteries'
            action={
              <Tooltip title='Add new battery'>
                <IconButton component={AddLink}>
                  <NewBatteryIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Current status</TableCell>
                  <TableCell>Last used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <LoadingTable spinning={res.fetching} error={res.error} colSpan={5} />
                {params.id === NEWID && details(-1)}
                {rows}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
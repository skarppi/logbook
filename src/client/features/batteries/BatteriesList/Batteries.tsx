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
import { formatDate, formatDateTime } from '../../../../shared/utils/date';
import { Battery } from '../../../../shared/batteries/types';
import { Loading } from '../../loading/Loading';
import { BatteryDetails } from '../Battery/Battery';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';

import NewBatteryIcon from '@material-ui/icons/Add';
import FullChargeIcon from '@material-ui/icons/BatteryChargingFull';
import StorageChargeIcon from '@material-ui/icons/BatteryCharging50';
import { BatteryState } from '../../../../shared/batteries';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const css = require('./Batteries.css');

const Query = gql`
  query {
    batteries(orderBy: NAME_ASC) {
      nodes {
        id
			  name
        type
        cells
        capacity
        batteryCyclesByBatteryName(first:1, orderBy: DATE_DESC) {
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

const Charge = gql`
  mutation ($batteryCycle: BatteryCycleInput!) {
    createBatteryCycle(input: {batteryCycle: $batteryCycle}) {
      batteryCycle {
        id
        date
        name
        flightId
        state
        voltage
        discharged
        charged
      }
    }
  }`;


interface IRouteParams {
  id: number;
}

const NEWID = 'add';

export const BatteriesList = ({ match: { params } }) => {

  // const { params }: { params: IRouteParams } = match;

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

  const [charged, chargeBattery] = useMutation(Charge);

  function batteryOps(battery) {
    return (
      <>
        <IconButton
          onClick={_ => chargeBattery({
            batteryCycle: {
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
            batteryCycle: {
              date: new Date(),
              batteryName: battery.name,
              state: BatteryState.charged,
            }
          })}
        >
          <FullChargeIcon />
        </IconButton>
      </>
    );
  }

  function details(id: number) {
    return (<TableRow className={css.opened}>
      <TableCell colSpan={5}>
        <BatteryDetails id={id} />
      </TableCell>
    </TableRow>);
  }

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
        <TableCell>{battery.lastCycle && battery.lastCycle.state}</TableCell>
        <TableCell>{lastUsed(battery.batteryCyclesByBatteryName)}</TableCell>
        <TableCell>{batteryOps(battery)}</TableCell>
      </TableRow>
      {params.id === String(battery.id) && details(battery.id)}
    </React.Fragment>;
  });

  const AddLink = props => <Link to={`/batteries/${NEWID}`} {...props} />;

  return (
    <>
      <Grid item xs={12} className={css.grid}>
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
          <CardContent className={css.loadingParent}>
            <Table padding='none'>
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
                {params.id === NEWID && details(-1)}
                {rows}
              </TableBody>
            </Table>
            <Loading
              spinning={res.fetching || charged.fetching}
              error={res.error || charged.error}
              overlay={true} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
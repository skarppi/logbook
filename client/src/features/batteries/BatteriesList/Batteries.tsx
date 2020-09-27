import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';

import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { formatDate, formatDateTime } from '../../../utils/date';
import { Battery } from '../../../../../shared/batteries/types';
import { LoadingIcon, LoadingTable } from '../../loading/Loading';
import { BatteryDetails } from '../Battery/Battery';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';

import FullChargeIcon from '@material-ui/icons/BatteryChargingFull';
import StorageChargeIcon from '@material-ui/icons/BatteryCharging50';
import { BatteryState } from '../../../../../shared/batteries';
import { useScroll } from '../../../common/useScroll';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';
import { CREATE_BATTERY_CYCLE } from '../Battery/BatteryCycle';
import { makeStyles } from '@material-ui/core/styles';
import { ListTemplate } from '../../../common/ListTemplate';

const Query = gql`
  query {
    batteries(orderBy: NAME_ASC) {
      nodes {
        id
			  name
        type
        cells
        capacity
        retirementDate
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

const useStyles = makeStyles({
  selectedRow: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});


export const BatteriesList = ({ match: { params } }) => {

  function lastState(battery: Battery) {
    if (battery.retirementDate) {
      return 'RETIRED';
    }

    const cycle = battery.batteryCycles?.nodes?.[0];
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
        to={`/flights/${formatDate(cycle.date)}/${cycle.flightId
          }`}
      >
        {timestamp}
      </NavLink>
    );
  }

  const [charged, chargeBattery] = useMutation(CREATE_BATTERY_CYCLE);

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
      </>
    );
  }

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const batteries = res.data && res.data.batteries ? res.data.batteries.nodes : [];

  const scrollRef = useScroll([params.id, res.fetching]);

  const css = useStyles();

  const details = (id: number, index: number) =>
    <TableRow ref={scrollRef}>
      <TableCell colSpan={5}>
        <BatteryDetails
          id={id}
          nextLink={batteries?.[index - 1]}
          previousLink={batteries?.[index + 1]}
        />
      </TableCell>
    </TableRow >;

  const rows = batteries.map((battery, index) => {
    const isCurrent = params.id === String(battery.id);
    return <React.Fragment key={String(battery.id)}>
      <TableRow className={isCurrent ? css.selectedRow : ''}>
        <TableCell>
          {(isCurrent && <NavLink to={'/batteries'}>
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
        <TableCell>{lastState(battery)}</TableCell>
        <TableCell>{lastUsed(battery.batteryCycles)}</TableCell>
        <TableCell>{batteryOps(battery)}</TableCell>
      </TableRow>
      {params.id === String(battery.id) && details(battery.id, index)}
    </React.Fragment>;
  });

  return <ListTemplate
    type='battery'
    path='/batteries'
    title='Batteries'>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Current status</TableCell>
          <TableCell>Last used</TableCell>
          <TableCell>
            Actions
            <LoadingIcon spinning={charged.fetching} error={charged.error} />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <LoadingTable spinning={res.fetching} error={res.error} colSpan={5} />
        {params.id === NEWID && details(-1, Number.MIN_SAFE_INTEGER)}
        {rows}
      </TableBody>
    </Table>
  </ListTemplate>
};
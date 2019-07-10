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
import { Plane } from '../../../../shared/planes/types';
import { Loading } from '../../loading/Loading';
import { PlaneDetails } from '../Plane/Plane';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';

import NewPlaneIcon from '@material-ui/icons/Add';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const layout = require('../../../common/Layout.css');

const Query = gql`
  query {
    allPlanes(orderBy: ID_ASC) {
      nodes {
        id
        type,
      }
    }
  }`;

interface IQueryResponse {
  allPlanes: {
    nodes: Plane[]
  };
}

const Charge = gql`
  mutation ($planeCycle: PlaneCycleInput!) {
    createPlaneCycle(input: {planeCycle: $planeCycle}) {
      planeCycle {
        id
        date
        planeName
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

export const PlanesList = ({ match: { params } }) => {

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

  function details(id: string) {
    return (<TableRow className={layout.opened}>
      <TableCell colSpan={5}>
        <PlaneDetails id={id} />
      </TableCell>
    </TableRow>);
  }

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const planes = res.data && res.data.allPlanes ? res.data.allPlanes.nodes : [];

  const rows = planes.map(plane => {
    const current = params.id === plane.id;
    return <React.Fragment key={plane.id}>
      <TableRow>
        <TableCell>
          {(current && <NavLink to={'/planes'}>
            <OpenedIcon />
            {plane.id}
          </NavLink>) || <NavLink to={`/planes/${plane.id}`}>
              <ClosedIcon />
              {plane.id}
            </NavLink>}
        </TableCell>
        <TableCell>
          {plane.type}
        </TableCell>
        {/* <TableCell>{plane.lastCycle && plane.lastCycle.state}</TableCell> */}
        {/* <TableCell>{lastUsed(plane.planeCyclesByPlaneName)}</TableCell> */}
      </TableRow>
      {params.id === plane.id && details(plane.id)}
    </React.Fragment>;
  });

  const AddLink = props => <Link to={`/planes/${NEWID}`} {...props} />;

  return (
    <>
      <Grid item xs={12} className={layout.grid}>
        <Card>
          <CardHeader
            title='Planes'
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
                  <TableCell>Type</TableCell>
                  <TableCell>Current status</TableCell>
                  <TableCell>Last used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {params.id === NEWID && details('')}
                {rows}
              </TableBody>
            </Table>
            <Loading
              spinning={res.fetching}
              error={res.error}
              overlay={true} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
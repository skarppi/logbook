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

import { useParams } from 'react-router-dom';

import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { formatDuration } from '../../../../../shared/utils/date';
import { Plane, LogicalSwitch } from '../../../../../shared/planes/types';
import { LoadingTable } from '../../loading/Loading';
import { PlaneDetails } from '../Plane/Plane';
import { LogicalSwitches } from './LogicalSwitches';

import ClosedIcon from '@material-ui/icons/KeyboardArrowRight';
import OpenedIcon from '@material-ui/icons/KeyboardArrowDown';

import NewPlaneIcon from '@material-ui/icons/Add';

import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { Flight } from '../../../../../shared/flights/types';
import { formatDateTime, formatDate } from '../../../utils/date';
import { LinkProps } from '@material-ui/core/Link';
import { useScroll } from '../../../common/useScroll';

const Query = gql`
  query {
    planes(orderBy: ID_ASC) {
      nodes {
        id
        type,
        totalByPlane {
          flights
          totalTime
        }
        flights(orderBy: START_DATE_DESC, first: 1) {
          nodes {
            id
            startDate
          }
        }
      }
    }
    logicalSwitches {
      nodes {
        id
        nodeId
        func
        v1
        v2
        andSwitch
        duration
        delay
        description
      }
    }
  }`;

interface IPlaneResponse extends Plane {
  flights: {
    nodes: Flight[];
  };
}

interface IQueryResponse {
  planes: {
    nodes: IPlaneResponse[];
  };
  logicalSwitches: {
    nodes: LogicalSwitch[];
  };
}

interface IRouteParams {
  id: number;
}

const NEWID = 'add';

interface IPlanesContext {
  planes: Plane[];
  logicalSwitches: LogicalSwitch[];
}

export const PlanesContext = React.createContext<IPlanesContext>({ planes: [], logicalSwitches: [] });

export const PlanesList = () => {

  const { id } = useParams();

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const planes = res.data && res.data.planes ? res.data.planes.nodes : [];
  const logicalSwitches = res.data && res.data.logicalSwitches ? res.data.logicalSwitches.nodes : [];

  const scrollRef = useScroll([id, res.fetching]);

  function lastFlown({ nodes }) {
    const [flight] = nodes;
    if (!flight) {
      return;
    }

    const timestamp = formatDateTime(flight.startDate);
    return (
      <NavLink
        to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}
      >
        {timestamp}
      </NavLink>
    );
  }

  function details(id: string, index: number) {
    return (<TableRow ref={scrollRef}>
      <TableCell colSpan={5}>
        <PlaneDetails id={id}
          nextLink={planes?.[index - 1]}
          previousLink={planes?.[index + 1]}
        />
      </TableCell>
    </TableRow>);
  }

  const rows = planes.map((plane, index) => {
    const current = id === plane.id;
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
        <TableCell>{plane.totalByPlane && plane.totalByPlane.flights}</TableCell>
        <TableCell>{plane.totalByPlane && formatDuration(plane.totalByPlane.totalTime)}</TableCell>
        <TableCell>{lastFlown(plane.flights)}</TableCell>
      </TableRow>
      {id === plane.id && details(plane.id, index)}
    </React.Fragment>;
  });

  const AddLink = React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) => <Link to={`/planes/${NEWID}`} {...props} ref={ref} />);

  return (
    <PlanesContext.Provider value={{ planes, logicalSwitches }} >
      <Grid item xs={12}>
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
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Flights</TableCell>
                  <TableCell>Total Time</TableCell>
                  <TableCell>Last flight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <LoadingTable spinning={res.fetching} error={res.error} colSpan={5} />
                {id === NEWID && details('', Number.MIN_SAFE_INTEGER)}
                {rows}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <LogicalSwitches />
    </PlanesContext.Provider>
  );
};


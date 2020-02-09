import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';
import { Plane, LogicalSwitch, Telemetry } from '../../../../../shared/planes/types';
import { LogicalFunction } from '../../../../../shared/planes/index';
import { PlaneGraph } from './PlaneGraph';

import { withRouter } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const planeCss = require('./Plane.css');
const css = require('../../../common/Form.css');

import DeleteIcon from '@material-ui/icons/Delete';
import { Loading } from '../../loading/Loading';
import Divider from '@material-ui/core/Divider';
import { PlaneType } from '../../../../../shared/planes';
import { Battery } from '../../../../../shared/batteries/types';
import { PlaneForm } from './PlaneForm';
import { useContext } from 'react';
import { PlanesContext } from '../PlanesList/Planes';

const Query = gql`
  query($id:String!) {
    plane(id: $id) {
      id
      nodeId,
      type,
      batterySlots
      telemetries
      modeArmed
      modeFlying
      modeStopped
      modeRestart
      modeStoppedStartsNewFlight
      planeBatteries {
        nodes {
          batteryName
        }
      }
      flights(orderBy: START_DATE_DESC, first: 1) {
        nodes {
          id
          startDate
          segments
        }
      }
    }
    batteries(orderBy:NAME_ASC) {
      nodes {
        name
      }
    }
  }`;


interface IQueryResponse {
  plane: Plane;
  batteries: {
    nodes: Battery[]
  };
}

const Create = gql`
  mutation($plane:PlaneInput!) {
    createPlane(input: {plane: $plane}) {
      plane {
        id
        type
        batterySlots
        telemetries
      }
    }
  }`;

const Update = gql`
  mutation($id:String!, $plane:PlanePatch!, $batteries: [String]!) {
    updatePlane(input: {id: $id, patch: $plane}) {
      plane {
        id
        type
        batterySlots
        telemetries
      }
    }
    updatePlaneBatteries(input: {plane: $id, batteries: $batteries}) {
      strings
    }
   }`;

const Delete = gql`
  mutation($id:String!) {
    deletePlane(input: {id: $id}) {
      plane {
        id
      }
    }
  }`;

const mergePlaneTelemetries = (plane: Plane) => {
  const { flights, ...planeWithoutFlights } = plane;

  const flight = flights.nodes && flights.nodes[0];
  if (flight != null) {
    const items = flight.segments[0].rows[0];
    plane.telemetries = Object.keys(items).map(id => {
      if (plane.telemetries) {
        // preserve old values
        const oldTelemetry = plane.telemetries.find(telemetry => telemetry.id === id);
        if (oldTelemetry) {
          return oldTelemetry;
        }
      }
      return {
        id,
        default: false,
        ignore: false
      };
    });
  }
  return planeWithoutFlights;
};

const PlaneDetailsComponent = ({ id, history }) => {

  const { logicalSwitches } = useContext(PlanesContext);

  const NEW_PLANE: Plane = {
    id: '',
    type: PlaneType.drone,
    batterySlots: 0,
    telemetries: [],
    modeArmed: 'L01',
    modeFlying: 'L02',
    modeStopped: 'L03',
    modeRestart: 'L04',
    modeStoppedStartsNewFlight: false
  };

  const requestPolicy = id === NEW_PLANE.id ? 'cache-only' : 'cache-first';

  // graphql CRUD operations
  const [create, createPlane] = useMutation(Create);
  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { id }, requestPolicy });
  const [update, updatePlane] = useMutation(Update);
  const [del, deletePlane] = useMutation(Delete);

  // local state
  const [plane, setPlane] = React.useState(NEW_PLANE);
  React.useEffect(() => {
    if (read.data && read.data.plane) {
      setPlane(mergePlaneTelemetries(read.data.plane));
    }
  }, [read]);

  // modify local state
  const changeNumber = ({ target: { name, value } }) =>
    setPlane({ ...plane, [name]: Number(value) });

  const changeDate = ({ target: { name, value } }) =>
    setPlane({ ...plane, [name]: new Date(value) });

  const changePlane = ({ target: { name, value } }) =>
    setPlane({ ...plane, [name]: value });

  // update to server
  const save = () => {
    if (!plane.nodeId) {
      createPlane({ plane }).then(res => {
        if (!res.error) {
          history.push(`/planes/${res.data.createPlane.plane.id}`);
        }
      });
    } else {
      const { planeBatteries, nodeId, ['__typename']: _, ...patch } = plane;
      updatePlane({ id, plane: patch, batteries: planeBatteries.nodes.map(n => n.batteryName) });
    }
  };

  const executeDelete = _ => {
    deletePlane({ planeId: plane.id }).then(res => {
      if (!res.error) {
        history.push('/planes');
      }
    });
  };

  return (
    <Card className={css.card}>
      <CardHeader
        title={
          <>
            <span ref={this.onTop}>Plane: </span>
            <TextField
              required
              error={id === NEW_PLANE.id && plane.id.length === 0}
              id='id'
              placeholder='Id'
              className={css.textField}
              value={plane.id}
              name='id'
              onChange={changePlane}
              onBlur={({ target: { value } }) => value.length > 0 && save()}
              margin='none'
            />
          </>
        }
        action={
          <>
            <Loading
              spinning={read.fetching || update.fetching || create.fetching || del.fetching}
              error={read.error || update.error || create.error || del.error}
              overlay={false}
            />

            {plane.id &&
              <Tooltip title='Delete plane'>
                <IconButton onClick={executeDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>}
          </>
        }
      />
      <CardContent hidden={plane.id === ''}>
        <PlaneForm plane={plane} allBatteries={read.data && read.data.batteries.nodes || []} setPlane={setPlane} save={save} />

        <Divider variant='middle' />

        <div className={planeCss.graph}>
          <PlaneGraph cycles={[]}></PlaneGraph>
        </div>
      </CardContent>
    </Card>
  );
};

export const PlaneDetails = withRouter(PlaneDetailsComponent);
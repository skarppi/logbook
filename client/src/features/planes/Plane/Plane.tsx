import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { Plane } from '../../../../../shared/planes/types';
import { PlaneGraph } from './PlaneGraph';

import { useHistory } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

import Divider from '@material-ui/core/Divider';
import { PlaneType } from '../../../../../shared/planes';
import { Battery } from '../../../../../shared/batteries/types';
import { PlaneForm } from './PlaneForm';
import Box from '@material-ui/core/Box';
import { DetailsTemplate } from '../../../common/DetailsTemplate';

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
    planeWithoutFlights.telemetries = Object.keys(items).map(id => {
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

export const PlaneDetails = ({ id, nextLink, previousLink }) => {

  const history = useHistory();

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
    deletePlane({ id: plane.id }).then(res => {
      if (!res.error) {
        history.push('/planes');
      }
    });
  };

  return <DetailsTemplate
    type='plane'
    path='/planes'
    title={
      <>
        <span>Plane: </span>
        <TextField
          required
          error={id === NEW_PLANE.id && plane.id.length === 0}
          id='id'
          placeholder='Id'
          value={plane.id}
          name='id'
          onChange={changePlane}
          onBlur={({ target: { value } }) => value.length > 0 && save()}
          margin='none'
        />
      </>
    }
    previousLink={previousLink}
    nextLink={nextLink}
    queries={[read, update, create, del]}
    deleteAction={plane.id !== NEW_PLANE.id && executeDelete}
    hidden={plane.id === ''}>
    <PlaneForm plane={plane} allBatteries={read.data && read.data.batteries.nodes || []} setPlane={setPlane} save={save} />

    <Divider variant='middle' />

    <Box height='500px' width='92vw' maxWidth='1200px'>
      <PlaneGraph cycles={[]}></PlaneGraph>
    </Box>
  </DetailsTemplate>
};
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import * as React from 'react';
import { Plane, LogicalSwitch } from '../../../../shared/planes/types';
import { LogicalFunction } from '../../../../shared/planes/index';
import { PlaneGraph } from './PlaneGraph';

import { withRouter } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const planeCss = require('./Plane.css');
const css = require('../../../common/Form.css');
import DeleteIcon from '@material-ui/icons/Delete';
import { Loading } from '../../loading/Loading';
import { formatDate } from '../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import Divider from '@material-ui/core/Divider';
import { PlaneType } from '../../../../shared/planes';

const planeTypes = ['LiPo', 'LiHV'];
const cellCounts = [1, 2, 3, 4, 5, 6];

const Query = gql`
  query($id:String!) {
    planeById(id: $id) {
      id
      type,
      batterySlots
      telemetries
      modeArmed
      modeFlying
      modeStopped
      modeRestart
      modeStoppedStartsNewFlight
    }
  }`;

interface IQueryResponse {
  planeById: Plane;
}

const Create = gql`
  mutation($plane:PlaneInput!) {
    createPlane(input: {plane: $plane}) {
      plane {
        id
        name
        purchaseDate
        type
        cells
        capacity
      }
    }
  }`;

const Update = gql`
  mutation($id:Int!, $plane:PlanePatch!) {
    updatePlaneById(input: {id: $id, planePatch: $plane}) {
      plane {
        id
        name
        purchaseDate
        type
        cells
        capacity
      }
    }
  }`;

const Delete = gql`
  mutation($planeId:Int!) {
    deletePlaneCyclesByPlaneId(input: {planeId: $planeId}) {
      plane {
        id
      }
    }
  }`;

const logicalSwitches: { [key: string]: LogicalSwitch } = {
  // default switches for quad with SB arming switch
  L01: {
    id: 'L01', func: LogicalFunction.greaterThan, v1: 'SB', v2: '-1', description: 'SB not up = armed'
  },
  L02: {
    id: 'L02', func: LogicalFunction.greaterThan, v1: 'Thr', v2: '-922', description: 'Throttle > 5% = flying'
  },
  L03: {
    id: 'L03', func: LogicalFunction.lessThan, v1: 'Thr', v2: '-922', duration: 3, description: 'Throttle < 5% = stopped'
  },
  L04: {
    id: 'L04', func: LogicalFunction.is, v1: null, duration: 10, description: 'No data for 10 seconds = new flight'
  },

  // default switches for glider with SA launch switch (SoarOTX)
  L11: {
    id: 'L11', func: LogicalFunction.greaterThan, v1: 'SA', v2: '-1', description: 'SA not up = armed/launch mode'
  },
  L12: {
    id: 'L12', func: LogicalFunction.greaterThan, v1: 'VSpd(m/s)', v2: '1', description: 'Vertical speed more than 1m/s = flying'
  },
  L13: {
    id: 'L13', func: LogicalFunction.lessThan, v1: 'SA', v2: '1', description: 'SA not down = back to launch mode'
  },
  L14: {
    id: 'L14', func: LogicalFunction.is, v1: null, duration: 2, description: 'No data for 2 seconds'
  }
};


const NEW_PLANE: Plane = {
  id: '',
  type: PlaneType.drone,
  batterySlots: 0,
  batteries: [],
  ignoreTelemetries: [],
  flightModes: [],
  modes: {
    armed: logicalSwitches.L01,
    flying: logicalSwitches.L02,
    stopped: logicalSwitches.L03,
    restart: logicalSwitches.L04,
    stoppedStartsNewFlight: false
  }
};

const PlaneDetailsComponent = ({ id, history }) => {

  // graphql CRUD operations
  const [create, createPlane] = useMutation(Create);
  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { id } });
  const [update, updatePlane] = useMutation(Update);
  const [del, deletePlane] = useMutation(Delete);

  // local state
  const [plane, setPlane] = React.useState(NEW_PLANE);
  React.useEffect(() => {
    if (read.data && read.data.planeById) {
      setPlane(read.data.planeById);
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
    if (!plane.id) {
      createPlane({ plane }).then(res => {
        if (!res.error) {
          history.push(`/planes/${res.data.createPlane.plane.id}`);
        }
      });
    } else {
      delete plane['__typename'];
      updatePlane({ id: plane.id, plane });
    }
  };
  const executeDelete = _ => {
    deletePlane({ planeId: plane.id }).then(res => {
      if (!res.error) {
        history.push('/planes');
      }
    });
  };

  // private onTop = React.createRef<HTMLSpanElement>();

  // componentDidMount() {
  //   this.onTop.current.scrollIntoView();
  // }

  const cycles = [];//plane.planeCyclesByPlaneName && plane.planeCyclesByPlaneName.nodes || [];

  // const voltages = cycles.filter(c => c.voltage);

  return (
    <Card className={css.card}>
      <CardHeader
        title={
          <>
            <span ref={this.onTop}>Plane: </span>
            <TextField
              required
              error={plane.id.length === 0}
              id='id'
              placeholder='Name'
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
        <div className={css.container}>
          <FormControl className={css.formControl} margin='normal'>
            <InputLabel htmlFor='select-multiple-checkbox'>Type</InputLabel>
            <Select
              value={plane.type}
              name={'type'}
              onChange={changePlane}
              onBlur={save}
              input={<Input id='select-multiple-checkbox' />}
            >
              {planeTypes.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={css.formControl} margin='normal'>
            <InputLabel htmlFor='select-multiple-checkbox'>Battery Slots</InputLabel>
            <Select
              value={plane.batterySlots}
              name={'battery slots'}
              onChange={changePlane}
              onBlur={save}
              input={<Input id='select-multiple-checkbox' />}
            >
              {cellCounts.map(count => (
                <MenuItem key={count} value={count}>
                  {count}s
                  </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <TextField
            type='number'
            id='capacity'
            label='Capacity'
            placeholder='Capacity'
            className={css.textField}
            value={plane.batteries}
            name='capacity'
            onChange={changeNumber}
            onBlur={save}
            margin='normal'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>mAh</InputAdornment>
              )
            }}
          />

          <TextField
            id='purchaseDate'
            name='purchaseDate'
            type='date'
            label='Purchase Date'
            value={formatDate(plane.purchaseDate)}
            onChange={changeDate}
            onBlur={save}
            className={css.textField}
            margin='normal'
          /> */}
        </div>

        <Divider variant='middle' />

        <Table padding='none'>
          <TableBody>
            <TableRow>
              <TableCell>
                Flights
                </TableCell>
              <TableCell>
                {cycles.filter(c => c.flightByFlightId).length}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Charge cycles
                </TableCell>
              <TableCell>
                {/* {cycles.filter(c => c.state === PlaneState.charged).length} */}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Average voltage
                </TableCell>
              <TableCell>
                {
                  // voltages.length > 0 ? Math.round(voltages.reduce((sum, c) => sum + Number(c.voltage), 0) / voltages.length * 100) / 100 : '-'
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className={planeCss.graph}>
          <PlaneGraph cycles={cycles}></PlaneGraph>
        </div>
      </CardContent>
    </Card>
  );
};

export const PlaneDetails = withRouter(PlaneDetailsComponent);
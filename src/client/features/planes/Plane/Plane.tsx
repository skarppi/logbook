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
import Divider from '@material-ui/core/Divider';
import { PlaneType } from '../../../../shared/planes';
import Chip from '@material-ui/core/Chip';
import { Battery } from '../../../../shared/batteries/types';

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
      planeBatteriesByPlaneId {
        nodes {
          batteryName
        }
      }
    }
    allBatteries(orderBy:NAME_ASC) {
      nodes {
        name
      }
    }
  }`;

interface IPlaneQueryResponse extends Plane {
  planeBatteriesByPlaneId: {
    nodes: Array<{
      batteryName: string
    }>
  }
}

interface IQueryResponse {
  planeById: IPlaneQueryResponse;
  allBatteries: {
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
    updatePlaneById(input: {id: $id, planePatch: $plane}) {
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
    deletePlaneById(input: {id: $id}) {
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
      const p = read.data.planeById;
      p.batteries = p.planeBatteriesByPlaneId.nodes.map(b => b.batteryName);
      delete p['planeBatteriesByPlaneId'];

      setPlane(p);
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

      const { batteries, ...patch } = plane;
      updatePlane({ id: plane.id, plane: patch, batteries });
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
              {Object.keys(PlaneType).sort().map(name => (
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
              name={'batterySlots'}
              onChange={changePlane}
              onBlur={save}
              input={<Input id='select-multiple-checkbox' />}
            >
              <MenuItem key={0} value={0}>0</MenuItem>
              <MenuItem key={1} value={1}>1</MenuItem>
              <MenuItem key={2} value={2}>2</MenuItem>
            </Select>
          </FormControl>

          <FormControl className={css.formControl} margin='normal'>
            <InputLabel htmlFor='select-multiple-chip'>Available Batteries</InputLabel>
            <Select
              multiple
              value={plane.batteries || []}
              name={'batteries'}
              onChange={changePlane}
              onBlur={save}
              input={<Input id='select-multiple-chip' />}
              renderValue={selected => (
                <div className={planeCss.chips}>
                  {plane.batteries.map(battery => (
                    <Chip key={battery} label={battery} className={planeCss.chip} />
                  ))}
                </div>
              )}
            // MenuProps={PaperProps: {
            //   style: {
            //     maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            //     width: 250,
            //   },
            // },}
            >
              {read.data && read.data.allBatteries && read.data.allBatteries.nodes.map(battery => (
                <MenuItem key={battery.name} value={battery.name}>
                  {battery.name}
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

        <div className={planeCss.graph}>
          <PlaneGraph cycles={cycles}></PlaneGraph>
        </div>
      </CardContent>
    </Card>
  );
};

export const PlaneDetails = withRouter(PlaneDetailsComponent);
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
import { Battery } from '../../../../shared/batteries/types';
import { BatteryGraph } from './BatteryGraph';

import { withRouter } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const batteryCss = require('./Battery.css');
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
import { BatteryState } from '../../../../shared/batteries';

const batteryTypes = ['LiPo', 'LiHV'];
const cellCounts = [1, 2, 3, 4, 5, 6];

const Query = gql`
  query($id:Int!) {
    batteryById(id: $id) {
      id
      name
      purchaseDate
      type
      cells
      capacity
      batteryCyclesByBatteryName(orderBy: DATE_ASC) {
        nodes {
          id
          date
          state
          voltage
          discharged
          charged
          resistance
          flightByFlightId {
            armedTime
            flightTime
          }
        }
      }
    }
  }`;

interface IQueryResponse {
  batteryById: Battery;
}

const Create = gql`
  mutation($battery:BatteryInput!) {
    createBattery(input: {battery: $battery}) {
      battery {
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
  mutation($id:Int!, $battery:BatteryPatch!) {
    updateBatteryById(input: {id: $id, batteryPatch: $battery}) {
      battery {
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
  mutation($batteryId:Int!) {
    deleteBatteryCyclesByBatteryId(input: {batteryId: $batteryId}) {
      battery {
        id
      }
    }
  }`;


const NEW_BATTERY: Battery = {
  name: '',
  purchaseDate: new Date(),
  type: '',
  cells: 0,
  capacity: 0
};

const BatteryDetailsComponent = ({ id, history }) => {

  // graphql CRUD operations
  const [create, createBattery] = useMutation(Create);
  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { id } });
  const [update, updateBattery] = useMutation(Update);
  const [del, deleteBattery] = useMutation(Delete);

  // local state
  const [battery, setBattery] = React.useState(NEW_BATTERY);
  React.useEffect(() => {
    if (read.data && read.data.batteryById) {
      setBattery(read.data.batteryById);
    }
  }, [read]);

  // modify local state
  const changeNumber = ({ target: { name, value } }) =>
    setBattery({ ...battery, [name]: Number(value) });

  const changeDate = ({ target: { name, value } }) =>
    setBattery({ ...battery, [name]: new Date(value) });

  const changeBattery = ({ target: { name, value } }) =>
    setBattery({ ...battery, [name]: value });

  // update to server
  const save = () => {
    if (!battery.id) {
      createBattery({ battery }).then(res => {
        if (!res.error) {
          history.push(`/batteries/${res.data.createBattery.battery.id}`);
        }
      });
    } else {
      delete battery['__typename'];
      updateBattery({ id: battery.id, battery });
    }
  };
  const executeDelete = _ => {
    deleteBattery({ batteryId: battery.id }).then(res => {
      if (!res.error) {
        history.push('/batteries');
      }
    });
  };

  // private onTop = React.createRef<HTMLSpanElement>();

  // componentDidMount() {
  //   this.onTop.current.scrollIntoView();
  // }

  const cycles = battery.batteryCyclesByBatteryName && battery.batteryCyclesByBatteryName.nodes || [];

  const voltages = cycles.filter(c => c.voltage);

  return (
    <Card className={css.card}>
      <CardHeader
        title={
          <>
            <span ref={this.onTop}>Battery: </span>
            <TextField
              required
              error={battery.name.length === 0}
              id='name'
              placeholder='Name'
              className={css.textField}
              value={battery.name}
              name='name'
              onChange={changeBattery}
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

            {battery.id &&
              <Tooltip title='Delete battery'>
                <IconButton onClick={executeDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>}
          </>
        }
      />
      <CardContent hidden={battery.name === ''}>
        <div className={css.container}>
          <FormControl className={css.formControl} margin='normal'>
            <InputLabel htmlFor='select-multiple-checkbox'>Type</InputLabel>
            <Select
              value={battery.type}
              name={'type'}
              onChange={changeBattery}
              onBlur={save}
              input={<Input id='select-multiple-checkbox' />}
            >
              {batteryTypes.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={css.formControl} margin='normal'>
            <InputLabel htmlFor='select-multiple-checkbox'>Cells</InputLabel>
            <Select
              value={battery.cells}
              name={'cells'}
              onChange={changeBattery}
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

          <TextField
            type='number'
            id='capacity'
            label='Capacity'
            placeholder='Capacity'
            className={css.textField}
            value={battery.capacity}
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
            value={formatDate(battery.purchaseDate)}
            onChange={changeDate}
            onBlur={save}
            className={css.textField}
            margin='normal'
          />
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
                {cycles.filter(c => c.state === BatteryState.charged).length}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Average voltage
                </TableCell>
              <TableCell>
                {
                  voltages.length > 0 ? Math.round(voltages.reduce((sum, c) => sum + Number(c.voltage), 0) / voltages.length * 100) / 100 : '-'
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className={batteryCss.graph}>
          <BatteryGraph cycles={cycles}></BatteryGraph>
        </div>
      </CardContent>
    </Card>
  );
};

export const BatteryDetails = withRouter(BatteryDetailsComponent);
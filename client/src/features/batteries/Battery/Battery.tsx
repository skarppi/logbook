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
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import * as React from 'react';
import { Battery } from '../../../../../shared/batteries/types';
import { BatteryGraph } from './BatteryGraph';
import { BatteryCycles } from './BatteryCycles';

import { useHistory } from 'react-router-dom';

import gql from 'graphql-tag';
import { useQuery, useMutation } from 'urql';

const css = require('../../../common/Form.css');
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Loading } from '../../loading/Loading';
import { formatDate } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { BatteryState } from '../../../../../shared/batteries';
import makeStyles from '@material-ui/styles/makeStyles';

const batteryTypes = ['LiPo', 'LiHV'];
const cellCounts = [1, 2, 3, 4, 5, 6];

const Query = gql`
  query($id:Int!) {
    battery(id: $id) {
      id
      name
      purchaseDate
      type
      cells
      capacity
      batteryCycles(orderBy: DATE_DESC) {
        nodes {
          id
          date
          state
          voltage
          discharged
          charged
          resistance
          flight {
            id
            startDate
            planeId
            armedTime
            flightTime
          }
        }
      }
    }
  }`;

interface IQueryResponse {
  battery: Battery;
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
    updateBattery(input: {id: $id, patch: $battery}) {
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
  id: -1,
  name: '',
  purchaseDate: new Date(),
  type: '',
  cells: 0,
  capacity: 0
};

const useStyles = makeStyles({
  graph: {
    height: '400px',
    position: 'relative'
  }
});

export const BatteryDetails = ({ id }) => {

  const history = useHistory();

  // graphql CRUD operations
  const [create, createBattery] = useMutation(Create);
  const [read] = useQuery<IQueryResponse>({ query: Query, variables: { id } });
  const [update, updateBattery] = useMutation(Update);
  const [del, deleteBattery] = useMutation(Delete);

  // local state
  const [battery, setBattery] = React.useState(NEW_BATTERY);
  React.useEffect(() => {
    if (read.data && read.data.battery) {
      setBattery(read.data.battery);
    }
  }, [read]);

  // modify local state
  const changeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBattery({ ...battery, [name]: Number(value) });
  };

  const changeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBattery({ ...battery, [name]: new Date(value) });
  };

  const changeBattery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBattery({ ...battery, [name]: value });
  };

  // update to server
  const save = (_) => {
    if (battery.id === NEW_BATTERY.id) {
      delete battery.id;
      createBattery({ battery }).then(res => {
        if (!res.error) {
          history.push(`/batteries/${res.data.createBattery.battery.id}`);
        }
      });
    } else {
      delete battery['__typename'];
      delete battery.batteryCycles;
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

  const cycles = battery.batteryCycles && battery.batteryCycles.nodes || [];

  const voltages = cycles.filter(c => c.voltage);

  const batteryCss = useStyles();

  return (
    <Card className={css.card}>
      <CardHeader
        title={
          <>
            <span ref={this.onTop}>Battery: </span>
            <TextField
              required
              error={id === NEW_BATTERY.id && battery.name.length === 0}
              id='name'
              placeholder='Name'
              className={css.textField}
              value={battery.name}
              name='name'
              onChange={changeBattery}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => event.target.value.length > 0 && save(event)}
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

      </CardContent>

      <CardContent hidden={battery.name === ''}>
        <Table padding='none'>
          <TableBody>
            <TableRow>
              <TableCell>
                Flights
                </TableCell>
              <TableCell>
                {cycles.filter(c => c.flight).length}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Flight Time
                </TableCell>
              <TableCell>
                {formatDuration(cycles.reduce((sum, c) => sum + (c.flight ? c.flight.flightTime : 0), 0))}
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

        <ExpansionPanel
          key={battery.id}
          defaultExpanded={true}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            Show Entries
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <BatteryCycles battery={battery} cycles={cycles} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </CardContent>
    </Card>
  );
};
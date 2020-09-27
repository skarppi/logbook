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

import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { LoadingIcon } from '../../loading/Loading';
import { formatDate } from '../../../utils/date';
import { formatDuration } from '../../../../../shared/utils/date';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import { BatteryState } from '../../../../../shared/batteries';
import { NavigatePreviousNext } from '../../../common/NavigatePreviousNext';
import Box from '@material-ui/core/Box';

const batteryTypes = ['LiPo', 'LiHV'];
const cellCounts = [1, 2, 3, 4, 5, 6];

const Query = gql`
  query($id:Int!) {
    battery(id: $id) {
      id
      name
      purchaseDate
      retirementDate
      type
      cells
      capacity
      notes
      batteryCycles(orderBy: DATE_DESC) {
        nodes {
          id
          date
          state
          restingVoltage
          startVoltage
          endVoltage
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
        retirementDate
        type
        cells
        capacity
        notes
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
        retirementDate
        type
        cells
        capacity
        notes
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

export const BatteryDetails = ({ id, nextLink, previousLink }) => {

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

  const cycles = battery.batteryCycles && battery.batteryCycles.nodes || [];

  const voltages = cycles.filter(c => c.restingVoltage);

  const totalFlights = cycles.filter(c => c.flight).length;
  const totalFlightTime = cycles.reduce((sum, c) => sum + (c.flight ? c.flight.flightTime : 0), 0);

  return (
    <Card style={{ boxShadow: 'none' }}>
      <CardHeader
        title={
          <>
            <span>Battery: </span>
            <TextField
              required
              error={id === NEW_BATTERY.id && battery.name.length === 0}
              id='name'
              placeholder='Name'
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
            <LoadingIcon
              spinning={read.fetching || update.fetching || create.fetching || del.fetching}
              error={read.error || update.error || create.error || del.error}
            />

            <NavigatePreviousNext nextLink={nextLink} previousLink={previousLink} />

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
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                Flights
                </TableCell>
              <TableCell>
                {totalFlights}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Flight Time
                </TableCell>
              <TableCell>
                {formatDuration(totalFlightTime)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Average Flight Time
                </TableCell>
              <TableCell>
                {
                  totalFlights > 0 ? formatDuration(totalFlightTime / totalFlights) : '-'
                }
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Charge cycles
                </TableCell>
              <TableCell>
                {cycles.filter(c => c.flight || c.state === BatteryState.storage).length}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                Average Resting Voltage
                </TableCell>
              <TableCell>
                {
                  voltages.length > 0 ? Math.round(voltages.reduce((sum, c) => sum + Number(c.restingVoltage), 0) / voltages.length * 100) / 100 : '-'
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box display='flex' flexWrap='wrap' justifyContent='stretch'>

          <FormControl margin='normal'>
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

          <FormControl margin='normal'>
            <InputLabel htmlFor='select-multiple-checkbox'>Cells</InputLabel>
            <Select
              value={battery.cells || ''}
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
            style={{ width: 100 }}
            id='capacity'
            label='Capacity'
            placeholder='Capacity'
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
            inputProps={{
              step: 50,
              min: '0'
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
            margin='normal'
          />

          <TextField
            id='retirementDate'
            name='retirementDate'
            type='date'
            label='Retirement Date'
            value={formatDate(battery.retirementDate) || ''}
            onChange={changeDate}
            onBlur={save}
            margin='normal'
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <TextField
          id='notes'
          label='Notes'
          placeholder='Notes'
          multiline
          value={battery.notes || ''}
          name='notes'
          onChange={changeBattery}
          onBlur={save}
          margin='normal'
          fullWidth={true}
        />

        <Box height='400px' width='92vw' maxWidth='1200px'>
          <BatteryGraph cycles={cycles}></BatteryGraph>
        </Box>

        <ExpansionPanel
          key={battery.id}
          defaultExpanded={false}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            Show Entries
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <BatteryCycles cells={battery.cells} cycles={cycles} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </CardContent>
    </Card>
  );
};
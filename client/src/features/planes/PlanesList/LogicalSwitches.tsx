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

import { PlanesContext } from './Planes';

import * as React from 'react';

import { useContext } from 'react';
import { LogicalSwitch } from '../../../../../shared/planes/types';
import gql from 'graphql-tag';
import { useMutation } from 'urql';

import NewSwitchIcon from '@material-ui/icons/Add';
import EditPlaneIcon from '@material-ui/icons/Edit';
import SavePlaneIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { LogicalFunction } from '../../../../../shared/planes';

const layout = require('../../../common/Layout.css');
const css = require('../../../common/Form.css');

const NEWID = 'add';

const Create = gql`
  mutation($ls:LogicalSwitchInput!) {
    createLogicalSwitch(input: {logicalSwitch: $ls}) {
      logicalSwitch {
        id
      }
    }
  }`;

const Update = gql`
  mutation($id:String!, $patch:LogicalSwitchPatch!) {
    updateLogicalSwitch(input: {id: $id, patch: $patch}) {
      logicalSwitch {
        id
      }
    }
   }`;

const SWITCHES = [
  'Ail',
  'Ele',
  'Thr',
  'Rud',
  'S1',
  'S2',
  'LS',
  'RS',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SF',
  'SG',
  'SH'
]

export const LogicalSwitches = () => {

  const { logicalSwitches } = useContext(PlanesContext);
  if (!logicalSwitches) {
    return <></>;
  }

  const [create, createSwitch] = useMutation(Create);
  const [update, updateSwitch] = useMutation(Update);

  const [editing, setEditing] = React.useState<LogicalSwitch>(null);

  const changeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: (value.length > 0 ? value : null) });
  }

  // update to server
  const save = () => {
    const { ['__typename']: _, nodeId, ...ls } = editing;
    if (!editing.nodeId) {
      createSwitch({ ls })
        .then(() => setEditing(null));
    } else {
      updateSwitch({ id: editing.id, patch: ls })
        .then(() => setEditing(null));
    }
  };

  const editRow = () => {
    return <React.Fragment key={editing.id} >
      <TableRow>
        <TableCell>
          <TextField
            placeholder='id'
            className={css.textField}
            value={editing.id || ''}
            name='id'
            onChange={changeSwitch}
            inputProps={{ maxLength: 3 }}
          />
        </TableCell>
        <TableCell>
          <Select
            displayEmpty
            value={editing.func || ''}
            name={'func'}
            onChange={changeSwitch}
          >
            <MenuItem key={'---'} value={''}>---</MenuItem>
            {Object.keys(LogicalFunction).map(name => (
              <MenuItem key={name} value={LogicalFunction[name]}>
                {LogicalFunction[name]}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <Select
            displayEmpty
            value={editing.v1 || ''}
            name={'v1'}
            onChange={changeSwitch}
          >
            <MenuItem key={'---'} value={''}>---</MenuItem>
            {SWITCHES.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <TextField
            placeholder='v2'
            className={css.textField}
            value={editing.v2 || ''}
            name='v2'
            onChange={changeSwitch}
          />
        </TableCell>
        <TableCell>
          <Select
            displayEmpty
            value={editing.andSwitch || ''}
            name={'andSwitch'}
            onChange={changeSwitch}
          >
            <MenuItem key={'---'} value={null}>---</MenuItem>
            {SWITCHES.map(name => ([
              <MenuItem key={`${name}}u`} value={`${name}↑`}>
                {name}↑
              </MenuItem>,
              <MenuItem key={`${name}m`} value={`${name}-`}>
                {name}-
              </MenuItem>,
              <MenuItem key={`${name}d`} value={`${name}↓`}>
                {name}↓
              </MenuItem>
            ]))}
          </Select>
        </TableCell>
        <TableCell>
          <TextField
            placeholder='duration'
            className={css.textField}
            value={editing.duration || ''}
            name='duration'
            onChange={changeSwitch}
          />
        </TableCell>
        <TableCell>
          <TextField
            placeholder='delay'
            className={css.textField}
            value={editing.delay || ''}
            name='delay'
            onChange={changeSwitch}
            inputProps={{ maxLength: 4 }}
          />
        </TableCell>
        <TableCell>
          <TextField
            placeholder='description'
            className={css.textField}
            value={editing.description || ''}
            name='description'
            onChange={changeSwitch}
          />
        </TableCell>
        <TableCell>
          <Tooltip title='Save changes'>
            <IconButton onClick={save}>
              <SavePlaneIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </React.Fragment >;
  };

  const viewRow = (ls: LogicalSwitch) => {
    return <React.Fragment key={ls.id} >
      <TableRow>
        <TableCell>
          {ls.id}
        </TableCell>
        <TableCell>
          {ls.func}
        </TableCell>
        <TableCell>
          {ls.v1 ? ls.v1 : '---'}
        </TableCell>
        <TableCell>
          {ls.v2 ? ls.v2 : '---'}
        </TableCell>
        <TableCell>
          {ls.andSwitch ? ls.andSwitch : '---'}
        </TableCell>
        <TableCell>
          {ls.duration}
        </TableCell>
        <TableCell>
          {ls.delay ? ls.delay : '---'}
        </TableCell>
        <TableCell>
          {ls.description}
        </TableCell>
        <TableCell>
          <Tooltip title='Edit plane'>
            <IconButton onClick={() => setEditing(ls)}>
              <EditPlaneIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </React.Fragment >;
  };

  const switches = [...logicalSwitches, ...(editing && !logicalSwitches.find(ls => ls.id === editing.id) ? [editing] : [])];

  console.log(switches);

  const rows = switches.map(ls => {
    if (editing && editing.id === ls.id) {
      return editRow();
    } else {
      return viewRow(ls);
    }
  });

  return (
    <>
      <Grid item xs={12} className={layout.grid}>
        <Card>
          <CardHeader title='Logical Switches' />
          <CardContent className={layout.loadingParent}>
            <Table padding='none'>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>V1</TableCell>
                  <TableCell>V2</TableCell>
                  <TableCell>And</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Delay</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell><Tooltip title='Save changes'>
                    <IconButton onClick={() => setEditing(
                      {
                        id: null,
                        func: null,
                        v1: null,
                        v2: null,
                        andSwitch: null,
                        duration: null,
                        delay: null,
                        description: null
                      }
                    )}>
                      <NewSwitchIcon />
                    </IconButton>
                  </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
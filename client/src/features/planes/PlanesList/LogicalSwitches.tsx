import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { PlanesContext } from "./Planes";
import { LoadingIcon } from "../../loading/Loading";

import * as React from "react";

import { useContext } from "react";
import { LogicalSwitch } from "../../../../../shared/planes/types";
import gql from "graphql-tag";
import { useMutation } from "urql";

import NewSwitchIcon from "@mui/icons-material/Add";
import EditPlaneIcon from "@mui/icons-material/Edit";
import SavePlaneIcon from "@mui/icons-material/Save";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LogicalFunction } from "../../../../../shared/planes";
import { ListTemplate } from "../../../common/ListTemplate";

const NEWID = "add";

const Create = gql`
  mutation ($ls: LogicalSwitchInput!) {
    createLogicalSwitch(input: { logicalSwitch: $ls }) {
      logicalSwitch {
        id
      }
    }
  }
`;

const Update = gql`
  mutation ($id: String!, $patch: LogicalSwitchPatch!) {
    updateLogicalSwitch(input: { id: $id, patch: $patch }) {
      logicalSwitch {
        id
      }
    }
  }
`;

const SWITCHES = [
  "Ail",
  "Ele",
  "Thr",
  "Rud",
  "S1",
  "S2",
  "LS",
  "RS",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SF",
  "SG",
  "SH",
];

export const LogicalSwitches = () => {
  const { logicalSwitches } = useContext(PlanesContext);

  const [create, createSwitch] = useMutation(Create);
  const [update, updateSwitch] = useMutation(Update);

  const [editing, setEditing] = React.useState<LogicalSwitch>();

  if (!logicalSwitches) {
    return <></>;
  }

  const changeString = ({
    target: { name, value },
  }:
    | SelectChangeEvent
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    editing &&
    setEditing({
      ...editing,
      [name]: value.length > 0 ? value : undefined,
    });

  // update to server
  const save = () => {
    if (!editing) return;

    const { __typename: _, nodeId, ...ls } = editing;
    if (!editing.nodeId) {
      createSwitch({ ls }).then(() => setEditing(undefined));
    } else {
      updateSwitch({ id: editing.id, patch: ls }).then(() =>
        setEditing(undefined)
      );
    }
  };

  const editRow = () => {
    if (!editing) {
      return <></>;
    }
    return (
      <React.Fragment key={editing.id}>
        <TableRow>
          <TableCell>
            <TextField
              placeholder="id"
              value={editing.id || ""}
              name="id"
              onChange={changeString}
              inputProps={{ maxLength: 3 }}
            />
          </TableCell>
          <TableCell>
            <Select
              displayEmpty
              value={editing.func || ""}
              name={"func"}
              onChange={changeString}
            >
              <MenuItem key={"---"} value={""}>
                ---
              </MenuItem>
              {Object.keys(LogicalFunction).map((name) => (
                <MenuItem key={name} value={name as LogicalFunction}>
                  {name as LogicalFunction}
                </MenuItem>
              ))}
            </Select>
          </TableCell>
          <TableCell>
            <Select
              displayEmpty
              value={editing.v1 || ""}
              name={"v1"}
              onChange={changeString}
            >
              <MenuItem key={"---"} value={""}>
                ---
              </MenuItem>
              {SWITCHES.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </TableCell>
          <TableCell>
            <TextField
              placeholder="v2"
              value={editing.v2 || ""}
              name="v2"
              onChange={changeString}
            />
          </TableCell>
          <TableCell>
            <Select
              displayEmpty
              value={editing.andSwitch || ""}
              name={"andSwitch"}
              onChange={changeString}
            >
              <MenuItem key={"---"} value={undefined}>
                ---
              </MenuItem>
              {SWITCHES.map((name) => [
                <MenuItem key={`${name}}u`} value={`${name}↑`}>
                  {name}↑
                </MenuItem>,
                <MenuItem key={`${name}m`} value={`${name}-`}>
                  {name}-
                </MenuItem>,
                <MenuItem key={`${name}d`} value={`${name}↓`}>
                  {name}↓
                </MenuItem>,
              ])}
            </Select>
          </TableCell>
          <TableCell>
            <TextField
              placeholder="duration"
              value={editing.duration || ""}
              name="duration"
              onChange={changeString}
            />
          </TableCell>
          <TableCell>
            <TextField
              placeholder="delay"
              value={editing.delay || ""}
              name="delay"
              onChange={changeString}
              inputProps={{ maxLength: 4 }}
            />
          </TableCell>
          <TableCell>
            <TextField
              placeholder="description"
              value={editing.description || ""}
              name="description"
              onChange={changeString}
            />
          </TableCell>
          <TableCell>
            <Tooltip title="Save changes">
              <IconButton onClick={save} size="large">
                <SavePlaneIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  const viewRow = (ls: LogicalSwitch) => {
    return (
      <React.Fragment key={ls.id}>
        <TableRow>
          <TableCell>{ls.id}</TableCell>
          <TableCell>{ls.func}</TableCell>
          <TableCell>{ls.v1 ? ls.v1 : "---"}</TableCell>
          <TableCell>{ls.v2 ? ls.v2 : "---"}</TableCell>
          <TableCell>{ls.andSwitch ? ls.andSwitch : "---"}</TableCell>
          <TableCell>{ls.duration}</TableCell>
          <TableCell>{ls.delay ? ls.delay : "---"}</TableCell>
          <TableCell>{ls.description}</TableCell>
          <TableCell>
            <Tooltip title="Edit plane">
              <IconButton onClick={() => setEditing(ls)} size="large">
                <EditPlaneIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  const switches = [
    ...logicalSwitches,
    ...(editing && !logicalSwitches.find((ls) => ls.id === editing.id)
      ? [editing]
      : []),
  ];

  const rows = switches.map((ls) => {
    if (editing && editing.id === ls.id) {
      return editRow();
    } else {
      return viewRow(ls);
    }
  });

  return (
    <ListTemplate
      type="logicalswitch"
      createNewAction={() =>
        setEditing({
          id: "",
          func: LogicalFunction.is,
          v1: "",
          v2: undefined,
          andSwitch: undefined,
          duration: undefined,
          delay: undefined,
          description: undefined,
        })
      }
      title="Logical Switches"
    >
      <Table>
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
            <TableCell>
              <LoadingIcon
                spinning={create.fetching || update.fetching}
                error={create.error || update.error}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </ListTemplate>
  );
};

import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Battery, BatteryCycle } from "../../../../../shared/batteries/types";
import { BatteryCycleResistance } from "./BatteryCycleResistance";

import { NavLink } from "react-router-dom";
import { useMutation } from "urql";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import { formatDate, formatDateTimeLocal } from "../../../utils/date";
import { formatDuration } from "../../../../../shared/utils/date";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Flight } from "../../../../../shared/flights/types";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import { LoadingIcon } from "../../loading/Loading";
import {
  CREATE_BATTERY_CYCLE,
  UPDATE_BATTERY_CYCLE,
  DELETE_BATTERY_CYCLE,
} from "./BatteryCycle";
import { SelectChangeEvent } from "@mui/material";

const SWITCHES = ["DISCHARGED", "CHARGED", "STORAGE"];

interface IBatteryCycleProps {
  cells: number;
  cycle: BatteryCycle;
  batteries?: Battery[];
  removeEntry?: () => void;
}

export const BatteryCycleRow = ({
  cells,
  cycle,
  batteries,
  removeEntry,
}: IBatteryCycleProps) => {
  // graphql CRUD operations
  const [creating, createCycle] = useMutation(CREATE_BATTERY_CYCLE);
  const [updating, updateCycle] = useMutation(UPDATE_BATTERY_CYCLE);
  const [deleting, deleteCycle] = useMutation(DELETE_BATTERY_CYCLE);

  // local state
  const [editing, setEditing] = React.useState<BatteryCycle | undefined>(
    !cycle.id ? cycle : undefined
  );

  const isEditing = editing?.id === cycle.id;

  const changeValue = (event: SelectChangeEvent<string>) => {
    if (!editing) return;
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: value.length > 0 ? value : undefined });
  };

  const changeNumber = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      [name]: value.length > 0 ? Number(value) : undefined,
    });
  };

  const changeDateTimeLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const { name, value } = event.target;
    setEditing({ ...editing, [name]: new Date(`${value}:00`) });
  };

  useHotkeys("esc", () => setEditing(undefined));

  // update to server

  const save = () => {
    if (!editing) return;

    const { __typename: _, flight, ...cycle } = editing;
    if (editing?.id) {
      updateCycle({ id: editing.id, cycle }).then(
        (res) => !res.error && setEditing(undefined)
      );
    } else {
      createCycle({ cycle }).then((res) => !res.error && setEditing(undefined));
    }
  };

  const remove = () => {
    if (!editing) return;

    if (editing.id) {
      deleteCycle({ id: editing.id }).then(() => setEditing(undefined));
    } else {
      // not yet saved
      removeEntry?.();
    }
  };

  const renderFlight = (flight: Flight) => (
    <NavLink to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}>
      {flight.planeId} {formatDuration(flight.flightTime)}
    </NavLink>
  );

  const renderNumber = (
    name: string,
    value: number | undefined,
    unit: string,
    placeholder: string
  ) =>
    isEditing ? (
      <TextField
        id={name}
        value={(editing as any)[name] || ""}
        name={name}
        placeholder={placeholder}
        onChange={changeNumber}
        type="number"
        style={{ width: 75 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
        inputProps={{
          step: unit === "V" ? 0.01 : 1,
          min: "0",
        }}
      />
    ) : (
      (value && `${value}${unit}`) || ""
    );

  const renderDate = (name: string, value: string) =>
    isEditing ? (
      <TextField
        id={name}
        name={name}
        type="datetime-local"
        value={formatDateTimeLocal((editing as any)[name])}
        onChange={changeDateTimeLocal}
        margin="normal"
      />
    ) : (
      formatDate(value)
    );

  const selectBattery = () =>
    isEditing ? (
      <FormControl margin="normal">
        <InputLabel htmlFor="select-multiple-checkbox" shrink>
          Battery
        </InputLabel>
        <Select
          value={editing?.batteryName || ""}
          name="batteryName"
          onChange={changeValue}
          input={<Input id="select-multiple-checkbox" />}
        >
          {batteries?.map((battery) => (
            <MenuItem key={battery.name} value={battery.name}>
              {battery.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ) : (
      cycle.batteryName
    );

  return (
    <TableRow key={cycle.id}>
      <TableCell padding="none">{renderDate("date", cycle.date)}</TableCell>
      <TableCell>
        {(cycle.flight && renderFlight(cycle.flight)) ||
          (batteries && selectBattery())}
      </TableCell>
      <TableCell padding="none">
        {renderNumber("discharged", cycle.discharged, "mAh", "Used")}
      </TableCell>
      <TableCell>
        {renderNumber("restingVoltage", cycle.restingVoltage, "V", "Resting")}
      </TableCell>
      <TableCell padding="none">{cycle.state}</TableCell>
      <TableCell>
        {renderNumber("charged", cycle.charged, "mAh", "Charged")}
      </TableCell>
      <TableCell padding="none">
        <BatteryCycleResistance
          editing={isEditing}
          cells={cells}
          cycle={editing ?? cycle}
          setCycle={setEditing}
        />
      </TableCell>
      <TableCell padding="none">
        {isEditing ? (
          <>
            <LoadingIcon
              spinning={updating.fetching || deleting.fetching}
              error={updating.error || deleting.error}
            />
            <Tooltip title="Save entry">
              <IconButton onClick={save} size="large">
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove entry">
              <IconButton onClick={remove} size="large">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Edit entry">
            <IconButton onClick={() => setEditing(cycle)} size="large">
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

import * as React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import { Plane } from "../../../shared/planes/types";
import { PlaneType } from "../../../shared/planes";
import { Battery } from "../../../shared/batteries/types";
import { useContext } from "react";
import { PlanesContext } from "../PlanesList/Planes";
import Box from "@mui/material/Box";

interface IProps {
  plane: Plane;
  allBatteries: Battery[];
  setPlane: (plane: Plane) => void;
  save: () => void;
}

function RenderLogicalSwitch({
  mode,
  label,
  plane,
  changePlane,
  save,
}: {
  mode:
    | "modeArmed"
    | "modeFlying"
    | "modeStopped"
    | "modeRestart"
    | "modeStoppedStartsNewFlight";
  label: string;
  plane: Plane;
  changePlane: (event: SelectChangeEvent) => void;
  save: React.FocusEventHandler;
}) {
  const { logicalSwitches } = useContext(PlanesContext);

  return (
    <Box flex="1">
      <FormControl margin="normal" fullWidth={true}>
        <InputLabel htmlFor={mode}>{label}</InputLabel>
        <Select
          value={plane[mode]?.toString() || ""}
          name={mode}
          onChange={changePlane}
          onBlur={save}
          input={<Input id={mode} />}
        >
          {logicalSwitches.map((ls) => (
            <MenuItem key={ls.id} value={ls.id}>
              {ls.id}: {ls.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export const PlaneForm = ({ plane, allBatteries, setPlane, save }: IProps) => {
  const changePlane = ({
    target: { name, value },
  }: SelectChangeEvent<string>) => setPlane({ ...plane, [name]: value });

  const changeBoolean = ({ target: { name, value } }: SelectChangeEvent) =>
    setPlane({ ...plane, [name]: value === "true" });

  const changeBatteries = ({
    target: { name, value },
  }: SelectChangeEvent<string[]>) => {
    const array = typeof value === "string" ? [value] : value;
    const nodes = array.map((v) => ({ batteryName: v }));

    setPlane({ ...plane, [name]: { nodes } });
  };

  const enableTelemetries = ({
    target: { name, value },
  }: SelectChangeEvent<string[]>) => {
    const updated = plane.telemetries.map((telemetry) => {
      telemetry.default = value.indexOf(telemetry.id) !== -1;
      return telemetry;
    });
    setPlane({ ...plane, [name]: updated });
  };

  const hideTelemetries = ({
    target: { name, value },
  }: SelectChangeEvent<string[]>) => {
    const updated = plane.telemetries.map((telemetry) => {
      telemetry.ignore = value.indexOf(telemetry.id) !== -1;
      return telemetry;
    });
    setPlane({ ...plane, [name]: updated });
  };

  const batteries =
    (plane.planeBatteries &&
      plane.planeBatteries.nodes.map((b) => b.batteryName)) ||
    [];

  const telemetries = plane.telemetries ?? [];

  const defaultTelemetries = telemetries
    .filter((telemetry) => telemetry.default)
    .map((telemetry) => telemetry.id);

  const hiddenTelemetries = telemetries
    .filter((telemetry) => telemetry.ignore)
    .map((telemetry) => telemetry.id);

  return (
    <>
      <Box display="flex">
        <FormControl margin="normal" style={{ width: 150 }}>
          <InputLabel htmlFor="select-type-checkbox">Type</InputLabel>
          <Select
            value={plane.type}
            name={"type"}
            onChange={changePlane}
            onBlur={save}
            input={<Input id="select-type-checkbox" />}
          >
            {Object.keys(PlaneType)
              .sort()
              .map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl margin="normal" style={{ width: 100 }}>
          <InputLabel htmlFor="select-slots-checkbox">Battery Slots</InputLabel>
          <Select
            value={plane.batterySlots.toString()}
            name={"batterySlots"}
            onChange={changePlane}
            onBlur={save}
            input={<Input id="select-slots-checkbox" />}
          >
            <MenuItem key={0} value={0}>
              0
            </MenuItem>
            <MenuItem key={1} value={1}>
              1
            </MenuItem>
            <MenuItem key={2} value={2}>
              2
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl margin="normal" fullWidth={true}>
          <InputLabel htmlFor="select-batteries-chip">
            Available Batteries
          </InputLabel>
          <Select
            multiple
            value={batteries}
            name={"planeBatteries"}
            onChange={changeBatteries}
            onBlur={save}
            input={<Input id="select-batteries-chip" />}
            renderValue={(selected) => (
              <Box display="flex" flexWrap="wrap">
                {(selected as string[]).map((battery) => (
                  <Chip key={battery} label={battery} />
                ))}
              </Box>
            )}
          >
            {allBatteries.map((battery) => (
              <MenuItem
                key={battery.name}
                value={battery.name}
                selected={batteries.indexOf(battery.name) !== -1}
              >
                {battery.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box display="flex" justifyContent="stretch">
        <FormControl margin="normal" fullWidth={true}>
          <InputLabel htmlFor="select-default-telemetries-chip">
            Default telemetries
          </InputLabel>
          <Select
            multiple
            value={defaultTelemetries}
            name={"telemetries"}
            onChange={enableTelemetries}
            onBlur={save}
            input={<Input id="select-default-telemetries-chip" />}
            renderValue={(selected) => (
              <Box display="flex" flexWrap="wrap">
                {(selected as string[]).map((id) => (
                  <Chip key={id} label={id} />
                ))}
              </Box>
            )}
          >
            {telemetries
              .filter((telemetry) => !telemetry.ignore)
              .map((telemetry) => (
                <MenuItem
                  key={telemetry.id}
                  value={telemetry.id}
                  selected={telemetry.ignore}
                >
                  {telemetry.id}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl margin="normal" fullWidth={true}>
          <InputLabel htmlFor="select-hidden-telemetries-chip">
            Hidden telemetries
          </InputLabel>
          <Select
            multiple
            value={hiddenTelemetries}
            name={"telemetries"}
            onChange={hideTelemetries}
            onBlur={save}
            input={<Input id="select-hidden-telemetries-chip" />}
            renderValue={(selected) => (
              <Box display="flex" flexWrap="wrap">
                {(selected as string[]).map((id) => (
                  <Chip key={id} label={id} />
                ))}
              </Box>
            )}
          >
            {telemetries.map((telemetry) => (
              <MenuItem
                key={telemetry.id}
                value={telemetry.id}
                selected={telemetry.ignore}
              >
                {telemetry.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box display="flex" flexWrap="wrap">
        <RenderLogicalSwitch
          mode="modeArmed"
          label="Arm switch"
          plane={plane}
          changePlane={changePlane}
          save={save}
        />

        <RenderLogicalSwitch
          mode="modeFlying"
          label="Start flying"
          plane={plane}
          changePlane={changePlane}
          save={save}
        />

        <RenderLogicalSwitch
          mode="modeStopped"
          label="Pause flying"
          plane={plane}
          changePlane={changePlane}
          save={save}
        />

        <Box display="flex" flexDirection="column">
          <RenderLogicalSwitch
            mode="modeRestart"
            label="Restart flight"
            plane={plane}
            changePlane={changePlane}
            save={save}
          />
          <FormControl margin="normal" style={{ marginTop: 0 }}>
            <Select
              value={plane.modeStoppedStartsNewFlight.toString()}
              name={"modeStoppedStartsNewFlight"}
              onChange={changeBoolean}
              onBlur={save}
              input={<Input id="stops-checkbox" />}
            >
              <MenuItem value={"true"}>Also when stopped</MenuItem>
              <MenuItem value={"false"}>-</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </>
  );
};

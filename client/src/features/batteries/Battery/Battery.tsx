import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import * as React from "react";
import { Battery } from "../../../../../shared/batteries/types";
import { BatteryGraph } from "./BatteryGraph";
import { BatteryCycles } from "./BatteryCycles";
import { DetailsTemplate } from "../../../common/DetailsTemplate";

import { useNavigate } from "react-router-dom";

import gql from "graphql-tag";
import { useQuery, useMutation } from "urql";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { formatDate } from "../../../utils/date";
import { formatDuration } from "../../../../../shared/utils/date";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import { BatteryState } from "../../../../../shared/batteries";
import Box from "@mui/material/Box";
import {
  SelectChangeEvent,
  SelectInputProps,
} from "@mui/material/Select/SelectInput";

const batteryTypes = ["LiPo", "LiHV"];
const cellCounts = [1, 2, 3, 4, 5, 6];

const Query = gql`
  query ($id: Int!) {
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
  }
`;

interface IQueryResponse {
  battery: Battery;
}

const Create = gql`
  mutation ($battery: BatteryInput!) {
    createBattery(input: { battery: $battery }) {
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
  }
`;

const Update = gql`
  mutation ($id: Int!, $battery: BatteryPatch!) {
    updateBattery(input: { id: $id, patch: $battery }) {
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
  }
`;

const Delete = gql`
  mutation ($batteryId: Int!) {
    deleteBatteryCyclesByBatteryId(input: { batteryId: $batteryId }) {
      battery {
        id
      }
    }
  }
`;

const NEW_BATTERY: Battery = {
  id: -1,
  name: "",
  purchaseDate: new Date(),
  type: "",
  cells: 0,
  capacity: 0,
};

export const BatteryDetails = ({
  id,
  previousLink,
  nextLink,
}: {
  id: number;
  previousLink?: { id?: string | number };
  nextLink?: { id?: string | number };
}) => {
  const navigate = useNavigate();

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

  const changeBattery = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = event.target;
    name && setBattery({ ...battery, [name]: value });
  };

  // update to server
  const save = () => {
    if (battery.id === NEW_BATTERY.id) {
      delete battery.id;
      createBattery({ battery }).then((res) => {
        if (!res.error) {
          navigate(`/batteries/${res.data.createBattery.battery.id}`);
        }
      });
    } else {
      delete battery["__typename"];
      delete battery.batteryCycles;
      updateBattery({ id: battery.id, battery });
    }
  };
  const executeDelete = () => {
    deleteBattery({ batteryId: battery.id }).then((res) => {
      if (!res.error) {
        navigate("/batteries");
      }
    });
  };

  const cycles = (battery.batteryCycles && battery.batteryCycles.nodes) || [];

  const voltages = cycles.filter((c) => c.restingVoltage);

  const totalFlights = cycles.filter((c) => c.flight).length;
  const totalFlightTime = cycles.reduce(
    (sum, c) => sum + (c.flight ? c.flight.flightTime : 0),
    0
  );

  return (
    <DetailsTemplate
      type="battery"
      path="/batteries"
      title={
        <>
          <span>Battery: </span>
          <TextField
            required
            error={id === NEW_BATTERY.id && battery.name.length === 0}
            id="name"
            placeholder="Name"
            value={battery.name}
            name="name"
            onChange={changeBattery}
            onBlur={({ target: { value } }) => value.length > 0 && save()}
            margin="none"
          />
        </>
      }
      previousLink={previousLink}
      nextLink={nextLink}
      queries={[read, update, create, del]}
      deleteAction={() => battery.id !== NEW_BATTERY.id && executeDelete}
      hidden={battery.name === ""}
    >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Flights</TableCell>
            <TableCell>{totalFlights}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Flight Time</TableCell>
            <TableCell>{formatDuration(totalFlightTime)}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Average Flight Time</TableCell>
            <TableCell>
              {totalFlights > 0
                ? formatDuration(totalFlightTime / totalFlights)
                : "-"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Charge cycles</TableCell>
            <TableCell>
              {
                cycles.filter(
                  (c) => c.flight || c.state === BatteryState.storage
                ).length
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Average Resting Voltage</TableCell>
            <TableCell>
              {voltages.length > 0
                ? Math.round(
                    (voltages.reduce(
                      (sum, c) => sum + Number(c.restingVoltage),
                      0
                    ) /
                      voltages.length) *
                      100
                  ) / 100
                : "-"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box display="flex" flexWrap="wrap" justifyContent="stretch">
        <FormControl margin="normal">
          <InputLabel htmlFor="select-multiple-checkbox">Type</InputLabel>
          <Select
            value={battery.type}
            name={"type"}
            onChange={changeBattery}
            onBlur={save}
            input={<Input id="select-multiple-checkbox" />}
          >
            {batteryTypes.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl margin="normal">
          <InputLabel htmlFor="select-multiple-checkbox">Cells</InputLabel>
          <Select
            value={String(battery.cells)}
            name={"cells"}
            onChange={changeBattery}
            onBlur={save}
            input={<Input id="select-multiple-checkbox" />}
          >
            {cellCounts.map((count) => (
              <MenuItem key={count} value={count}>
                {count}s
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="number"
          style={{ width: 100 }}
          id="capacity"
          label="Capacity"
          placeholder="Capacity"
          value={battery.capacity}
          name="capacity"
          onChange={changeNumber}
          onBlur={save}
          margin="normal"
          InputProps={{
            endAdornment: <InputAdornment position="end">mAh</InputAdornment>,
          }}
          inputProps={{
            step: 50,
            min: "0",
          }}
        />

        <TextField
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          label="Purchase Date"
          value={formatDate(battery.purchaseDate)}
          onChange={changeDate}
          onBlur={save}
          margin="normal"
        />

        <TextField
          id="retirementDate"
          name="retirementDate"
          type="date"
          label="Retirement Date"
          value={formatDate(battery.retirementDate) || ""}
          onChange={changeDate}
          onBlur={save}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      <TextField
        id="notes"
        label="Notes"
        placeholder="Notes"
        multiline
        value={battery.notes || ""}
        name="notes"
        onChange={changeBattery}
        onBlur={save}
        margin="normal"
        fullWidth={true}
      />

      <Box height="400px" width="92vw" maxWidth="1200px">
        <BatteryGraph cycles={cycles}></BatteryGraph>
      </Box>

      <Accordion key={battery.id} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Show Entries
        </AccordionSummary>
        <AccordionDetails>
          <BatteryCycles cells={battery.cells} cycles={cycles} />
        </AccordionDetails>
      </Accordion>
    </DetailsTemplate>
  );
};

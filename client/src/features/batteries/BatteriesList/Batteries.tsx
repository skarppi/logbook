import Table from "@mui/material/Table";
import { styled } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";

import * as React from "react";
import { NavLink, useParams } from "react-router-dom";
import { formatDate, formatDateTime } from "../../../utils/date";
import { Battery, BatteryCycle } from "../../../shared/batteries/types";
import { LoadingIcon, LoadingTable } from "../../loading/Loading";
import { BatteryDetails } from "../Battery/Battery";

import ClosedIcon from "@mui/icons-material/KeyboardArrowRight";
import OpenedIcon from "@mui/icons-material/KeyboardArrowDown";

import FullChargeIcon from "@mui/icons-material/BatteryChargingFull";
import StorageChargeIcon from "@mui/icons-material/BatteryCharging50";
import { BatteryState } from "../../../shared/batteries";
import { useScroll } from "../../../common/useScroll";

import gql from "graphql-tag";
import { useQuery, useMutation } from "urql";
import { CREATE_BATTERY_CYCLE } from "../Battery/BatteryCycle";
import { ListTemplate } from "../../../common/ListTemplate";

const PREFIX = "BatteriesList";

const classes = {
  selectedRow: `${PREFIX}-selectedRow`,
};

const StyledListTemplate = styled(ListTemplate)({
  [`& .${classes.selectedRow}`]: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const Query = gql`
  query {
    batteries(orderBy: NAME_ASC) {
      nodes {
        id
        name
        type
        cells
        capacity
        retirementDate
        batteryCycles(first: 1, orderBy: DATE_DESC) {
          nodes {
            id
            date
            state
            flightId
          }
        }
      }
    }
  }
`;

interface IQueryResponse {
  batteries: {
    nodes: Battery[];
  };
}

const NEWID = "add";

export const BatteriesList = () => {
  const { id } = useParams();

  function lastState(battery: Battery) {
    if (battery.retirementDate) {
      return "RETIRED";
    }

    const cycle = battery.batteryCycles?.nodes?.[0];
    if (!cycle) {
      return;
    }
    return cycle.state;
  }

  function lastUsed(res: { nodes: BatteryCycle[] } | undefined) {
    if (!res) return;

    const [cycle] = res.nodes;
    if (!cycle) {
      return;
    }

    const timestamp = formatDateTime(cycle.date);

    if (!cycle.flightId) {
      return timestamp;
    }

    return (
      <NavLink to={`/flights/${formatDate(cycle.date)}/${cycle.flightId}`}>
        {timestamp}
      </NavLink>
    );
  }

  const [charged, chargeBattery] = useMutation(CREATE_BATTERY_CYCLE);

  function batteryOps(battery: Battery) {
    return (
      <>
        <IconButton
          onClick={(_) =>
            chargeBattery({
              cycle: {
                date: new Date(),
                batteryName: battery.name,
                state: BatteryState.storage,
              },
            })
          }
          size="large"
        >
          <StorageChargeIcon />
        </IconButton>
        <IconButton
          onClick={(_) =>
            chargeBattery({
              cycle: {
                date: new Date(),
                batteryName: battery.name,
                state: BatteryState.charged,
              },
            })
          }
          size="large"
        >
          <FullChargeIcon />
        </IconButton>
      </>
    );
  }

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const batteries =
    res.data && res.data.batteries ? res.data.batteries.nodes : [];

  const scrollRef = useScroll<HTMLTableRowElement>([id, res.fetching]);

  const details = (id: number, index: number) => (
    <TableRow ref={scrollRef}>
      <TableCell colSpan={5}>
        <BatteryDetails
          id={id}
          nextLink={batteries?.[index - 1]}
          previousLink={batteries?.[index + 1]}
        />
      </TableCell>
    </TableRow>
  );

  const rows = batteries.map((battery, index) => {
    const isCurrent = id === String(battery.id);
    return (
      <React.Fragment key={String(battery.id)}>
        <TableRow className={isCurrent ? classes.selectedRow : ""}>
          <TableCell>
            {(isCurrent && (
              <NavLink to={"/batteries"}>
                <OpenedIcon />
                {battery.name}
              </NavLink>
            )) || (
              <NavLink to={`/batteries/${battery.id}`}>
                <ClosedIcon />
                {battery.name}
              </NavLink>
            )}
          </TableCell>
          <TableCell>
            {battery.type} {battery.cells}s {battery.capacity}mAh
          </TableCell>
          <TableCell>{lastState(battery)}</TableCell>
          <TableCell>{lastUsed(battery.batteryCycles)}</TableCell>
          <TableCell>{batteryOps(battery)}</TableCell>
        </TableRow>
        {battery.id && id === String(battery.id) && details(battery.id, index)}
      </React.Fragment>
    );
  });

  return (
    <StyledListTemplate type="battery" path="/batteries" title="Batteries">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Current status</TableCell>
            <TableCell>Last used</TableCell>
            <TableCell>
              Actions
              <LoadingIcon spinning={charged.fetching} error={charged.error} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <LoadingTable spinning={res.fetching} error={res.error} colSpan={5} />
          {id === NEWID && details(-1, Number.MIN_SAFE_INTEGER)}
          {rows}
        </TableBody>
      </Table>
    </StyledListTemplate>
  );
};

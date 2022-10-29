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

import { useParams } from "react-router-dom";

import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import { formatDuration } from "../../../../../shared/utils/date";
import { Plane, LogicalSwitch } from "../../../../../shared/planes/types";
import { LoadingTable } from "../../loading/Loading";
import { PlaneDetails } from "../Plane/Plane";
import { LogicalSwitches } from "./LogicalSwitches";

import ClosedIcon from "@mui/icons-material/KeyboardArrowRight";
import OpenedIcon from "@mui/icons-material/KeyboardArrowDown";

import NewPlaneIcon from "@mui/icons-material/Add";

import gql from "graphql-tag";
import { useQuery } from "urql";
import { Flight } from "../../../../../shared/flights/types";
import { formatDateTime, formatDate } from "../../../utils/date";
import { LinkProps } from "@mui/material/Link";
import { useScroll } from "../../../common/useScroll";
import { ListTemplate } from "../../../common/ListTemplate";

const Query = gql`
  query {
    planes(orderBy: ID_ASC) {
      nodes {
        id
        type
        totalByPlane {
          flights
          totalTime
        }
        flights(orderBy: START_DATE_DESC, first: 1) {
          nodes {
            id
            startDate
          }
        }
      }
    }
    logicalSwitches {
      nodes {
        id
        nodeId
        func
        v1
        v2
        andSwitch
        duration
        delay
        description
      }
    }
  }
`;

interface IPlaneResponse extends Plane {
  flights: {
    nodes: Flight[];
  };
}

interface IQueryResponse {
  planes: {
    nodes: IPlaneResponse[];
  };
  logicalSwitches: {
    nodes: LogicalSwitch[];
  };
}

interface IRouteParams {
  id: number;
}

const NEWID = "add";

interface IPlanesContext {
  planes: Plane[];
  logicalSwitches: LogicalSwitch[];
}

export const PlanesContext = React.createContext<IPlanesContext>({
  planes: [],
  logicalSwitches: [],
});

export const PlanesList = () => {
  const { id } = useParams();

  const [res] = useQuery<IQueryResponse>({ query: Query });

  const planes = res.data && res.data.planes ? res.data.planes.nodes : [];
  const logicalSwitches =
    res.data && res.data.logicalSwitches ? res.data.logicalSwitches.nodes : [];

  const scrollRef = useScroll<HTMLTableRowElement>([id, res.fetching]);

  function lastFlown({ flights: { nodes } }: IPlaneResponse) {
    const [flight] = nodes;
    if (!flight) {
      return;
    }

    const timestamp = formatDateTime(flight.startDate);
    return (
      <NavLink to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}>
        {timestamp}
      </NavLink>
    );
  }

  function details(id: string, index: number) {
    return (
      <TableRow ref={scrollRef}>
        <TableCell colSpan={5}>
          <PlaneDetails
            id={id}
            nextLink={planes?.[index - 1]}
            previousLink={planes?.[index + 1]}
          />
        </TableCell>
      </TableRow>
    );
  }

  const rows = planes.map((plane, index) => {
    const current = id === plane.id;
    return (
      <React.Fragment key={plane.id}>
        <TableRow>
          <TableCell>
            {(current && (
              <NavLink to={"/planes"}>
                <OpenedIcon />
                {plane.id}
              </NavLink>
            )) || (
              <NavLink to={`/planes/${plane.id}`}>
                <ClosedIcon />
                {plane.id}
              </NavLink>
            )}
          </TableCell>
          <TableCell>{plane.type}</TableCell>
          <TableCell>
            {plane.totalByPlane && plane.totalByPlane.flights}
          </TableCell>
          <TableCell>
            {plane.totalByPlane && formatDuration(plane.totalByPlane.totalTime)}
          </TableCell>
          <TableCell>{lastFlown(plane)}</TableCell>
        </TableRow>
        {id === plane.id && details(plane.id, index)}
      </React.Fragment>
    );
  });

  return (
    <PlanesContext.Provider value={{ planes, logicalSwitches }}>
      <ListTemplate type="plane" path="/planes" title="Planes">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Flights</TableCell>
              <TableCell>Total Time</TableCell>
              <TableCell>Last flight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <LoadingTable
              spinning={res.fetching}
              error={res.error}
              colSpan={5}
            />
            {id === NEWID && details("", Number.MIN_SAFE_INTEGER)}
            {rows}
          </TableBody>
        </Table>
      </ListTemplate>
      <LogicalSwitches />
    </PlanesContext.Provider>
  );
};

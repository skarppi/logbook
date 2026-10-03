import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { formatDuration } from "../../../shared/utils/date";

import { Flights } from "../Flights/Flights";

import ClosedIcon from "@mui/icons-material/ChevronRight";
import OpenedIcon from "@mui/icons-material/ExpandMore";
import { LoadingTable } from "../../loading/Loading";
import { useQuery } from "urql";
import { ITotalRows } from "../../dashboard/Home/GraphOverTime";
import gql from "graphql-tag";
import { formatDate, formatMonth } from "../../../utils/date";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useScroll } from "../../../common/useScroll";
import { ListTemplate } from "../../../common/ListTemplate";

const PAGE_SIZE = 60; // Load 60 days at a time (roughly 2 months)

const PlanesQuery = gql`
  query {
    planes(orderBy: ID_ASC) {
      nodes {
        id
      }
    }
  }
`;

interface IPlanesResponse {
  planes: {
    nodes: { id: string }[];
  };
}

const Query = gql`
  query (
    $orderBy: [FlightsByDaysOrderBy!]
    $first: Int
    $after: Cursor
    $filter: FlightsByDayFilter
  ) {
    flightsByDays(
      orderBy: $orderBy
      first: $first
      after: $after
      filter: $filter
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        date
        planeId
        flights
        totalTime
        favorites
      }
    }
  }
`;

interface IQueryResponse {
  flightsByDays: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: ITotalRows[];
  };
}

export interface IMonthTotals {
  month: string;
  flights: number;
  totalTime: number;
  favorites: number;
  days: IDayTotals[];
}

export interface IDayTotals {
  day: string;
  planes: string;
  flights: number;
  totalTime: number;
  favorites: number;
}

const groupFlightsPerMonthAndDay = (queryResponse?: IQueryResponse) => {
  const flightsByDays = queryResponse?.flightsByDays.nodes || [];

  return flightsByDays.reduce(
    (acc, obj) => {
      const month = formatMonth(obj.date);
      const day = formatDate(obj.date);

      const days = acc[month] || {};

      days[day] = (days[day] || []).concat(obj);

      acc[month] = days;
      return acc;
    },
    {} as Record<string, Record<string, ITotalRows[]>>,
  );
};

const calculateTotalsPerDay = ([day, flights]: [
  string,
  ITotalRows[],
]): IDayTotals => {
  return {
    day,
    planes: flights.map((flight) => flight.planeId).join(", "),
    flights: flights.reduce((sum, flight) => sum + flight.flights, 0),
    totalTime: flights.reduce((sum, flight) => sum + flight.totalTime, 0),
    favorites: flights.reduce((sum, flight) => sum + flight.favorites, 0),
  };
};

const calculateTotalsPerMonthAndDay = (
  flightsPerMonthAndDay: Record<string, Record<string, ITotalRows[]>>,
): IMonthTotals[] => {
  return Object.entries(flightsPerMonthAndDay).map(([month, flightsPerDay]) => {
    const totalsPerDay = Object.entries(flightsPerDay).map(
      calculateTotalsPerDay,
    );

    return {
      month,
      flights: totalsPerDay.reduce((sum, row) => sum + row.flights, 0),
      totalTime: totalsPerDay.reduce((sum, row) => sum + row.totalTime, 0),
      favorites: totalsPerDay.reduce((sum, row) => sum + row.favorites, 0),
      days: totalsPerDay,
    };
  });
};

export const FlightDays = () => {
  const { date } = useParams();

  const [orderBy, setOrderBy] = React.useState("DATE_DESC");
  const [allNodes, setAllNodes] = React.useState<ITotalRows[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);

  // Filter states
  const [selectedPlane, setSelectedPlane] = React.useState<string>("");
  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  // Fetch planes for dropdown
  const [planesResult] = useQuery<IPlanesResponse>({
    query: PlanesQuery,
  });
  const planes = planesResult.data?.planes.nodes || [];

  // Build filter for server-side query
  const filter = React.useMemo(() => {
    const conditions: Record<string, unknown> = {};

    if (selectedPlane) {
      conditions.planeId = { equalTo: selectedPlane };
    }
    if (fromDate) {
      conditions.date = {
        ...(conditions.date as object),
        greaterThanOrEqualTo: fromDate,
      };
    }
    if (toDate) {
      conditions.date = {
        ...(conditions.date as object),
        lessThanOrEqualTo: toDate,
      };
    }
    if (favoritesOnly) {
      conditions.favorites = { greaterThan: 0 };
    }

    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }, [selectedPlane, fromDate, toDate, favoritesOnly]);

  const [read] = useQuery<IQueryResponse>({
    query: Query,
    variables: {
      orderBy,
      first: PAGE_SIZE,
      after: cursor,
      filter,
    },
    requestPolicy: "cache-and-network",
  });

  // Reset accumulated nodes when order or filter changes
  React.useEffect(() => {
    setAllNodes([]);
    setCursor(null);
  }, [orderBy, selectedPlane, fromDate, toDate, favoritesOnly]);

  // Accumulate nodes from paginated results
  React.useEffect(() => {
    if (read.data?.flightsByDays.nodes) {
      setAllNodes((prev) => {
        // If cursor is null, this is a fresh query - replace all
        if (cursor === null) {
          return read.data!.flightsByDays.nodes;
        }
        // Otherwise append new nodes
        const newNodes = read.data!.flightsByDays.nodes;
        const existingDates = new Set(prev.map((n) => n.date + n.planeId));
        const uniqueNewNodes = newNodes.filter(
          (n) => !existingDates.has(n.date + n.planeId),
        );
        return [...prev, ...uniqueNewNodes];
      });
    }
  }, [read.data, cursor]);

  const hasNextPage = read.data?.flightsByDays.pageInfo.hasNextPage ?? false;
  const endCursor = read.data?.flightsByDays.pageInfo.endCursor ?? null;

  const loadMore = () => {
    if (hasNextPage && endCursor) {
      setCursor(endCursor);
    }
  };

  const groupedFlights = groupFlightsPerMonthAndDay({
    flightsByDays: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: allNodes,
    },
  });
  const totalsPerMonthDays = calculateTotalsPerMonthAndDay(groupedFlights);

  const scrollRef = useScroll<HTMLTableRowElement>([date, read.fetching]);
  const dayRows = (totals: IDayTotals) => {
    const isCurrent = date === totals.day;

    return (
      <React.Fragment key={totals.day + "-day"}>
        <TableRow
          ref={isCurrent ? scrollRef : null}
          selected={isCurrent}
          hover={true}
          id={totals.day}
          sx={{
            ...(isCurrent && {
              "> *": {
                borderBottom: "unset",
              },
            }),
          }}
        >
          <TableCell>
            {(isCurrent && (
              <NavLink to={"/flights"}>
                <OpenedIcon />
                {totals.day}
              </NavLink>
            )) || (
              <NavLink to={`/flights/${totals.day}`}>
                <ClosedIcon />
                {totals.day}
              </NavLink>
            )}
          </TableCell>
          <TableCell>{totals.flights}</TableCell>
          <TableCell>{totals.favorites > 0 ? totals.favorites : ""}</TableCell>
          <TableCell>{totals.planes}</TableCell>
          <TableCell>{formatDuration(totals.totalTime)}</TableCell>
        </TableRow>
        {isCurrent && <Flights />}
      </React.Fragment>
    );
  };

  const getSorting = () => {
    const UP = orderBy.endsWith("_ASC") ? -1 : 1;
    const DOWN = orderBy.endsWith("_DESC") ? -1 : 1;

    if (orderBy.startsWith("FLIGHTS_")) {
      return (a: IMonthTotals, b: IMonthTotals) =>
        a.flights > b.flights ? DOWN : UP;
    } else if (orderBy.startsWith("TOTAL_TIME_")) {
      return (a: IMonthTotals, b: IMonthTotals) =>
        a.totalTime > b.totalTime ? DOWN : UP;
    } else {
      return () => 0;
    }
  };

  const monthRows = totalsPerMonthDays.sort(getSorting()).map((monthTotals) => {
    return (
      <React.Fragment key={monthTotals.month + "-month"}>
        <TableRow>
          <TableCell style={{ fontWeight: "bold", height: 50 }}>
            {monthTotals.month}
          </TableCell>
          <TableCell style={{ fontWeight: "bold" }} colSpan={3}>
            {monthTotals.flights}
          </TableCell>
          <TableCell style={{ fontWeight: "bold" }}>
            {formatDuration(monthTotals.totalTime)}
          </TableCell>
        </TableRow>
        {monthTotals.days.map(dayRows)}
      </React.Fragment>
    );
  });

  const sortLabel = (col: string, title: string) => (
    <TableSortLabel
      active={orderBy.startsWith(col)}
      direction={orderBy === `${col}_ASC` ? "asc" : "desc"}
      onClick={() =>
        setOrderBy(orderBy === `${col}_DESC` ? `${col}_ASC` : `${col}_DESC`)
      }
    >
      {title}
    </TableSortLabel>
  );

  return (
    <ListTemplate
      title="Flights List"
      extraActions={
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            select
            label="Plane"
            size="small"
            value={selectedPlane}
            onChange={(e) => setSelectedPlane(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All planes</MenuItem>
            {planes.map((plane) => (
              <MenuItem key={plane.id} value={plane.id}>
                {plane.id}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="From"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                size="small"
              />
            }
            label="Favorites"
          />
        </Box>
      }
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{sortLabel("DATE", "Date")}</TableCell>
            <TableCell style={{ maxWidth: "1em" }}>
              {sortLabel("FLIGHTS", "Flights")}
            </TableCell>
            <TableCell style={{ maxWidth: "1em" }}>Favorite</TableCell>
            <TableCell style={{ maxWidth: "2em" }}>Plane</TableCell>
            <TableCell style={{ maxWidth: "2em" }}>
              {sortLabel("TOTAL_TIME", "Flight Time")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <LoadingTable
            spinning={read.fetching && allNodes.length === 0}
            error={read.error}
            colSpan={5}
          />
          {monthRows}
          {(hasNextPage || read.fetching) && (
            <TableRow>
              <TableCell colSpan={5}>
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMore}
                    disabled={read.fetching}
                  >
                    {read.fetching ? "Loading..." : "Load More"}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ListTemplate>
  );
};

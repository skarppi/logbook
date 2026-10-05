import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDuration } from "../../../shared/utils/date";
import { FlightDetails } from "../Flight/Flight";

import ClosedFlightIcon from "@mui/icons-material/ArrowRight";
import OpenedFlightIcon from "@mui/icons-material/ArrowDropDown";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import { LoadingTable } from "../../loading/Loading";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { formatDate, formatTime } from "../../../utils/date";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useScroll } from "../../../common/useScroll";
import { ListTemplate } from "../../../common/ListTemplate";
import { Flight } from "../../../shared/flights/types";

const PAGE_SIZE = 100; // Load 100 flights at a time

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

// Fetch flights directly; daily/monthly grouping is done on the frontend.
const Query = gql`
  query ($orderBy: [FlightsOrderBy!], $first: Int, $after: Cursor, $filter: FlightFilter) {
    flights(orderBy: $orderBy, first: $first, after: $after, filter: $filter) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        planeId
        session
        startDate
        endDate
        duration
        armedTime
        flightTime
        location {
          id
          name
        }
        favorite
        stats
        batteryCycles {
          nodes {
            batteryName
          }
        }
      }
    }
  }
`;

interface IQueryResponse {
  flights: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: Flight[];
  };
}

interface IDayGroup {
  day: string;
  flights: Flight[];
  planes: string;
  flightCount: number;
  totalTime: number;
  favorites: number;
}

// Group items by a key while preserving the order in which keys first appear.
const groupBy = <T,>(items: T[], key: (item: T) => string): [string, T[]][] =>
  Array.from(
    items
      .reduce((groups, item) => {
        const k = key(item);
        return groups.set(k, [...(groups.get(k) ?? []), item]);
      }, new Map<string, T[]>())
      .entries(),
  );

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

const toDayGroup = ([day, flights]: [string, Flight[]]): IDayGroup => ({
  day,
  flights,
  planes: Array.from(new Set(flights.map((f) => f.planeId))).join(", "),
  flightCount: flights.length,
  totalTime: sum(flights.map((f) => f.flightTime ?? 0)),
  favorites: flights.filter((f) => f.favorite === 1).length,
});

// Group a flat flight list into days, preserving the input order (the server
// returns flights already ordered by date).
const groupByDay = (flights: Flight[]): IDayGroup[] =>
  groupBy(flights, (f) => formatDate(f.startDate)).map(toDayGroup);


const renderStats = (flight: Flight) => {
  const stats = flight.stats;
  if (stats) {
    if (stats.launchHeight && stats.launchHeight !== stats.maxHeight) {
      return `${stats.launchHeight} -> ${stats.maxHeight}m`;
    } else if (stats.launchHeight) {
      return `${stats.launchHeight}m`;
    }
  }
  return "";
};

export const FlightDays = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = React.useState("DATE_DESC");
  const [allFlights, setAllFlights] = React.useState<Flight[]>([]);
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

  // Server-side filter on the flights connection.
  const filter = React.useMemo(() => {
    const conditions: Record<string, unknown> = {};

    if (selectedPlane) {
      conditions.planeId = { equalTo: selectedPlane };
    }
    if (fromDate) {
      conditions.startDate = {
        ...(conditions.startDate as object),
        greaterThanOrEqualTo: fromDate,
      };
    }
    if (toDate) {
      // Include the whole "to" day by comparing against the next day.
      conditions.startDate = {
        ...(conditions.startDate as object),
        lessThan: formatDate(
          new Date(new Date(toDate).getTime() + 24 * 60 * 60 * 1000),
        ),
      };
    }
    if (favoritesOnly) {
      conditions.favorite = { greaterThan: 0 };
    }

    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }, [selectedPlane, fromDate, toDate, favoritesOnly]);

  // The DATE column controls server ordering (so pagination groups
  // contiguously by day). FLIGHTS / TOTAL_TIME re-sort months on the client.
  const serverOrderBy = orderBy.endsWith("_ASC")
    ? "START_DATE_ASC"
    : "START_DATE_DESC";

  const [read] = useQuery<IQueryResponse>({
    query: Query,
    variables: {
      orderBy: serverOrderBy,
      first: PAGE_SIZE,
      after: cursor,
      filter,
    },
    requestPolicy: "cache-and-network",
  });

  // Reset accumulated flights when order or filter changes.
  React.useEffect(() => {
    setAllFlights([]);
    setCursor(null);
  }, [serverOrderBy, selectedPlane, fromDate, toDate, favoritesOnly]);

  // Accumulate flights from paginated results.
  React.useEffect(() => {
    if (read.data?.flights.nodes) {
      setAllFlights((prev) => {
        if (cursor === null) {
          return read.data!.flights.nodes;
        }
        const newNodes = read.data!.flights.nodes;
        const existingIds = new Set(prev.map((f) => f.id));
        const uniqueNew = newNodes.filter((f) => !existingIds.has(f.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [read.data, cursor]);

  const hasNextPage = read.data?.flights.pageInfo.hasNextPage ?? false;
  const endCursor = read.data?.flights.pageInfo.endCursor ?? null;

  const loadMore = () => {
    if (hasNextPage && endCursor) {
      setCursor(endCursor);
    }
  };

  const days = React.useMemo(() => groupByDay(allFlights), [allFlights]);

  const flightScrollRef = useScroll<HTMLTableRowElement>([id, read.fetching]);

  // Flat layout: every flight is a row and opens its detail directly. The day
  // is a non-interactive subheader carrying its totals.
  const flightRow = (flight: Flight, day: string) => {
    const path = `/flights/${day}`;
    const isCurrent = id === flight.id;
    const batteries = flight.batteryCycles?.nodes
      .map((b) => b.batteryName)
      .join(",");

    return (
      <React.Fragment key={flight.id}>
        <TableRow
          ref={isCurrent ? flightScrollRef : null}
          selected={isCurrent}
          hover={true}
          onClick={() => navigate(isCurrent ? "/flights" : `${path}/${flight.id}`)}
          sx={{
            cursor: "pointer",
            ...(isCurrent && {
              "> *": {
                borderBottom: "unset",
              },
            }),
          }}
        >
          <TableCell sx={{ pl: 4 }}>
            {(isCurrent && <OpenedFlightIcon />) || <ClosedFlightIcon />}
            {formatTime(flight.startDate)}{" "}
            {flight.location && `(${flight.location.name})`}
          </TableCell>
          <TableCell>
            {flight.favorite === 1 ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              renderStats(flight)
            )}
          </TableCell>
          <TableCell>
            {flight.planeId} {batteries && `(${batteries})`}
          </TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
        </TableRow>
        {isCurrent && (
          <TableRow>
            <TableCell colSpan={4} sx={{ padding: 0 }}>
              <FlightDetails entry={flight} path={path} />
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  const dayGroup = (day: IDayGroup) => (
    <React.Fragment key={day.day + "-day"}>
      <TableRow
        id={day.day}
        sx={{ backgroundColor: "grey.50" }}
      >
        <TableCell sx={{ color: "text.secondary" }}>
          <Box
            sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
          >
            <Typography
              component="span"
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "text.primary", lineHeight: 1 }}
            >
              {formatDate(day.day, "d")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                component="span"
                sx={{ fontSize: "0.95rem", fontWeight: 600, color: "text.primary", lineHeight: 1.1 }}
              >
                {formatDate(day.day, "MMMM yyyy")}
              </Typography>
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.1 }}
              >
                {formatDate(day.day, "EEEE")}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={{ color: "text.secondary" }}>
          {day.flightCount}
        </TableCell>
        <TableCell sx={{ color: "text.secondary" }}>{day.planes}</TableCell>
        <TableCell sx={{ color: "text.secondary" }}>
          {formatDuration(day.totalTime)}
        </TableCell>
      </TableRow>
      {day.flights.map((flight) => flightRow(flight, day.day))}
    </React.Fragment>
  );


  const getSorting = () => {
    const UP = orderBy.endsWith("_ASC") ? -1 : 1;
    const DOWN = orderBy.endsWith("_DESC") ? -1 : 1;

    if (orderBy.startsWith("FLIGHTS_")) {
      return (a: IDayGroup, b: IDayGroup) =>
        a.flightCount > b.flightCount ? DOWN : UP;
    } else if (orderBy.startsWith("TOTAL_TIME_")) {
      return (a: IDayGroup, b: IDayGroup) =>
        a.totalTime > b.totalTime ? DOWN : UP;
    } else {
      return () => 0;
    }
  };

  const dayRows = [...days].sort(getSorting()).map(dayGroup);

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
            <TableCell style={{ maxWidth: "2em" }}>Plane</TableCell>
            <TableCell style={{ maxWidth: "2em" }}>
              {sortLabel("TOTAL_TIME", "Flight Time")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <LoadingTable
            spinning={read.fetching && allFlights.length === 0}
            error={read.error}
            colSpan={4}
          />
          {dayRows}
          {(hasNextPage || read.fetching) && (
            <TableRow>
              <TableCell colSpan={4}>
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

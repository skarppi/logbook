import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";
import { Flight, Segment } from "../../../shared/flights/types";
import { useNavigate } from "react-router-dom";

import { FlightDate } from "./FlightDate";
import { FlightDuration } from "./FlightDuration";
import { FlightBatteries } from "./FlightBatteries";
import { FlightLocation } from "./FlightLocation";
import { FlightStatistics } from "./FlightStats";

import { Videos } from "../Videos/Videos";
import { FlightGraph } from "./FlightGraph";

import { differenceInHours } from "date-fns";

import DeleteIcon from "@mui/icons-material/Delete";
import HamburgerIcon from "@mui/icons-material/MoreVert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import UnFavoriteIcon from "@mui/icons-material/FavoriteBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Battery } from "../../../shared/batteries/types";
import { formatDate } from "../../../utils/date";
import { getApi, putApi } from "../../../utils/api-facade";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { FlightTimezone } from "./FlightTimezone";
import { FlightTrack } from "./FlightTrack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import { DetailsTemplate } from "../../../common/DetailsTemplate";

const Query = gql`
  query ($id: String!) {
    flight(id: $id) {
      id
      session
      startDate
      endDate
      duration
      armedTime
      flightTime
      notes
      stats
      location {
        id
        name
        latitude
        longitude
      }
      favorite
      batteryCycles {
        nodes {
          id
          date
          batteryName
          flightId
          state
          restingVoltage
          startVoltage
          endVoltage
          discharged
          charged
          resistance
        }
      }
      plane {
        id
        type
        telemetries
        batterySlots
        planeBatteries {
          nodes {
            batteryName
          }
        }
      }
    }
    batteries(orderBy: NAME_ASC) {
      nodes {
        id
        name
        cells
      }
    }
  }
`;

// Fetch the chronologically adjacent flights (1 newer, 1 older) to enable
// cross-day prev/next navigation from within a flight's detail view.
const NeighborQuery = gql`
  query ($startDate: Datetime!) {
    next: flights(
      filter: { startDate: { greaterThan: $startDate } }
      orderBy: START_DATE_ASC
      first: 1
    ) {
      nodes {
        id
        startDate
      }
    }
    previous: flights(
      filter: { startDate: { lessThan: $startDate } }
      orderBy: START_DATE_DESC
      first: 1
    ) {
      nodes {
        id
        startDate
      }
    }
  }
`;

interface INeighborResponse {
  next: { nodes: { id: string; startDate: string }[] };
  previous: { nodes: { id: string; startDate: string }[] };
}

const Update = gql`
  mutation ($id: String!, $patch: FlightPatch!) {
    updateFlight(input: { id: $id, patch: $patch }) {
      flight {
        id
        session
        startDate
        endDate
        duration
        armedTime
        flightTime
        notes
      }
    }
  }
`;

const Delete = gql`
  mutation ($id: String!) {
    deleteFlight(input: { id: $id }) {
      flight {
        id
      }
    }
  }
`;

interface IQueryResponse {
  flight: Flight;
  batteries: {
    nodes: Battery[];
  };
}

export const FlightDetails = ({
  entry,
  path,
}: {
  entry: Flight;
  path: string;
}) => {
  const navigate = useNavigate();

  const [timezoneOffset, setTimezoneOffset] = React.useState(
    -new Date().getTimezoneOffset() / 60,
  );
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();
  const [telemetryExpanded, setTelemetryExpanded] = React.useState(false);

  const [read, refreshFlight] = useQuery<IQueryResponse>({
    query: Query,
    variables: { id: entry.id },
  });
  const [update, updateFlight] = useMutation(Update);
  const [del, deleteFlight] = useMutation(Delete);

  // Fetch chronologically adjacent flights so prev/next works across days.
  const [neighbors] = useQuery<INeighborResponse>({
    query: NeighborQuery,
    variables: { startDate: entry.startDate },
  });

  const nextFlight = neighbors.data?.next.nodes[0];
  const previousFlight = neighbors.data?.previous.nodes[0];

  // Build full URLs (/flights/<date>/<id>) so navigation can cross day
  // boundaries, since each flight lives under its own date path.
  const nextLink = nextFlight
    ? `/flights/${formatDate(nextFlight.startDate)}/${nextFlight.id}`
    : undefined;
  const previousLink = previousFlight
    ? `/flights/${formatDate(previousFlight.startDate)}/${previousFlight.id}`
    : undefined;

  // Lazy load segments via REST (server filters out ignored telemetries)
  const [segments, setSegments] = React.useState<Segment[] | null>(null);
  const [segmentsLoading, setSegmentsLoading] = React.useState(false);

  React.useEffect(() => {
    if (telemetryExpanded && !segments && !segmentsLoading) {
      setSegmentsLoading(true);
      getApi<Segment[]>(`flights/${entry.id}/segments`)
        .then(setSegments)
        .finally(() => setSegmentsLoading(false));
    }
  }, [telemetryExpanded, entry.id, segments, segmentsLoading]);

  // local state
  const [flight, setFlight] = React.useState<Flight>(entry);
  React.useEffect(() => {
    if (read.data) {
      setFlight(read.data.flight);
    }
  }, [read.data]);

  // Update timezone offset when segments load
  React.useEffect(() => {
    if (segments?.[0]?.rows[0]) {
      const firstRow = segments[0].rows[0];
      const originalStartDate = new Date(`${firstRow.Date} ${firstRow.Time}`);
      const currentStartDate = new Date(flight.startDate);

      const offset = -(
        originalStartDate.getTimezoneOffset() / 60 +
        differenceInHours(currentStartDate, originalStartDate)
      );

      setTimezoneOffset(offset);
    }
  }, [segments, flight.startDate]);

  const flightGraph = React.useMemo(
    () =>
      flight.plane &&
      segments && (
        <FlightGraph
          plane={flight.plane}
          segments={segments}
          stats={flight.stats}
        />
      ),
    [flight.plane, segments, flight.stats],
  );

  const flightDate = formatDate(flight.startDate);

  const changeFavorite = () =>
    updateFlight({
      id: flight.id,
      patch: { favorite: flight.favorite ? 0 : 1 },
    });

  const changeNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFlight({
      ...flight,
      notes: { ...flight.notes, [name]: value },
    });
  };

  const saveNotes = () =>
    updateFlight({
      id: flight.id,
      patch: { notes: flight.notes },
    });

  const executeReset = () => {
    setAnchorEl(undefined);
    putApi(`flights/${flightDate}/${flight.id}/reset`, null, {
      TIMEZONE_OFFSET: timezoneOffset,
    }).then((res) => refreshFlight({ requestPolicy: "network-only" }));
  };

  const executeDelete = () => {
    setAnchorEl(undefined);
    deleteFlight({ id: flight.id }).then((res) => {
      if (!res.error) {
        navigate(`/flights/${flightDate}`);
      }
    });
  };

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(undefined);
  }

  return (
    <DetailsTemplate
      type="flight"
      path={path}
      title={`Flight: ${flight.id}`}
      previousLink={previousLink}
      nextLink={nextLink}
      queries={[read, update, del]}
      action={
        <IconButton onClick={changeFavorite} size="large">
          {flight.favorite ? <FavoriteIcon /> : <UnFavoriteIcon />}
        </IconButton>
      }
      menu={
        <>
          <IconButton
            aria-label="More"
            aria-controls="hamburger"
            aria-haspopup="true"
            onClick={handleClick}
            size="large"
          >
            <HamburgerIcon />
          </IconButton>
          <Menu
            id="hamburger"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem key="Reset">
              <FlightTimezone
                offset={timezoneOffset}
                onChange={setTimezoneOffset}
              />
              <ListItemText primary="Change timezone" onClick={executeReset} />
            </MenuItem>

            <MenuItem key="Delete" onClick={executeDelete}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete Flight" />
            </MenuItem>
          </Menu>
        </>
      }
      hidden={false}
    >
      <Box
        sx={{ display: "flex", flexWrap: "wrap", justifyContent: "stretch" }}
      >
        <FlightDate flight={flight} />
        <FlightDuration flight={flight} save={updateFlight} />
      </Box>

      <FlightLocation flight={flight} save={updateFlight} />

      <>{flight.stats && <FlightStatistics stats={flight.stats} />}</>

      <FlightBatteries
        flight={flight}
        batteries={read.data?.batteries.nodes || []}
        refreshFlight={() => refreshFlight({ requestPolicy: "network-only" })}
      />

      <TextField
        id="jornal"
        label="Journal"
        placeholder="Journal"
        multiline
        value={flight.notes?.journal || ""}
        name="journal"
        onChange={changeNotes}
        onBlur={saveNotes}
        margin="normal"
        fullWidth={true}
      />

      <Accordion
        expanded={telemetryExpanded}
        onChange={(_, expanded) => setTelemetryExpanded(expanded)}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Telemetry
        </AccordionSummary>
        <AccordionDetails>
          {segmentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 500, width: "100%", maxWidth: 1050 }}>
              {flightGraph}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        defaultExpanded={false}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Map</AccordionSummary>
        <AccordionDetails>
          {!telemetryExpanded ? (
            <Box sx={{ color: "text.secondary" }}>
              Expand Telemetry first to load GPS data
            </Box>
          ) : segmentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            flight.location &&
            segments && (
              <FlightTrack location={flight.location} segments={segments} />
            )
          )}
        </AccordionDetails>
      </Accordion>

      <Videos
        date={flight.startDate}
        plane={flight.planeId}
        session={
          flight.id.match(/\d{6}/)?.[0] ??
          (flight.id.includes("Session")
            ? `Session${flight.session}`
            : flight.id.substr(-6, 6))
        }
      />
    </DetailsTemplate>
  );
};

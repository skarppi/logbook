import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import * as React from "react";
import { NavLink, useParams } from "react-router-dom";
import { formatDuration } from "../../../../../shared/utils/date";
import { FlightDetails } from "../Flight/Flight";

import ClosedIcon from "@mui/icons-material/ArrowRight";
import OpenedIcon from "@mui/icons-material/ArrowDropDown";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";

import { LoadingTable } from "../../loading/Loading";
import gql from "graphql-tag";
import { Flight } from "../../../../../shared/flights/types";
import { useQuery } from "urql";
import { addDays } from "date-fns";
import {
  formatTime,
  formatDate,
  formatDateTimeLong,
} from "../../../utils/date";
import { useScroll } from "../../../common/useScroll";
import Typography from "@mui/material/Typography";

const PREFIX = "Flights";

const classes = {
  openedCell: `${PREFIX}-openedCell`,
  root: `${PREFIX}-root`,
  cardHeader: `${PREFIX}-cardHeader`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
  [`& .${classes.openedCell}`]: {
    padding: 0,
  },

  [`& .${classes.root}`]: {
    "& > *": {
      borderBottom: "unset",
    },
  },

  [`& .${classes.cardHeader}`]: {
    padding: theme.spacing(2),
  },
}));

const Query = gql`
  query ($from: Datetime!, $to: Datetime!) {
    flights(
      orderBy: START_DATE_DESC
      filter: { startDate: { greaterThanOrEqualTo: $from, lessThan: $to } }
    ) {
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
    nodes: Flight[];
  };
}

const renderStats = (flight: Flight) => {
  const stats = flight.stats;

  if (stats) {
    if (stats.launchHeight && stats.launchHeight !== stats.maxHeight) {
      return `${flight.session}: ${stats?.launchHeight} -> ${stats.maxHeight}m`;
    } else if (stats.maxHeight) {
      return `${flight.session}: ${stats?.maxHeight}m`;
    } else if (stats.launchHeight) {
      return `${flight.session}: ${stats?.launchHeight}m`;
    }
  }
  return flight.session;
};

export const Flights = () => {
  const { date, id } = useParams();

  const [read] = useQuery<IQueryResponse>({
    query: Query,
    variables: {
      from: date,
      to: date && formatDate(addDays(new Date(date), 1)),
    },
  });

  const path = `/flights/${date}`;

  const flights = (read.data && read.data.flights.nodes) || [];

  const scrollRef = useScroll<HTMLTableRowElement>([id, read.fetching]);

  const rows = flights.map((flight, index) => {
    const isCurrent = id === flight.id;

    const batteries = flight.batteryCycles?.nodes
      .map((b) => b.batteryName)
      .join(",");

    return (
      <React.Fragment key={flight.id}>
        <TableRow
          selected={false}
          hover={true}
          className={isCurrent ? classes.root : ""}
        >
          <TableCell>
            <NavLink to={isCurrent ? path : `${path}/${flight.id}`}>
              {(isCurrent && <OpenedIcon />) || <ClosedIcon />}
              {formatTime(flight.startDate)}{" "}
              {flight.location && `(${flight.location.name})`}
            </NavLink>
          </TableCell>
          <TableCell>{renderStats(flight)}</TableCell>
          <TableCell>{flight.favorite === 1 && <FavoriteIcon />}</TableCell>
          <TableCell>
            {flight.planeId} {batteries && `(${batteries})`}
          </TableCell>
          <TableCell>{formatDuration(flight.flightTime)}</TableCell>
        </TableRow>
        {isCurrent && (
          <TableRow ref={scrollRef}>
            <TableCell colSpan={5} className={classes.openedCell}>
              <FlightDetails
                entry={flight}
                path={path}
                nextLink={flights?.[index - 1]}
                previousLink={flights?.[index + 1]}
              />
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  });

  return (
    <Root>
      <LoadingTable spinning={read.fetching} error={read.error} colSpan={5} />
      <TableRow>
        <TableCell colSpan={5}>
          <Typography
            variant="h5"
            component="div"
            className={classes.cardHeader}
          >
            Flights on {formatDateTimeLong(date)}
          </Typography>
        </TableCell>
      </TableRow>
      {rows}
    </Root>
  );
};

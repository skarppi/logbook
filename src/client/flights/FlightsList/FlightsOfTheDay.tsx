import { Table, TableRow, TableCell, TableBody } from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import {
  formatDuration,
  formatTime,
  formatDate
} from "../../../shared/utils/date";
import { Flight } from "../Flight/Flight";

export const FlightsOfTheDay = (date: string, flights: any[]) => (
  <Table>
    <TableBody>
      {flights.map((flight, index) => (
        <>
          <TableRow key={flight.id}>
            <TableCell>
              <NavLink
                to={`/flights/${formatDate(flight.startDate)}/${flight.id}`}
              >
                {formatTime(flight.startDate)}
              </NavLink>
            </TableCell>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{flight.plane}</TableCell>
            <TableCell>{formatDuration(flight.flightTime)}</TableCell>
            <TableCell>{flight.status}</TableCell>
          </TableRow>
          <Route
            exact
            key={flight.id + "-details"}
            path={"/flights/" + date + "/" + flight.id}
            render={props => (
              <TableRow>
                <Flight flight={flights.find(u => u.id === flight.id)} />
              </TableRow>
            )}
          />
        </>
      ))}
    </TableBody>
  </Table>
);

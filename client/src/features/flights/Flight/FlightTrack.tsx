import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";

import { Flight } from "../../../shared/flights/types";
import { renderToStaticMarkup } from "react-dom/server";
import { divIcon, LatLngExpression, LatLngTuple } from "leaflet";

import LocationIcon from "@mui/icons-material/LocationOn";
import React from "react";

interface IFlightLocationProps {
  flight: Flight;
}

export const FlightTrack = ({ flight }: IFlightLocationProps) => {
  if (!flight.location?.latitude) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
  });

  const track = flight.segments.flatMap((segment) =>
    segment.rows.map((row) => {
      const [lat, lon] = row.str("GPS")?.split(" ");

      return [parseFloat(lat), parseFloat(lon)] as LatLngTuple;
    })
  );

  const location =
    flight.location &&
    ([flight.location.latitude, flight.location.longitude] as LatLngExpression);

  return (
    <MapContainer center={location} zoom={14}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker key={"location"} icon={customMarkerIcon} position={location}>
        <Popup>
          <span>{flight.location.name}</span>
        </Popup>
      </Marker>

      <Polyline positions={track}></Polyline>
    </MapContainer>
  );
};

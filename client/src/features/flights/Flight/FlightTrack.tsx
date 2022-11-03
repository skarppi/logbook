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
  if (!flight.location?.latitude || !flight.location?.longitude) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
  });

  const track = flight.segments
    .flatMap((segment) =>
      segment.rows.map((row) => !!row?.["GPS"] && row["GPS"].split(" "))
    )
    .filter((point) => !!point);

  const location = [
    flight.location.latitude,
    flight.location.longitude,
  ] as LatLngTuple;

  return (
    <MapContainer center={location} zoom={14}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {location && (
        <Marker key={"location"} icon={customMarkerIcon} position={location}>
          <Popup>
            <span>{flight.location.name}</span>
          </Popup>
        </Marker>
      )}

      <Polyline positions={track}></Polyline>
    </MapContainer>
  );
};

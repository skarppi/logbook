import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import * as React from "react";
import { Location } from "../../../../../shared/locations/types";
import { renderToStaticMarkup } from "react-dom/server";
import { divIcon, LatLngTuple } from "leaflet";

import LocationIcon from "@mui/icons-material/LocationOn";

interface IFlightLocationProps {
  locations: Location[];
}

export const LocationMap = ({ locations }: IFlightLocationProps) => {
  const filtered = locations.filter((l) => l.latitude && l.longitude);

  if (filtered.length === 0) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
    iconAnchor: [12, 24],
    iconSize: [24, 24],
  });

  const minLat = filtered.reduce((prev, l) => Math.min(prev, l.latitude!!), 90);
  const maxLat = filtered.reduce(
    (prev, l) => Math.max(prev, l.latitude!!),
    -90
  );
  const minLon = filtered.reduce(
    (prev, l) => Math.min(prev, l.longitude!!),
    180
  );
  const maxLon = filtered.reduce(
    (prev, l) => Math.max(prev, l.longitude!!),
    -180
  );

  const markers = filtered
    .map((location) => (
      <Marker
        key={`l-${location.id}`}
        icon={customMarkerIcon}
        position={[location.latitude!!, location.longitude!!]}
      >
        <Popup>
          <span>{location.name}</span>
        </Popup>
      </Marker>
    ))
    .filter((point) => point);

  const bounds = [
    [minLat, minLon] as LatLngTuple,
    [maxLat, maxLon] as LatLngTuple,
  ];

  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [25, 25] }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markers}
    </MapContainer>
  );
};

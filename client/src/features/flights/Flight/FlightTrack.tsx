import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";

import { Segment } from "../../../shared/flights/types";
import { renderToStaticMarkup } from "react-dom/server";
import { divIcon, LatLngTuple } from "leaflet";

import LocationIcon from "@mui/icons-material/LocationOn";
import { Location } from "../../../shared/locations/types";

interface IFlightLocationProps {
  location: Location;
  segments: Segment[];
}

export const FlightTrack = ({ location, segments }: IFlightLocationProps) => {
  if (!location?.latitude || !location?.longitude) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
  });

  const track = segments
    .flatMap((segment) =>
      segment.rows.map((row) => !!row?.["GPS"] && row["GPS"].split(" "))
    )
    .filter((point) => !!point);

  const locationTuple = [location.latitude, location.longitude] as LatLngTuple;

  return (
    <MapContainer center={locationTuple} zoom={14}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {location && (
        <Marker
          key={"location"}
          icon={customMarkerIcon}
          position={locationTuple}
        >
          <Popup>
            <span>{location.name}</span>
          </Popup>
        </Marker>
      )}

      <Polyline positions={track}></Polyline>
    </MapContainer>
  );
};

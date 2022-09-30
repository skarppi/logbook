import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';

import * as React from 'react';
import { Flight } from '../../../../../shared/flights/types';
import { Location } from '../../../../../shared/locations/types';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

import LocationIcon from '@mui/icons-material/LocationOn';

interface IFlightLocationProps {
  flight: Flight;
}

export const FlightTrack = ({ flight }: IFlightLocationProps) => {

  if (!flight.location?.latitude) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup
  });

  const track = flight.segments.flatMap(segment =>
    segment.rows
      .filter(row => row['GPS'])
      .map(row => row['GPS'].split(' '))
  ).filter(point => point);

  return (
    <Map center={[flight.location.latitude, flight.location.longitude]} zoom={14}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <Marker
        key={'location'}
        icon={customMarkerIcon}
        position={[flight.location.latitude, flight.location.longitude]}
      >
        <Popup>
          <span>{flight.location.name}</span>
        </Popup>
      </Marker>

      <Polyline positions={track}></Polyline>
    </Map>);
};
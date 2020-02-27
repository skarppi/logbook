import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';

import * as React from 'react';
import { Flight } from '../../../../../shared/flights/types';
import { Location } from '../../../../../shared/locations/types';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

import LocationIcon from '@material-ui/icons/LocationOn';

interface IFlightLocationProps {
  locations: Location[];
}

export const LocationMap = ({ locations }: IFlightLocationProps) => {

  const filtered = locations.filter(l => l.latitude && l.longitude);

  if (filtered.length === 0) {
    return <></>;
  }

  const iconMarkup = renderToStaticMarkup(<LocationIcon />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
    iconAnchor: [12, 24],
    iconSize: [24, 24]
  });

  const centerLat = filtered.reduce((sum, l) => sum + l.latitude, 0) / filtered.length;
  const centerLon = filtered.reduce((sum, l) => sum + l.longitude, 0) / filtered.length;

  const markers = filtered.map(location =>
    <Marker
      key={`l-${location.id}`}
      icon={customMarkerIcon}
      position={[location.latitude, location.longitude]}
    >
      <Popup>
        <span>{location.name}</span>
      </Popup>
    </Marker>
  ).filter(point => point);

  return (
    <Map center={[centerLat, centerLon]} zoom={10}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {markers}
    </Map>);
};
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  properties: any[];
  className?: string;
}

// Generate some mock coordinates around East Legon (5.635, -0.150)
const MOCK_COORDS = [
  { lat: 5.6353, lng: -0.1501 },
  { lat: 5.6300, lng: -0.1550 },
  { lat: 5.6400, lng: -0.1450 },
  { lat: 5.6320, lng: -0.1400 },
  { lat: 5.6380, lng: -0.1600 },
];

export function PropertiesMap({ properties, className = "h-full w-full" }: MapProps) {
  const center = { lat: 5.6353, lng: -0.1501 };

  return (
    <MapContainer center={center} zoom={13} className={`rounded-xl z-0 ${className}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property, idx) => {
        const coord = property.map_coordinates 
          ? { lat: parseFloat(property.map_coordinates.split(',')[0]), lng: parseFloat(property.map_coordinates.split(',')[1]) }
          : MOCK_COORDS[idx % MOCK_COORDS.length];

        return (
          <Marker key={property.id} position={coord}>
            <Popup className="property-popup">
              <div className="w-48">
                <img src={property.gallery?.[0]} alt={property.title} className="w-full h-24 object-cover rounded-t-lg mb-2" />
                <div className="px-2 pb-2">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1">{property.title}</h3>
                  <p className="text-amber-600 font-bold text-sm mb-2">{formatCurrency(property.price)}</p>
                  <Link to={`/properties/${property.slug}`} className="text-xs text-blue-500 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

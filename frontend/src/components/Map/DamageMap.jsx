/**
 * DamageMap – Leaflet map component showing all road damage reports as
 * colour-coded circle markers (red = critical, orange = medium, yellow = low).
 *
 * Props:
 *   features  – GeoJSON Feature array from /api/map-data
 *   onSelect  – callback(feature) when a marker is clicked
 */
import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { severityHexColor } from '../../utils/helpers';

/** Auto-fit map bounds when features change */
function FitBounds({ features }) {
  const map = useMap();
  useEffect(() => {
    if (!features || features.length === 0) return;
    const coords = features.map((f) => [
      f.geometry.coordinates[1],
      f.geometry.coordinates[0],
    ]);
    if (coords.length === 1) {
      map.setView(coords[0], 13);
    } else {
      map.fitBounds(coords, { padding: [40, 40] });
    }
  }, [features, map]);
  return null;
}

export default function DamageMap({ features = [], onSelect }) {
  // Default center: New York City
  const defaultCenter = [40.7128, -74.006];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      className="leaflet-container"
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      {/* OpenStreetMap dark-style tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds features={features} />

      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const { severity_label, damage_type, severity_score, repair_status, id } =
          feature.properties;

        const color = severityHexColor(severity_label);

        return (
          <CircleMarker
            key={id}
            center={[lat, lng]}
            radius={10}
            pathOptions={{
              fillColor: color,
              color: color,
              fillOpacity: 0.7,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect && onSelect(feature) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="text-xs font-medium">
                <div className="capitalize font-bold">{damage_type}</div>
                <div>Severity: {severity_score} ({severity_label})</div>
                <div>Status: {repair_status}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

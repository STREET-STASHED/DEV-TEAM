"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MarkerData[];
  polyline: { lat: number; lng: number }[];
}

export default function Map({ center, zoom, markers, polyline }: MapProps) {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
        <Polyline
          positions={polyline.map((point) => [point.lat, point.lng])}
          pathOptions={{ color: "blue" }}
        />
      </MapContainer>
    </div>
  );
}

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Vite/bundlers break Leaflet's default marker icons — point to CDN images instead
const shopIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-90", // tints it differently from shop markers
});

function ShopMap({ shops, userLocation }) {
  const center = userLocation || [26.9124, 75.7873]; // fallback: Jaipur

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-green-100 h-[420px]">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {shops.map((shop) => (
          <Marker
            key={shop._id}
            position={[shop.location.coordinates[1], shop.location.coordinates[0]]} // [lat, lng] for Leaflet
            icon={shopIcon}
          >
            <Popup>
              <strong>{shop.name}</strong><br />
              {shop.address}<br />
              {shop.phone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ShopMap;
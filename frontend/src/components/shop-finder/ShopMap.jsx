import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const shopIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const activeShopIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  className: "active-marker", // slightly larger/emphasized
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Inner component to handle map interactions
function MapController({ selectedShop, shops, userLocation }) {
  const map = useMap();
  const popupRefs = useRef({});

  useEffect(() => {
    if (selectedShop) {
      // Center map on the selected shop
      const [lng, lat] = selectedShop.location.coordinates;
      map.setView([lat, lng], 15, { animate: true }); // zoom level 15, smooth animation

      // Close all other popups, open this one
      Object.values(popupRefs.current).forEach((popup) => popup?.close());
      popupRefs.current[selectedShop._id]?.openPopup();
    }
  }, [selectedShop, map]);

  return (
    <>
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>📍 You are here</Popup>
        </Marker>
      )}

      {shops.map((shop) => (
        <Marker
          key={shop._id}
          position={[shop.location.coordinates[1], shop.location.coordinates[0]]}
          icon={selectedShop?._id === shop._id ? activeShopIcon : shopIcon}
          ref={(marker) => {
            if (marker) popupRefs.current[shop._id] = marker._popup;
          }}
        >
          <Popup>
            <strong>{shop.name}</strong>
            <br />
            {shop.address}
            <br />
            📞 {shop.phone}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function ShopMap({ shops, userLocation, selectedShop }) {
  const center = userLocation || [26.9124, 75.7873];

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-green-100 h-[420px]">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedShop={selectedShop} shops={shops} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}

export default ShopMap;
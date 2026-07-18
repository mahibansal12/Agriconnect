import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

// ── Custom icons ──────────────────────────────────────────────────────────────

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
});

// Blue pulsing dot for the user's own position
const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:18px;height:18px;
      background:radial-gradient(circle,#3b82f6 30%,#1d4ed8);
      border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 0 0 4px rgba(59,130,246,0.4);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── Recenter button — rendered inside MapContainer so it can call useMap() ────
function RecenterButton({ userLocation }) {
  const map = useMap();
  const [hovered, setHovered] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  if (!userLocation) return null;

  const handleClick = () => {
    setPulsing(true);
    map.flyTo(userLocation, 15, { animate: true, duration: 1.2 });
    setTimeout(() => setPulsing(false), 1200);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "52px",        // above Leaflet attribution
        right: "12px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Recenter to my location"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "12px",
          background: hovered
            ? "linear-gradient(135deg,#16a34a,#15803d)"
            : "rgba(255,255,255,0.95)",
          color: hovered ? "#fff" : "#16a34a",
          border: `2px solid ${hovered ? "#15803d" : "#86efac"}`,
          boxShadow: pulsing
            ? "0 0 0 6px rgba(22,163,74,0.25), 0 4px 16px rgba(0,0,0,0.15)"
            : "0 2px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 700,
          backdropFilter: "blur(6px)",
          transition: "all 0.2s ease",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "15px" }}>📍</span>
        My Location
      </button>
    </div>
  );
}

// ── Inner component that renders markers + map fly logic ──────────────────────
function MapContent({ shops, userLocation, selectedShop, searchedCenter }) {
  const popupRefs = useRef({});
  const map = useMap();
  const hasCenteredOnUser = useRef(false);

  // Fly to user location when it first arrives
  useEffect(() => {
    if (userLocation && !hasCenteredOnUser.current) {
      map.flyTo(userLocation, 14, { animate: true, duration: 1.5 });
      hasCenteredOnUser.current = true;
    }
  }, [userLocation, map]);

  // Fly to searched city center when user searches by location name
  useEffect(() => {
    if (searchedCenter) {
      map.flyTo(searchedCenter, 13, { animate: true, duration: 1.5 });
    }
  }, [searchedCenter, map]);

  // Fly to selected shop and open its popup
  useEffect(() => {
    if (selectedShop) {
      const [lng, lat] = selectedShop.location.coordinates;
      map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
      setTimeout(() => {
        popupRefs.current[selectedShop._id]?.openPopup();
      }, 1100);
    }
  }, [selectedShop, map]);

  return (
    <>
      {/* User location marker + soft accuracy circle */}
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={300}
            pathOptions={{ color: "#3b82f6", fillColor: "#93c5fd", fillOpacity: 0.15, weight: 1 }}
          />
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong>📍 You are here</strong>
            </Popup>
          </Marker>
        </>
      )}

      {/* Shop markers */}
      {shops.map((shop) => {
        const [lng, lat] = shop.location.coordinates;
        const isSelected = selectedShop?._id === shop._id;
        return (
          <Marker
            key={shop._id}
            position={[lat, lng]}
            icon={isSelected ? activeShopIcon : shopIcon}
            ref={(marker) => {
              if (marker) popupRefs.current[shop._id] = marker;
            }}
          >
            <Popup>
              <div style={{ minWidth: "160px" }}>
                <strong style={{ fontSize: "13px" }}>{shop.name}</strong>
                <br />
                <span style={{ fontSize: "11px", color: "#6b7280" }}>{shop.address || "—"}</span>
                <br />
                {shop.phone && shop.phone !== "Not listed" && (
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>
                    📞 {shop.phone}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// ── Main ShopMap export ───────────────────────────────────────────────────────
function ShopMap({ shops, userLocation, selectedShop, searchedCenter }) {
  const defaultCenter = [20.5937, 78.9629];
  const initialZoom = userLocation ? 14 : 5;

  return (
    <div style={{ height: "420px", position: "relative" }}>
      <MapContainer
        center={userLocation || defaultCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapContent
          shops={shops}
          userLocation={userLocation}
          selectedShop={selectedShop}
          searchedCenter={searchedCenter}
        />
        {/* Recenter button rendered inside MapContainer to access useMap() */}
        <RecenterButton userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}

export default ShopMap;
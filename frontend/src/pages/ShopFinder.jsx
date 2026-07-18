import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import ShopCard from "../components/shop-finder/ShopCard";
import ShopMap from "../components/shop-finder/ShopMap";
import Navbar from "../components/common/Navbar";

const categories = ["all", "seeds", "fertilizer", "pesticide", "equipment", "general"];

const categoryMeta = {
  all:        { label: "All Shops",   icon: "🌾", activeBg: "linear-gradient(135deg,#166534,#15803d)", activeText: "#fff", chip: "#166534" },
  seeds:      { label: "Seeds",       icon: "🌱", activeBg: "linear-gradient(135deg,#365314,#4d7c0f)", activeText: "#fff", chip: "#4d7c0f" },
  fertilizer: { label: "Fertilizer",  icon: "🧪", activeBg: "linear-gradient(135deg,#134e4a,#0f766e)", activeText: "#fff", chip: "#0f766e" },
  pesticide:  { label: "Pesticide",   icon: "🐛", activeBg: "linear-gradient(135deg,#7c2d12,#c2410c)", activeText: "#fff", chip: "#c2410c" },
  equipment:  { label: "Equipment",   icon: "🚜", activeBg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", activeText: "#fff", chip: "#1d4ed8" },
  general:    { label: "General",     icon: "🏪", activeBg: "linear-gradient(135deg,#4c1d95,#7c3aed)", activeText: "#fff", chip: "#7c3aed" },
};




function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// ── Nominatim geocoding (free, no API key) ────────────────────────────────
async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  return data.map((d) => ({
    displayName: d.display_name,
    shortName: [d.address?.city || d.address?.town || d.address?.village || d.address?.county, d.address?.state].filter(Boolean).join(", "),
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}

function ShopFinder() {
  const [userLocation, setUserLocation]         = useState(null);
  const [locationLoading, setLocationLoading]   = useState(true);
  const [categoryFilter, setCategoryFilter]     = useState("all");
  const [activeShop, setActiveShop]             = useState(null);

  // ── Location search state ─────────────────────────────────────────────────
  const [locationQuery, setLocationQuery]       = useState("");   // text in search box
  const [suggestions, setSuggestions]           = useState([]);   // Nominatim suggestions
  const [suggestLoading, setSuggestLoading]     = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null); // { lat, lon, name } after geocoding
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const suggestTimer                            = useRef(null);
  const searchRef                               = useRef(null);

  // ── Secondary name/district filter (applied on top of fetched shops) ──────
  const [nameFilter, setNameFilter]             = useState("");

  const [shops, setShops]                       = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);
  const [radiusKm, setRadiusKm]                 = useState(15);

  // ── Fetch nearby shops using any lat/lon ────────────────────────────────
  const fetchNearbyShops = useCallback(async (lat, lon, radius = radiusKm) => {
    try {
      setLoading(true);
      setError(null);
      const maxDistance = radius * 1000;
      const res = await axiosInstance.get(
        `/v1/shops/nearby?latitude=${lat}&longitude=${lon}&maxDistance=${maxDistance}`
      );
      setShops(res.data.data || []);
    } catch (err) {
      console.error("Nearby shops fetch error:", err);
      setError("Failed to load nearby shops. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [radiusKm]);

  const fetchAllShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/v1/shops");
      setShops(res.data.data || []);
    } catch (err) {
      console.error("Shops fetch error:", err);
      setError("Failed to load shop directory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GPS detection on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      fetchAllShops();
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLocationLoading(false);
        fetchNearbyShops(latitude, longitude, radiusKm);
      },
      () => {
        setUserLocation(null);
        setLocationLoading(false);
        fetchAllShops();
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Radius change (re-fetch for active location) ──────────────────────────
  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    const loc = searchedLocation
      ? [searchedLocation.lat, searchedLocation.lon]
      : userLocation;
    if (loc) fetchNearbyShops(loc[0], loc[1], newRadius);
  };

  // ── Debounced Nominatim suggestions while typing ──────────────────────────
  const handleLocationInput = (val) => {
    setLocationQuery(val);
    clearTimeout(suggestTimer.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const results = await geocodeLocation(val);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { /* ignore */ }
      finally { setSuggestLoading(false); }
    }, 400);
  };

  // ── Pick a suggestion → geocode → fetch shops ────────────────────────────
  const handleSuggestionSelect = (suggestion) => {
    setLocationQuery(suggestion.shortName || suggestion.displayName);
    setSearchedLocation({ lat: suggestion.lat, lon: suggestion.lon, name: suggestion.shortName || suggestion.displayName });
    setShowSuggestions(false);
    setNameFilter("");
    fetchNearbyShops(suggestion.lat, suggestion.lon, radiusKm);
  };

  // ── Enter key or search button ────────────────────────────────────────────
  const handleSearchSubmit = async () => {
    if (!locationQuery.trim()) return;
    setSuggestLoading(true);
    setShowSuggestions(false);
    try {
      const results = await geocodeLocation(locationQuery);
      if (results.length > 0) {
        handleSuggestionSelect(results[0]);
      } else {
        setError(`No location found for "${locationQuery}". Try a city name like "Delhi" or "Lucknow".`);
      }
    } catch {
      setError("Location search failed. Please try again.");
    } finally {
      setSuggestLoading(false);
    }
  };

  // ── Reset to GPS location ─────────────────────────────────────────────────
  const resetToMyLocation = () => {
    setSearchedLocation(null);
    setLocationQuery("");
    setNameFilter("");
    if (userLocation) fetchNearbyShops(userLocation[0], userLocation[1], radiusKm);
    else fetchAllShops();
  };

  // ── Close suggestions on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Client-side name/district filter on top of fetched list ─────────────
  const filteredShops = shops.filter((shop) => {
    const matchCat = categoryFilter === "all" || shop.category === categoryFilter;
    const matchName =
      !nameFilter ||
      shop.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      (shop.address || "").toLowerCase().includes(nameFilter.toLowerCase()) ||
      (shop.district || "").toLowerCase().includes(nameFilter.toLowerCase());
    return matchCat && matchName;
  });

  const isLocating   = locationLoading;
  const hasLocation  = !!userLocation;
  const activeCenter = searchedLocation
    ? [searchedLocation.lat, searchedLocation.lon]
    : userLocation;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0fdf4 0%, #f7fef9 40%, #ecfdf5 70%, #f0fdfa 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 35%, #166534 65%, #065f46 100%)",
        padding: "0 0 0 0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:"-60px", right:"120px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", left:"60px", width:"160px", height:"160px", borderRadius:"50%", background:"rgba(52,211,153,0.06)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          {/* Left: title */}
          <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
            <div style={{
              width:"68px", height:"68px",
              background:"rgba(255,255,255,0.12)",
              border:"2px solid rgba(134,239,172,0.4)",
              borderRadius:"18px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"34px",
              boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
              backdropFilter:"blur(6px)",
            }}>🏬</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Shop Directory</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:800, letterSpacing:"-0.5px", lineHeight:1.15 }}>
                Nearby Agriculture Shops
              </h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px", fontWeight:400 }}>
                Seeds, fertilizers, pesticides & equipment — all near you.
              </p>
            </div>
          </div>

          {/* Right: location search box */}
          <div ref={searchRef} style={{ position:"relative", width:"380px", flexShrink:0 }}>
            <div style={{ display:"flex", gap:"8px" }}>
              {/* Input */}
              <div style={{ position:"relative", flex:1 }}>
                <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"15px", pointerEvents:"none" }}>
                  {suggestLoading ? "⏳" : "🔍"}
                </span>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search city or location…"
                  style={{
                    width:"100%", boxSizing:"border-box",
                    paddingLeft:"42px", paddingRight:"12px",
                    paddingTop:"12px", paddingBottom:"12px",
                    borderRadius:"12px",
                    background:"rgba(255,255,255,0.10)",
                    border:"1.5px solid rgba(134,239,172,0.35)",
                    color:"#fff",
                    fontSize:"13px",
                    outline:"none",
                    backdropFilter:"blur(8px)",
                  }}
                />
              </div>
              {/* Search button */}
              <button
                onClick={handleSearchSubmit}
                style={{
                  padding:"0 18px",
                  borderRadius:"12px",
                  background:"linear-gradient(135deg,#22c55e,#16a34a)",
                  color:"#fff",
                  border:"none",
                  cursor:"pointer",
                  fontSize:"13px",
                  fontWeight:700,
                  whiteSpace:"nowrap",
                  boxShadow:"0 2px 8px rgba(22,163,74,0.4)",
                }}
              >
                Search
              </button>
            </div>

            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
                background:"#fff", borderRadius:"12px",
                boxShadow:"0 8px 30px rgba(0,0,0,0.18)",
                border:"1.5px solid #d1fae5",
                zIndex:999, overflow:"hidden",
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionSelect(s)}
                    style={{
                      display:"block", width:"100%", textAlign:"left",
                      padding:"11px 16px",
                      background:"transparent",
                      border:"none",
                      borderBottom: i < suggestions.length - 1 ? "1px solid #f0fdf4" : "none",
                      cursor:"pointer",
                      fontSize:"13px",
                      color:"#111827",
                      transition:"background 0.1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ marginRight:"8px" }}>📍</span>
                    <strong>{s.shortName}</strong>
                    <span style={{ fontSize:"11px", color:"#9ca3af", marginLeft:"6px", display:"block", paddingLeft:"22px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {s.displayName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats ribbon */}
        <div style={{
          background:"rgba(0,0,0,0.18)",
          borderTop:"1px solid rgba(134,239,172,0.15)",
          backdropFilter:"blur(4px)",
        }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"10px 48px", display:"flex", gap:"36px", alignItems:"center" }}>
            {[
              { val: loading || isLocating ? "—" : shops.length, label: "Nearby Shops" },
              { val: "5", label: "Categories" },
              { val: hasLocation ? `${radiusKm} km` : "—", label: "Search Radius" },
              { val: "Free", label: "Directory Access" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:"16px" }}>{s.val}</span>
                <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"28px 48px 48px" }}>

        {/* Location status bar */}
        <div style={{
          marginBottom:"18px",
          padding:"12px 18px",
          borderRadius:"12px",
          background: searchedLocation ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : hasLocation ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : isLocating ? "linear-gradient(135deg,#fffbeb,#fef3c7)" : "#f9fafb",
          border: `1.5px solid ${searchedLocation ? "#93c5fd" : hasLocation ? "#86efac" : isLocating ? "#fbbf24" : "#e5e7eb"}`,
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px",
          flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, minWidth:0 }}>
            <span style={{ fontSize:"18px", flexShrink:0 }}>
              {isLocating ? "⏳" : searchedLocation ? "🔍" : hasLocation ? "📍" : "⚠️"}
            </span>
            <div style={{ minWidth:0 }}>
              <span style={{ fontSize:"13px", fontWeight:600, color: searchedLocation ? "#1d4ed8" : hasLocation ? "#166534" : isLocating ? "#92400e" : "#374151" }}>
                {isLocating
                  ? "Detecting your location…"
                  : searchedLocation
                    ? `Showing shops near "${searchedLocation.name}" within ${radiusKm} km`
                    : hasLocation
                      ? `Your location detected — showing shops within ${radiusKm} km`
                      : "Location unavailable — showing all listed shops"}
              </span>
              {/* Name filter pill */}
              <div style={{ marginTop:"4px", display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"11px", color:"#6b7280" }}>Filter by name:</span>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  placeholder="e.g. Beej, Krishi…"
                  style={{
                    padding:"3px 10px", borderRadius:"999px",
                    border:"1.5px solid #d1fae5",
                    fontSize:"11px", outline:"none",
                    width:"130px",
                  }}
                />
                {searchedLocation && (
                  <button
                    onClick={resetToMyLocation}
                    style={{
                      padding:"3px 10px", borderRadius:"999px",
                      background:"#dbeafe", color:"#1d4ed8",
                      border:"1.5px solid #93c5fd",
                      fontSize:"11px", fontWeight:700,
                      cursor:"pointer",
                    }}
                  >
                    ↩ Back to my location
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Radius selector */}
          {(hasLocation || searchedLocation) && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
              <span style={{ fontSize:"12px", color:"#4b7a5c", fontWeight:600 }}>Radius:</span>
              {[5, 10, 15, 25, 50].map(km => (
                <button
                  key={km}
                  onClick={() => handleRadiusChange(km)}
                  style={{
                    padding:"4px 12px",
                    borderRadius:"999px",
                    fontSize:"12px", fontWeight:700,
                    cursor:"pointer",
                    border: radiusKm === km ? "1.5px solid #16a34a" : "1.5px solid #d1fae5",
                    background: radiusKm === km ? "#16a34a" : "#fff",
                    color: radiusKm === km ? "#fff" : "#166534",
                    transition:"all 0.15s",
                  }}
                >
                  {km} km
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"24px", padding:"14px 20px", borderRadius:"12px", background:"#fee2e2", border:"1.5px solid #fca5a5", color:"#991b1b", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <span style={{ fontWeight:600, fontSize:"14px" }}>⚠️ {error}</span>
            <button
              onClick={() => userLocation ? fetchNearbyShops(userLocation[0], userLocation[1]) : fetchAllShops()}
              style={{ padding:"6px 14px", borderRadius:"8px", background:"#991b1b", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Category Filter ── */}
        <div style={{
          display:"flex", gap:"10px", marginBottom:"26px",
          overflowX:"auto", paddingBottom:"4px",
        }}>
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  display:"flex", alignItems:"center", gap:"8px",
                  padding:"10px 22px",
                  borderRadius:"999px",
                  fontSize:"13px", fontWeight:700,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                  transition:"all 0.18s ease",
                  border: active ? "2.5px solid transparent" : "2.5px solid #d1fae5",
                  background: active ? meta.activeBg : "#fff",
                  color: active ? "#fff" : "#374151",
                  boxShadow: active
                    ? `0 4px 16px rgba(0,0,0,0.18), 0 0 0 3px ${meta.chip}22`
                    : "0 1px 4px rgba(0,0,0,0.07)",
                  transform: active ? "translateY(-2px) scale(1.03)" : "scale(1)",
                  outline:"none",
                }}
              >
                <span style={{ fontSize:"15px" }}>{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}

          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
            <span style={{
              background:"#dcfce7", color:"#166534",
              border:"1.5px solid #86efac",
              padding:"6px 16px", borderRadius:"999px",
              fontSize:"12px", fontWeight:700,
            }}>
              📍 {loading || isLocating ? "..." : filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* ── Main Grid: Map + Cards ── */}
        <div style={{
          display:"grid",
          gridTemplateColumns: "1fr 400px",
          gap: "24px",
          alignItems: "stretch",
        }}>

          {/* ── Map Panel ── */}
          <div style={{
            borderRadius:"22px",
            overflow:"hidden",
            boxShadow:"0 8px 40px rgba(0,0,0,0.13)",
            border:"2.5px solid #86efac",
            background:"#fff",
            position:"relative",
          }}>
            {/* Map label */}
            <div style={{
              padding:"14px 20px",
              background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderBottom:"1.5px solid #bbf7d0",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{
                  width:"32px", height:"32px", borderRadius:"10px",
                  background:"#16a34a", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"16px",
                  boxShadow:"0 2px 8px rgba(22,163,74,0.3)",
                }}>🗺️</div>
                <div>
                  <div style={{ fontWeight:700, color:"#14532d", fontSize:"14px" }}>Live Shop Map</div>
                  <div style={{ fontSize:"11px", color:"#4b7a5c" }}>Click a card to highlight on map</div>
                </div>
              </div>
              <span style={{
                background:"#fff", border:"1.5px solid #86efac",
                color:"#16a34a", fontSize:"11px", fontWeight:700,
                padding:"4px 12px", borderRadius:"999px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
              }}>
                {loading || isLocating ? "..." : filteredShops.length} pins
              </span>
            </div>

            <ShopMap
              shops={filteredShops}
              userLocation={userLocation}
              searchedCenter={searchedLocation ? [searchedLocation.lat, searchedLocation.lon] : null}
              selectedShop={activeShop}
            />

            {/* Bottom bar */}
            <div style={{
              padding:"10px 20px",
              background:"#f0fdf4",
              borderTop:"1px solid #d1fae5",
              display:"flex", alignItems:"center", gap:"16px",
            }}>
              <span style={{ fontSize:"11px", color:"#6b7280" }}>📡 Powered by OpenStreetMap</span>
              {isLocating && (
                <span style={{ fontSize:"11px", color:"#92400e", fontWeight:600, marginLeft:"auto" }}>⏳ Getting location…</span>
              )}
              {!isLocating && hasLocation && (
                <span style={{ fontSize:"11px", color:"#16a34a", fontWeight:600, marginLeft:"auto" }}>✅ Location detected</span>
              )}
              {!isLocating && !hasLocation && (
                <span style={{ fontSize:"11px", color:"#9ca3af", fontWeight:600, marginLeft:"auto" }}>📡 Real data via OpenStreetMap</span>
              )}
            </div>
          </div>

          {/* ── Shop Cards Panel ── */}
          <div style={{
            borderRadius: "22px",
            border: "2.5px solid #86efac",
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
            background: "#fff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "540px",  /* Fixed height so scroll area fills it */
          }}>
            {/* Panel header */}
            <div style={{
              padding:"16px 20px",
              background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderBottom:"1.5px solid #bbf7d0",
              display:"flex", alignItems:"center", gap:"12px",
            }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"10px",
                background:"#16a34a", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"18px",
                boxShadow:"0 3px 10px rgba(22,163,74,0.3)",
              }}>🏪</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:"#14532d", fontSize:"15px" }}>Shops Near You</div>
                <div style={{ fontSize:"11px", color:"#4b7a5c", marginTop:"1px" }}>
                  {categoryFilter === "all" ? "All categories" : categoryMeta[categoryFilter].label}
                  {hasLocation ? ` • within ${radiusKm} km` : ""}
                </div>
              </div>
              <div style={{
                background:"#16a34a", color:"#fff",
                fontSize:"12px", fontWeight:800,
                padding:"4px 12px", borderRadius:"999px",
                boxShadow:"0 2px 8px rgba(22,163,74,0.35)",
              }}>
                {loading || isLocating ? "..." : filteredShops.length}
              </div>
            </div>

            {/* Scroll area — block flow so cards render at natural height */}
            <div style={{
              flex: 1,
              overflowY: "scroll",
              padding: "14px",
              scrollbarWidth: "auto",
              scrollbarColor: "#86efac #f0fdf4",
            }}>
              {loading || isLocating ? (
                [1, 2, 3].map(n => (
                  <div key={n} style={{ background: "#fff", borderRadius: "18px", padding: "20px", border: "1.5px solid #d1fae5" }}>
                    <div style={{ height: "16px", background: "#f0fdf4", width: "60%", marginBottom: "10px", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                    <div style={{ height: "12px", background: "#f0fdf4", width: "80%", marginBottom: "6px", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                    <div style={{ height: "12px", background: "#f0fdf4", width: "40%", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                  </div>
                ))
              ) : filteredShops.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af" }}>
                  <div style={{ fontSize:"48px", marginBottom:"10px" }}>🔍</div>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"#6b7280" }}>No shops found nearby</p>
                  <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"4px" }}>
                    {hasLocation
                      ? `Try increasing the search radius (currently ${radiusKm} km)`
                      : "Try a different category or search term"}
                  </p>
                  {hasLocation && radiusKm < 50 && (
                    <button
                      onClick={() => handleRadiusChange(radiusKm === 5 ? 10 : radiusKm === 10 ? 15 : radiusKm === 15 ? 25 : 50)}
                      style={{
                        marginTop:"14px",
                        padding:"8px 20px",
                        borderRadius:"999px",
                        background:"#16a34a",
                        color:"#fff",
                        border:"none",
                        cursor:"pointer",
                        fontSize:"13px",
                        fontWeight:700,
                      }}
                    >
                      Expand to {radiusKm === 5 ? 10 : radiusKm === 10 ? 15 : radiusKm === 15 ? 25 : 50} km
                    </button>
                  )}
                </div>
              ) : (
                filteredShops.map((shop, idx) => (
                  <div key={shop._id} style={{ marginBottom: "12px" }}>
                    <ShopCard
                      shop={shop}
                      index={idx}
                      isActive={activeShop?._id === shop._id}
                      onSelect={setActiveShop}
                      distance={
                        userLocation
                          ? getDistanceKm(
                              userLocation[0], userLocation[1],
                              shop.location.coordinates[1], shop.location.coordinates[0]
                            )
                          : null
                      }
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div style={{
              padding:"12px 20px",
              background:"#f9fafb",
              borderTop:"1px solid #e5e7eb",
              textAlign:"center",
            }}>
              <span style={{ fontSize:"11px", color:"#9ca3af" }}>
                💡 Click any shop card to highlight it on the map
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ShopFinder;
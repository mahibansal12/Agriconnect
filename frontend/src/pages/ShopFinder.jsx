import { useState, useEffect } from "react";
import { mockShops } from "../mockdata/shopFinderMock";
import ShopCard from "../components/shop-finder/ShopCard";
import ShopMap from "../components/shop-finder/ShopMap";

const categories = ["all", "seeds", "fertilizer", "pesticide", "equipment", "general"];

// quick straight-line distance estimate, in km — good enough for a list sort, not for routing
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function ShopFinder() {
  const [userLocation, setUserLocation] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeShop, setActiveShop] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation(null) // permission denied or unavailable — map just falls back to Jaipur
      );
    }
  }, []);

  const filteredShops = mockShops.filter(
    (shop) => categoryFilter === "all" || shop.category === categoryFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Nearby Agriculture Shops</h1>
      <p className="text-gray-600 mb-6">Find seeds, fertilizers, pesticides, and equipment near you.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              categoryFilter === cat ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ShopMap shops={filteredShops} userLocation={userLocation} />
        </div>

        <div className="space-y-3 order-1 lg:order-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredShops.map((shop) => (
            <ShopCard
              key={shop._id}
              shop={shop}
              isActive={activeShop?._id === shop._id}
              onSelect={setActiveShop}
              distance={
                userLocation
                  ? getDistanceKm(userLocation[0], userLocation[1], shop.location.coordinates[1], shop.location.coordinates[0])
                  : null
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShopFinder;
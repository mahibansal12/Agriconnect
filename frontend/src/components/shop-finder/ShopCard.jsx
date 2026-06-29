const categoryIcons = {
  seeds: "🌱",
  fertilizer: "🧪",
  pesticide: "🐛",
  equipment: "🚜",
  general: "🏪",
};

function ShopCard({ shop, distance, onSelect, isActive }) {
  return (
    <button
      onClick={() => onSelect(shop)}
      className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
        isActive ? "border-green-500 ring-2 ring-green-200" : "border-green-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryIcons[shop.category] || "🏪"}</span>
          <h3 className="font-semibold text-green-800">{shop.name}</h3>
        </div>
        {distance && <span className="text-xs text-gray-400 whitespace-nowrap">{distance} km</span>}
      </div>
      <p className="text-sm text-gray-500 mt-1">{shop.address}, {shop.district}</p>
      <p className="text-sm text-green-700 mt-1">{shop.phone}</p>
    </button>
  );
}

export default ShopCard;
const categories = ["all", "government", "market", "weather", "technology", "general"];

function NewsCategoryTabs({ activeCategory, onChange }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
            activeCategory === cat
              ? "bg-green-700 text-white"
              : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default NewsCategoryTabs;
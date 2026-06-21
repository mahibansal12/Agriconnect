import { useState } from "react";
import { mockCrops } from "./mockData";
import CropInfoCard from "../../components/crop-knowledge/CropInfoCard";

function CropKnowledge() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", "grain", "pulse", "fruit", "vegetable", "spice", "cash crop"];

  const filteredCrops = mockCrops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || crop.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Crop Knowledge Center</h1>
      <p className="text-gray-600 mb-6">Everything you need to know about growing each crop.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search crops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 capitalize"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredCrops.length === 0 ? (
        <p className="text-gray-500">No crops match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropInfoCard key={crop._id} crop={crop} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CropKnowledge;
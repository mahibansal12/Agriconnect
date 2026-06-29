import { useState } from "react";
import { mockPests } from "../../mockdata/pestLibraryMock";
import PestCard from "../../components/pest-library/PestCard";

const types = ["all", "insect", "fungus", "bacteria", "virus", "weed"];

function PestLibrary() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredPests = mockPests.filter((pest) => {
    const matchesSearch =
      pest.name.toLowerCase().includes(search.toLowerCase()) ||
      pest.affectedCrops.some((crop) => crop.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || pest.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Pest &amp; Disease Library</h1>
      <p className="text-gray-600 mb-6">Identify pests and diseases, and find the right treatment fast.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by pest or crop name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 w-72"
        />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              typeFilter === t ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filteredPests.length === 0 ? (
        <p className="text-gray-500">No pests match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPests.map((pest) => <PestCard key={pest._id} pest={pest} />)}
        </div>
      )}
    </div>
  );
}

export default PestLibrary;
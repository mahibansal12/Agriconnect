import { useState } from "react";
import { mockSchemes } from "../../mockdata/schemesMock";
import { Link } from "react-router-dom";

const categories = [
  { value: "subsidy", label: "Income Support / Subsidy" },
  { value: "loan", label: "Loans / Credit" },
  { value: "insurance", label: "Crop Insurance" },
  { value: "training", label: "Training / Skill Development" },
  { value: "other", label: "Other Support" },
];

function EligibilityChecker() {
  const [needType, setNeedType] = useState("");
  const [checked, setChecked] = useState(false);

  const matchingSchemes = mockSchemes.filter((s) => s.category === needType);

  const handleCheck = (e) => {
    e.preventDefault();
    setChecked(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Check Your Eligibility</h3>

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={needType}
          onChange={(e) => { setNeedType(e.target.value); setChecked(false); }}
          required
          className="flex-1 px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">What kind of support are you looking for?</option>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
          Check
        </button>
      </form>

      {checked && (
        <div>
          {matchingSchemes.length === 0 ? (
            <p className="text-gray-500 text-sm">No matching schemes found right now — check back later.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">You may be eligible for:</p>
              {matchingSchemes.map((s) => (
                <Link
                  key={s._id}
                  to={`/schemes/${s._id}`}
                  className="block px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <p className="font-medium text-green-800">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.benefits.split(",")[0]}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Note: This is a simplified eligibility check based on scheme category. Always confirm exact eligibility on the official scheme page.
      </p>
    </div>
  );
}

export default EligibilityChecker;
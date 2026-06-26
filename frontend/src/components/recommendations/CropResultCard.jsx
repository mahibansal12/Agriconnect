// src/components/recommendations/CropResultCard.jsx
// Displays a single recommended crop result card

const CONFIDENCE_COLOR = (score) => {
  if (score >= 80) return { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  };
  if (score >= 60) return { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' };
  return               { bar: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' };
};

const CropResultCard = ({ crop, rank }) => {
  const {
    name,
    confidence = 0,   // 0–100
    season,
    waterNeed,        // 'Low' | 'Medium' | 'High'
    duration,         // e.g. '90–120 days'
    avgYield,         // e.g. '25 qtl/acre'
    marketPrice,      // e.g. '₹2200/qtl'
    tips = [],        // array of short strings
    emoji = '🌾',
  } = crop;

  const { bar, text, bg } = CONFIDENCE_COLOR(confidence);

  return (
    <div className={`rounded-2xl border ${bg} border-opacity-60 p-5 relative overflow-hidden`}>

      {/* Rank badge */}
      {rank && (
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white shadow text-xs font-bold text-gray-600 flex items-center justify-center">
          #{rank}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          {season && <p className="text-xs text-gray-500">{season}</p>}
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Match Score</span>
          <span className={`text-xs font-bold ${text}`}>{confidence}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full ${bar} rounded-full transition-all duration-700`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        {[
          { label: '💧 Water Need',    value: waterNeed  },
          { label: '⏱ Duration',       value: duration   },
          { label: '📦 Avg Yield',     value: avgYield   },
          { label: '💰 Market Price',  value: marketPrice },
        ].filter(({ value }) => value).map(({ label, value }) => (
          <div key={label} className="bg-white bg-opacity-60 rounded-lg p-2">
            <p className="text-gray-400">{label}</p>
            <p className="font-semibold text-gray-700 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="border-t border-white border-opacity-60 pt-3 space-y-1">
          {tips.slice(0, 2).map((tip, i) => (
            <p key={i} className="text-xs text-gray-600 flex gap-1.5">
              <span className="text-green-500 flex-shrink-0">✓</span>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropResultCard;

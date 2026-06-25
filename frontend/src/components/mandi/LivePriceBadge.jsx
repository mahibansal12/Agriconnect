// src/components/mandi/LivePriceBadge.jsx
// Shows a live animated badge when a price has been updated via socket.io.
// Usage: <LivePriceBadge price={2450} isLive={true} unit="qtl" />

const LivePriceBadge = ({ price, isLive = false, unit = 'qtl', prevPrice = null }) => {
  const isUp   = prevPrice !== null && price > prevPrice;
  const isDown = prevPrice !== null && price < prevPrice;

  const priceColor = isUp
    ? 'text-green-600'
    : isDown
    ? 'text-red-500'
    : 'text-gray-800';

  const arrow = isUp ? '▲' : isDown ? '▼' : null;

  return (
    <div className="flex items-center gap-2">
      {/* Price */}
      <span className={`font-bold text-base ${priceColor}`}>
        ₹{price?.toLocaleString('en-IN')}/{unit}
      </span>

      {/* Arrow indicator */}
      {arrow && (
        <span className={`text-xs font-semibold ${isUp ? 'text-green-500' : 'text-red-400'}`}>
          {arrow}
        </span>
      )}

      {/* LIVE badge */}
      {isLive && (
        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </span>
      )}
    </div>
  );
};

export default LivePriceBadge;

// src/components/mandi/PriceChart.jsx
// Recharts line chart showing price history for a selected crop.
// Usage: <PriceChart crop="Wheat" history={[{ date, price }]} loading={false} />

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-green-700">
        ₹{payload[0].value?.toLocaleString('en-IN')}/qtl
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const PriceChart = ({ crop = '', history = [], loading = false }) => {

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-72">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center h-72 text-gray-400">
        <span className="text-4xl mb-2">📈</span>
        <p className="text-sm font-medium text-gray-500">
          {crop ? `No price history for ${crop}` : 'Select a crop to view price trend'}
        </p>
      </div>
    );
  }

  // Format data for recharts
  const chartData = history.map((item) => ({
    date: item.date
      ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : item.date,
    price: item.price,
  }));

  const prices  = history.map((h) => h.price);
  const minP    = Math.min(...prices);
  const maxP    = Math.max(...prices);
  const avgP    = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const latest  = prices[prices.length - 1];
  const prev    = prices[prices.length - 2];
  const change  = prev ? (((latest - prev) / prev) * 100).toFixed(1) : null;
  const isUp    = change !== null && Number(change) >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            {crop} — Price Trend
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Last {history.length} records</p>
        </div>

        {/* Latest price + change */}
        <div className="text-right">
          <p className="text-xl font-bold text-green-700">
            ₹{latest?.toLocaleString('en-IN')}
          </p>
          {change !== null && (
            <p className={`text-xs font-semibold mt-0.5 ${isUp ? 'text-green-500' : 'text-red-400'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(change)}% vs prev
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Min', value: minP, color: 'text-blue-600' },
          { label: 'Avg', value: avgP, color: 'text-orange-500' },
          { label: 'Max', value: maxP, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${color}`}>₹{value?.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
            domain={['auto', 'auto']}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgP}
            stroke="#F97316"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: 'Avg', position: 'insideTopRight', fill: '#F97316', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#16a34a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

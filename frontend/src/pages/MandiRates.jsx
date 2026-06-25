// src/pages/MandiRates.jsx
// Full mandi dashboard: filters + live table + price chart + socket.io updates

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMandiRates, fetchPriceHistory, updateLiveRate } from '../redux/slices/mandiSlice';
import MandiTable   from '../components/mandi/MandiTable';
import MandiFilters from '../components/mandi/MandiFilters';
import PriceChart   from '../components/mandi/PriceChart';
import Loader       from '../components/common/Loader';
import useSocket    from '../hooks/useSocket';

const MandiRates = () => {
  const dispatch = useDispatch();
  const socket   = useSocket();

  const { rates, priceHistory, loading, historyLoading, error } = useSelector(
    (state) => state.mandi
  );

  const [filters, setFilters] = useState({
    crop: 'All', state: 'All', market: '',
  });

  const [selectedCrop, setSelectedCrop] = useState(null); // for chart
  const [isConnected, setIsConnected]   = useState(false);

  // ── Fetch rates whenever filters change ───────────────────
  useEffect(() => {
    dispatch(fetchMandiRates(filters));
  }, [filters, dispatch]);

  // ── Socket.io — live price updates ────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleConnect    = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleMandiUpdate = (data) => {
      // data = { crop, market, price, prevPrice }
      dispatch(updateLiveRate(data));
    };

    socket.on('connect',        handleConnect);
    socket.on('disconnect',     handleDisconnect);
    socket.on('mandi-update',   handleMandiUpdate);

    // Join the mandi room for live updates
    socket.emit('join-room', 'mandi');

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect',       handleConnect);
      socket.off('disconnect',    handleDisconnect);
      socket.off('mandi-update',  handleMandiUpdate);
      socket.emit('leave-room', 'mandi');
    };
  }, [socket, dispatch]);

  // ── When user clicks a row → show that crop's chart ───────
  const handleRowClick = useCallback((row) => {
    setSelectedCrop(row.crop);
    if (!priceHistory[row.crop]) {
      dispatch(fetchPriceHistory(row.crop));
    }
  }, [priceHistory, dispatch]);

  // ── Summary stats ──────────────────────────────────────────
  const liveCount = rates.filter((r) => r.isLive).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mandi Rates</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Live market prices from mandis across India
            </p>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className={isConnected ? 'text-green-700 font-medium' : 'text-gray-400'}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
            {liveCount > 0 && (
              <span className="ml-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {liveCount} updated
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Summary cards */}
        {!loading && rates.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Records',
                value: rates.length,
                icon: '📋',
                color: 'text-gray-800',
              },
              {
                label: 'Crops Listed',
                value: [...new Set(rates.map((r) => r.crop))].length,
                icon: '🌾',
                color: 'text-green-700',
              },
              {
                label: 'Markets Covered',
                value: [...new Set(rates.map((r) => r.market))].length,
                icon: '🏪',
                color: 'text-blue-700',
              },
              {
                label: 'Live Updates',
                value: liveCount,
                icon: '⚡',
                color: 'text-orange-600',
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <MandiFilters filters={filters} onChange={setFilters} />

        {/* Result count */}
        {!loading && !error && (
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">{rates.length}</span>{' '}
            {rates.length === 1 ? 'rate' : 'rates'}
            {selectedCrop && (
              <span className="ml-2 text-green-600">
                · Click any row to view price trend
              </span>
            )}
          </p>
        )}

        {/* Main content */}
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Table — takes 2/3 on xl */}
            <div className="xl:col-span-2">
              <MandiTable
                rates={rates}
                onRowClick={handleRowClick}
              />
            </div>

            {/* Chart — takes 1/3 on xl */}
            <div className="xl:col-span-1">
              <PriceChart
                crop={selectedCrop}
                history={selectedCrop ? (priceHistory[selectedCrop] || []) : []}
                loading={historyLoading}
              />

              {/* Tip when no crop selected */}
              {!selectedCrop && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  👆 Click any row in the table to view its price trend
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MandiRates;

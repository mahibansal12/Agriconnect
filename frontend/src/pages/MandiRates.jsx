// src/pages/MandiRates.jsx
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMandiRates, fetchPriceHistory, updateLiveRate } from '../redux/slices/mandiSlice';
import MandiTable from '../components/mandi/MandiTable';
import MandiFilters from '../components/mandi/MandiFilters';
import PriceChart from '../components/mandi/PriceChart';
import Navbar from '../components/common/Navbar';
import useSocket from '../hooks/useSocket';

const DEMO_RATES = [
  { crop: 'Wheat', market: 'Jaipur Mandi', state: 'Rajasthan', minPrice: 2320, maxPrice: 2510, price: 2440, prevPrice: 2390, date: '2026-07-02', isLive: true },
  { crop: 'Rice', market: 'Karnal Mandi', state: 'Haryana', minPrice: 1980, maxPrice: 2190, price: 2115, prevPrice: 2140, date: '2026-07-02' },
  { crop: 'Mustard', market: 'Bharatpur Mandi', state: 'Rajasthan', minPrice: 5480, maxPrice: 5780, price: 5625, prevPrice: 5540, date: '2026-07-02', isLive: true },
  { crop: 'Soybean', market: 'Indore Mandi', state: 'Madhya Pradesh', minPrice: 4180, maxPrice: 4490, price: 4375, prevPrice: 4310, date: '2026-07-02' },
  { crop: 'Cotton', market: 'Rajkot Mandi', state: 'Gujarat', minPrice: 6820, maxPrice: 7210, price: 7040, prevPrice: 6960, date: '2026-07-02' },
  { crop: 'Onion', market: 'Lasalgaon Mandi', state: 'Maharashtra', minPrice: 1550, maxPrice: 1880, price: 1720, prevPrice: 1665, date: '2026-07-02', isLive: true },
];

const DEMO_HISTORY = {
  Wheat: [
    { date: '2026-06-27', price: 2320 },
    { date: '2026-06-28', price: 2350 },
    { date: '2026-06-29', price: 2390 },
    { date: '2026-06-30', price: 2365 },
    { date: '2026-07-01', price: 2410 },
    { date: '2026-07-02', price: 2440 },
  ],
  Mustard: [
    { date: '2026-06-27', price: 5400 },
    { date: '2026-06-28', price: 5480 },
    { date: '2026-06-29', price: 5520 },
    { date: '2026-06-30', price: 5575 },
    { date: '2026-07-01', price: 5540 },
    { date: '2026-07-02', price: 5625 },
  ],
};

const applyFilters = (rows, filters) =>
  rows.filter((row) => {
    const cropOk = filters.crop === 'All' || row.crop === filters.crop;
    const stateOk = filters.state === 'All' || row.state === filters.state;
    const marketOk = !filters.market || row.market.toLowerCase().includes(filters.market.toLowerCase());
    return cropOk && stateOk && marketOk;
  });

const MandiRates = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { rates, priceHistory, loading, historyLoading, error } = useSelector((state) => state.mandi);

  const [filters, setFilters] = useState({ crop: 'All', state: 'All', market: '' });
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    dispatch(fetchMandiRates(filters));
  }, [filters, dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleMandiUpdate = (data) => dispatch(updateLiveRate(data));

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('mandi-update', handleMandiUpdate);
    socket.emit('join-room', 'mandi');

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('mandi-update', handleMandiUpdate);
      socket.emit('leave-room', 'mandi');
    };
  }, [socket, dispatch]);

  const sourceRates = rates.length ? rates : DEMO_RATES;
  const visibleRates = applyFilters(sourceRates, filters);
  const liveCount = visibleRates.filter((r) => r.isLive).length;

  const history = selectedCrop
    ? priceHistory[selectedCrop] || DEMO_HISTORY[selectedCrop] || DEMO_RATES
        .filter((row) => row.crop === selectedCrop)
        .map((row) => ({ date: row.date, price: row.price }))
    : [];

  const handleRowClick = useCallback((row) => {
    setSelectedCrop(row.crop);
    if (!priceHistory[row.crop]) dispatch(fetchPriceHistory(row.crop));
  }, [priceHistory, dispatch]);

  return (
    <div className="mandi-page">
      <Navbar />

      {/* ===== Header (Crop Knowledge style) ===== */}
      <section className="mandi-hero">
        <div className="mandi-hero-circle mandi-hero-circle-1" />
        <div className="mandi-hero-circle mandi-hero-circle-2" />
        <div className="mandi-hero-inner">
          <div className="mandi-eyebrow">AgriConnect • Mandi Rates</div>
          <h1>📈 Mandi Rates</h1>
          <p>
            Track crop prices across major Indian mandis, compare modal rates,
            and monitor market trends before selling your harvest.
          </p>
          <div className="mandi-hero-stats">
            <div><strong>{visibleRates.length}</strong><span>Total Records</span></div>
            <div><strong>{new Set(visibleRates.map((r) => r.crop)).size}</strong><span>Crops Listed</span></div>
            <div><strong>{new Set(visibleRates.map((r) => r.market)).size}</strong><span>Markets Covered</span></div>
            <div><strong>{liveCount}</strong><span>Live Updates</span></div>
          </div>
        </div>
      </section>
      {/* ===== End Header ===== */}

      <main id="mandi-board" className="mandi-main">
        <div className="mandi-filters-card">
          <MandiFilters filters={filters} onChange={setFilters} />
        </div>

        <section className="mandi-stats">
          {[
            ['Total Records', visibleRates.length, '📋'],
            ['Crops Listed', new Set(visibleRates.map((r) => r.crop)).size, '🌾'],
            ['Markets Covered', new Set(visibleRates.map((r) => r.market)).size, '🏪'],
            ['Live Updates', liveCount, '⚡'],
          ].map(([label, value, icon]) => (
            <div className="mandi-stat" key={label}>
              <span>{icon}</span>
              <div><strong>{value}</strong><small>{label}</small></div>
            </div>
          ))}
        </section>

        {loading && !rates.length && (
          <div className="mandi-note">Loading backend prices. Showing official demo board meanwhile.</div>
        )}

        <div className="mandi-content">
          <div className="mandi-table-wrap">
            <div className="mandi-section-head">
              <div>
                <h2>Market Board</h2>
                <p>{visibleRates.length} rates visible after filters</p>
              </div>
            </div>
            <MandiTable rates={visibleRates} onRowClick={handleRowClick} />
          </div>

          <div className="mandi-chart-wrap">
            <PriceChart crop={selectedCrop} history={history} loading={historyLoading && !DEMO_HISTORY[selectedCrop]} />
            <div className="mandi-tip">Click any row to update the trend chart.</div>
          </div>
        </div>
      </main>

      <style>{`
        .mandi-page { min-height: 100vh; background: linear-gradient(135deg, #EAF7FF 0%, #FFF8E6 46%, #EFFBEF 100%); }

        /* ===== Header (Crop Knowledge style — matched dimensions) ===== */
        .mandi-hero { position: relative; overflow: hidden; min-height: 300px; display: flex; align-items: center; background: linear-gradient(135deg, #0a3d1f 0%, #14532d 55%, #1b6b34 100%); }
        .mandi-hero-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); pointer-events: none; }
        .mandi-hero-circle-1 { width: 420px; height: 420px; top: -160px; right: -90px; }
        .mandi-hero-circle-2 { width: 240px; height: 240px; bottom: -120px; left: 8%; background: rgba(255,255,255,0.04); }
        .mandi-hero-inner { position: relative; z-index: 1; width: min(100% - 48px, 1280px); margin: 0 auto; padding: 40px 0 36px; }
        .mandi-eyebrow { display: inline-flex; margin-bottom: 14px; color: #86efac; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .mandi-hero-inner h1 { margin: 0; display: flex; align-items: center; gap: 12px; color: #fff; font-size: clamp(28px, 3.4vw, 38px); font-weight: 900; line-height: 1.1; }
        .mandi-hero-inner p { max-width: 700px; margin: 14px 0 0; color: rgba(255,255,255,0.82); font-size: 15px; line-height: 1.65; }
        .mandi-hero-stats { display: flex; flex-wrap: wrap; gap: 0; margin-top: 22px; }
        .mandi-hero-stats div { display: flex; align-items: baseline; gap: 6px; padding-right: 20px; margin-right: 20px; border-right: 1px solid rgba(255,255,255,0.2); }
        .mandi-hero-stats div:last-child { border-right: none; margin-right: 0; padding-right: 0; }
        .mandi-hero-stats strong { color: #fff; font-size: 20px; font-weight: 900; }
        .mandi-hero-stats span { color: rgba(255,255,255,0.72); font-size: 13px; font-weight: 700; }
        @media (max-width: 640px) {
          .mandi-hero-inner { width: min(100% - 32px, 1280px); padding: 32px 0 28px; }
          .mandi-hero-stats { flex-direction: column; gap: 12px; }
          .mandi-hero-stats div { border-right: none; padding-right: 0; margin-right: 0; }
        }
        /* ===== End Header ===== */

        .mandi-main { width: min(100% - 48px, 1280px); margin: 0 auto; padding: 32px 0 72px; }

        /* ===== Filters card ===== */
        .mandi-filters-card {
          background: #ffffff;
          border: 1px solid #E4EEDC;
          border-radius: 18px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 18px 44px rgba(20,83,45,0.08);
        }
        .mandi-filters-card > * {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 20px;
        }
        .mandi-filters-card label,
        .mandi-filters-card > * > div > label {
          display: block;
          margin-bottom: 8px;
          color: #4B7A5C;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .mandi-filters-card select,
        .mandi-filters-card input {
          height: 46px;
          min-width: 200px;
          padding: 0 14px;
          border: 1px solid #DDE8D2;
          border-radius: 10px;
          background: #F9FBF6;
          color: #0A2E0C;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(20,83,45,0.04);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .mandi-filters-card select:focus,
        .mandi-filters-card input:focus {
          outline: none;
          border-color: #1b6b34;
          box-shadow: 0 0 0 3px rgba(27,107,52,0.12);
        }
        .mandi-filters-card input::placeholder { color: #9CB8A8; font-weight: 500; }
        @media (max-width: 768px) {
          .mandi-filters-card { padding: 22px 20px; }
          .mandi-filters-card > * { flex-direction: column; align-items: stretch; gap: 16px; }
          .mandi-filters-card select,
          .mandi-filters-card input { width: 100%; min-width: 0; }
        }
        .mandi-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin: 20px 0; }
        .mandi-stat { display: flex; align-items: center; gap: 14px; min-height: 92px; border: 1px solid #D8E8C8; border-radius: 14px; background: rgba(255,255,255,0.9); padding: 18px; box-shadow: 0 18px 40px rgba(45,92,30,0.08); }
        .mandi-stat span { font-size: 28px; }
        .mandi-stat strong { display: block; color: #0A2E0C; font-size: 24px; line-height: 1; }
        .mandi-stat small { display: block; margin-top: 6px; color: #4B7A5C; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        .mandi-note { border: 1px solid #FDE68A; background: #FFFBEB; color: #92400E; border-radius: 12px; padding: 12px 14px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
        .mandi-content { display: grid; grid-template-columns: minmax(0, 2fr) minmax(360px, 1fr); gap: 22px; align-items: start; }
        .mandi-table-wrap, .mandi-chart-wrap { min-width: 0; }
        .mandi-section-head { margin-bottom: 12px; }
        .mandi-section-head h2 { margin: 0; color: #0A2E0C; font-size: 24px; font-weight: 900; }
        .mandi-section-head p { margin: 4px 0 0; color: #4B7A5C; font-size: 14px; }
        .mandi-tip { margin-top: 12px; border: 1px solid #BBF7D0; background: #F0FDF4; color: #166534; border-radius: 12px; padding: 12px; text-align: center; font-size: 13px; font-weight: 800; }
        @media (max-width: 980px) { .mandi-content { grid-template-columns: 1fr; } .mandi-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .mandi-main { width: min(100% - 32px, 1280px); } .mandi-stats { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default MandiRates;

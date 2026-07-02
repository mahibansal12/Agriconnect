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
  const isDemo = !!error || !rates.length;
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

      <section className="mandi-hero">
        <div className="mandi-field-lines" />
        <div className="mandi-hero-inner">
          <div className="mandi-copy">
            <div className="mandi-eyebrow">Official mandi intelligence</div>
            <h1>Mandi Rates</h1>
            <p>
              Track crop prices across major Indian mandis, compare modal rates,
              and spot market movement before selling your harvest.
            </p>
            <div className="mandi-actions">
              <a href="#mandi-board" className="mandi-primary">View live board</a>
              <span className="mandi-pill">{isDemo ? 'Demo data active' : 'Backend connected'}</span>
            </div>
          </div>

          <aside className="mandi-panel">
            <div className="mandi-panel-label">Market pulse</div>
            <div className="mandi-price">₹{visibleRates[0]?.price?.toLocaleString('en-IN') || '2,440'}</div>
            <div className="mandi-panel-sub">{visibleRates[0]?.crop || 'Wheat'} modal price today</div>
            <div className="mandi-mini-grid">
              <div><strong>{visibleRates.length}</strong><span>Records</span></div>
              <div><strong>{new Set(visibleRates.map((r) => r.crop)).size}</strong><span>Crops</span></div>
              <div><strong>{liveCount}</strong><span>Live</span></div>
            </div>
            <div className="mandi-status">
              <span className={isConnected ? 'mandi-dot live' : 'mandi-dot'} />
              {isConnected ? 'Socket live' : 'Offline preview'}
            </div>
          </aside>
        </div>
      </section>

      <main id="mandi-board" className="mandi-main">
        <MandiFilters filters={filters} onChange={setFilters} />

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
        .mandi-hero { position: relative; overflow: hidden; min-height: 420px; background: linear-gradient(90deg, rgba(7,41,18,0.88), rgba(18,85,28,0.72), rgba(245,158,11,0.42)), radial-gradient(circle at 82% 14%, rgba(255,205,83,0.95) 0 8%, rgba(255,173,46,0.24) 9% 22%, transparent 34%), linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%); }
        .mandi-field-lines { position: absolute; left: -8%; right: -8%; top: 45%; bottom: -30%; opacity: 0.82; background: repeating-linear-gradient(104deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 58px), repeating-linear-gradient(76deg, rgba(8,69,22,0.30) 0 3px, transparent 3px 70px); transform: perspective(520px) rotateX(58deg); transform-origin: top; }
        .mandi-hero-inner { position: relative; z-index: 1; width: min(100% - 48px, 1280px); min-height: 420px; margin: 0 auto; padding: 58px 0 66px; display: grid; grid-template-columns: minmax(0, 1fr) 420px; align-items: center; gap: 72px; }
        .mandi-copy h1 { margin: 0; color: #fff; font-size: clamp(42px, 5vw, 66px); line-height: 1.05; font-weight: 900; letter-spacing: 0; }
        .mandi-copy p { max-width: 650px; margin: 20px 0 0; color: rgba(255,255,255,0.88); font-size: 18px; line-height: 1.8; }
        .mandi-eyebrow { display: inline-flex; margin-bottom: 20px; padding: 6px 14px; border: 1px solid rgba(255,226,139,0.48); border-radius: 6px; background: rgba(255,248,220,0.16); color: #FFE7A3; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .mandi-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 32px; }
        .mandi-primary { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 24px; border-radius: 8px; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 14px 30px rgba(239,68,68,0.24); }
        .mandi-pill { min-height: 38px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,235,167,0.72); color: #fff; background: rgba(255,255,255,0.08); font-weight: 800; font-size: 13px; }
        .mandi-panel { border: 1px solid rgba(179,229,252,0.42); border-radius: 14px; padding: 22px; color: #fff; background: rgba(9,68,76,0.42); box-shadow: 0 20px 50px rgba(10,45,30,0.22); backdrop-filter: blur(6px); }
        .mandi-panel-label { color: #B3E5FC; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
        .mandi-price { margin-top: 20px; font-size: 48px; line-height: 1; font-weight: 900; color: #FFE082; }
        .mandi-panel-sub { margin-top: 8px; color: rgba(255,255,255,0.78); }
        .mandi-mini-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 22px; }
        .mandi-mini-grid div { min-height: 76px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .mandi-mini-grid strong { color: #fff; font-size: 22px; }
        .mandi-mini-grid span { margin-top: 4px; color: rgba(255,255,255,0.68); font-size: 12px; }
        .mandi-status { margin-top: 16px; display: flex; align-items: center; gap: 8px; color: #DFFBE8; font-size: 13px; }
        .mandi-dot { width: 9px; height: 9px; border-radius: 50%; background: #CBD5E1; }
        .mandi-dot.live { background: #22C55E; box-shadow: 0 0 0 5px rgba(34,197,94,0.18); }
        .mandi-main { width: min(100% - 48px, 1280px); margin: 0 auto; padding: 32px 0 72px; }
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
        @media (max-width: 980px) { .mandi-hero-inner, .mandi-content { grid-template-columns: 1fr; } .mandi-panel { max-width: 520px; } .mandi-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .mandi-hero-inner, .mandi-main { width: min(100% - 32px, 1280px); } .mandi-copy h1 { font-size: 38px; } .mandi-copy p { font-size: 16px; } .mandi-stats, .mandi-mini-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default MandiRates;

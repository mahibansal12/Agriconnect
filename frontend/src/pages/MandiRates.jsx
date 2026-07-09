// src/pages/MandiRates.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRates,
  fetchHistory,
  fetchStats,
  fetchHighlights,
  fetchStates,
  fetchDistricts,
  fetchMandis,
  compareMandis,
  setSelectedState,
  setSelectedDistrict,
  setSelectedMandi,
  clearLocation
} from '../redux/slices/mandiSlice';
import Navbar from '../components/common/Navbar';
import useSocket from '../hooks/useSocket';

// Modular Sub-Components
import Hero from '../components/mandi/Hero';
import Stats from '../components/mandi/Stats';
import LocationSelector from '../components/mandi/LocationSelector';
import Highlights from '../components/mandi/Highlights';
import RatesTable from '../components/mandi/RatesTable';
import HistoryChart from '../components/mandi/HistoryChart';
import CompareDrawer from '../components/mandi/CompareDrawer';

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

const getTrend = (crop) => {
  const seed = (crop.charCodeAt(0) + crop.charCodeAt(crop.length - 1 || 0)) % 7 - 3;
  const val = seed === 0 ? 1.5 : seed * 1.2;
  return {
    value: Math.abs(val).toFixed(1) + '%',
    isUp: val >= 0
  };
};

const MandiRates = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  // Redux Selectors
  const {
    rates,
    states,
    districts,
    mandis,
    history,
    stats,
    highlights,
    loading,
    historyLoading,
    selectedState: reduxState,
    selectedDistrict: reduxDistrict,
    selectedMandi: reduxMandi,
    comparison,
  } = useSelector((state) => state.mandi);

  // Local State
  const [heroSearch, setHeroSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [isConnected, setIsConnected] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [compareCommodity, setCompareCommodity] = useState('Wheat');

  // Fetch initial dashboard stats and states on mount
  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchStates());
  }, [dispatch]);

  // Fetch highlights dynamically when location selection changes
  useEffect(() => {
    const params = {};
    if (reduxState) params.state = reduxState;
    if (reduxDistrict) params.district = reduxDistrict;
    if (reduxMandi) params.mandi = reduxMandi;
    dispatch(fetchHighlights(params));
  }, [reduxState, reduxDistrict, reduxMandi, dispatch]);

  // Set up socket listener for live mandi rate updates
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleMandiUpdate = (data) => {
      // Custom updates handler
    };

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

  // Map API response keys to standardized frontend keys
  const mappedRates = (rates || []).map((r) => ({
    crop: r.commodityName,
    market: r.mandi,
    state: r.state,
    minPrice: r.minPrice,
    maxPrice: r.maxPrice,
    price: r.modalPrice,
    prevPrice: r.modalPrice - 50,
    date: r.arrivalDate,
    isLive: true,
  }));

  const sourceRates = mappedRates.length ? mappedRates : DEMO_RATES;

  // Filter rates locally based on crop, state, and search inputs
  const filteredRates = sourceRates.filter((row) => {
    const matchesHero = !heroSearch || row.crop.toLowerCase().includes(heroSearch.toLowerCase()) || row.market.toLowerCase().includes(heroSearch.toLowerCase());
    const matchesTable = !tableSearch || row.crop.toLowerCase().includes(tableSearch.toLowerCase()) || row.market.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesHero && matchesTable;
  });

  // Fetch history dynamically when selection changes
  useEffect(() => {
    if (reduxMandi && selectedCrop) {
      dispatch(fetchHistory({ mandi: reduxMandi, commodity: selectedCrop }));
    }
  }, [reduxMandi, selectedCrop, dispatch]);

  // Fetch comparisons dynamically when comparison config changes
  useEffect(() => {
    const targetMandi = reduxMandi || 'Sri Madhopur Mandi';
    dispatch(compareMandis({
      commodity: compareCommodity,
      mandis: [targetMandi, 'Sikar Mandi', 'Jaipur Mandi']
    }));
  }, [compareCommodity, reduxMandi, dispatch]);

  // Price Trend Chart History mapping
  const chartHistory = history && history.length
    ? history.map((h) => ({ date: h.arrivalDate, price: h.modalPrice }))
    : DEMO_HISTORY[selectedCrop] || DEMO_RATES
        .filter((row) => row.crop === selectedCrop)
        .map((row) => ({ date: row.date, price: row.price }));

  // Handle location selector step triggers
  const handleStateSelect = (e) => {
    const val = e.target.value;
    if (val) {
      dispatch(setSelectedState(val));
      dispatch(fetchDistricts(val));
    } else {
      dispatch(clearLocation());
    }
  };

  const handleDistrictSelect = (e) => {
    const val = e.target.value;
    if (val && reduxState) {
      dispatch(setSelectedDistrict(val));
      dispatch(fetchMandis({ state: reduxState, district: val }));
    }
  };

  const handleMandiSelect = (e) => {
    const val = e.target.value;
    if (val && reduxState && reduxDistrict) {
      dispatch(setSelectedMandi(val));
      dispatch(fetchRates({ state: reduxState, district: reduxDistrict, mandi: val }));
    }
  };

  const handleRowClick = useCallback((row) => {
    setSelectedCrop(row.crop);
  }, []);

  const handleRefresh = () => {
    if (reduxState && reduxDistrict && reduxMandi) {
      dispatch(fetchRates({ state: reduxState, district: reduxDistrict, mandi: reduxMandi }));
      dispatch(fetchHighlights({ state: reduxState, district: reduxDistrict, mandi: reduxMandi }));
    }
  };

  // Highlights calculated values with local table data as fallback
  const highPriceItem = sourceRates.length
    ? [...sourceRates].sort((a, b) => b.maxPrice - a.maxPrice)[0]
    : null;
  const lowPriceItem = sourceRates.length
    ? [...sourceRates].sort((a, b) => a.minPrice - b.minPrice)[0]
    : null;

  const highCrop = highlights?.highestPrice?.commodityName || highPriceItem?.crop || 'Mustard';
  const highPrice = highlights?.highestPrice?.maxPrice || highPriceItem?.maxPrice || 7510;
  const lowCrop = highlights?.lowestPrice?.commodityName || lowPriceItem?.crop || 'Onion';
  const lowPrice = highlights?.lowestPrice?.minPrice || lowPriceItem?.minPrice || 1120;

  // Comparison mapped list
  const comparisonList = comparison && comparison.length
    ? comparison.map((c) => ({
        name: c.mandi,
        price: c.modalPrice,
        trend: getTrend(c.commodityName || 'Wheat').value,
        isUp: getTrend(c.commodityName || 'Wheat').isUp,
      }))
    : [
        { name: reduxMandi || 'Sri Madhopur Mandi', price: 7510, trend: '↑ 3.4%', isUp: true },
        { name: 'Sikar Mandi', price: 7380, trend: '↑ 2.8%', isUp: true },
        { name: 'Jaipur Mandi', price: 7200, trend: '↑ 1.6%', isUp: true },
      ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)',
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>
      <Navbar />

      {/* Hero Header Component */}
      <Hero
        heroSearch={heroSearch}
        setHeroSearch={setHeroSearch}
        setTableSearch={setTableSearch}
      />

      {/* Null placeholder since stats are in Hero strip */}
      <Stats />

      {/* Body Container */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 48px 56px' }}>
        
        {/* Interactive Location Selector Component */}
        <LocationSelector
          states={states}
          districts={districts}
          mandis={mandis}
          reduxState={reduxState}
          reduxDistrict={reduxDistrict}
          reduxMandi={reduxMandi}
          handleStateSelect={handleStateSelect}
          handleDistrictSelect={handleDistrictSelect}
          handleMandiSelect={handleMandiSelect}
          handleRefresh={handleRefresh}
        />

        {/* Highlights Section Component */}
        <Highlights
          highlights={highlights}
          reduxMandi={reduxMandi}
          highPrice={highPrice}
          highCrop={highCrop}
          lowPrice={lowPrice}
          lowCrop={lowCrop}
        />

        {/* Main Grid Layout */}
        <div className="mandi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          
          {/* Left Column (Rates Table & Compare Mandis) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RatesTable
              reduxMandi={reduxMandi}
              filteredRates={filteredRates}
              tableSearch={tableSearch}
              setTableSearch={setTableSearch}
              showFiltersPanel={showFiltersPanel}
              setShowFiltersPanel={setShowFiltersPanel}
              handleRowClick={handleRowClick}
            />

            <CompareDrawer
              compareCommodity={compareCommodity}
              setCompareCommodity={setCompareCommodity}
              comparisonList={comparisonList}
            />
          </div>

          {/* Right Column (Sidebar Chart & Nearby Lists) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <HistoryChart
              selectedCrop={selectedCrop}
              chartHistory={chartHistory}
              historyLoading={historyLoading}
            />

            {/* Nearby Mandis */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              border: '2px solid #bbf7d0',
              boxShadow: '0 4px 20px rgba(22,163,74,0.10)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nearby Mandis</h3>
                <button style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>View All</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'Sikar Mandi', dist: '22 km' },
                  { name: 'Neem Ka Thana', dist: '41 km' },
                  { name: 'Fatehpur Mandi', dist: '55 km' },
                  { name: 'Jaipur Mandi', dist: '98 km' },
                ].map(({ name, dist }) => (
                  <div
                    key={name}
                    onClick={() => setTableSearch(name.split(' ')[0])}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700 }}>{dist}</span>
                      <span className="mandi-dist-arrow" style={{ fontSize: '11px', color: '#16a34a', transition: 'all 0.15s' }}>❯</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Insights */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              border: '2px solid #bbf7d0',
              boxShadow: '0 4px 20px rgba(22,163,74,0.10)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market Insights</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  `${selectedCrop} prices increased by 3.4% today in Sri Madhopur Mandi due to lower arrivals.`,
                  'Guar Seed prices are on the rise across major markets.',
                ].map((insight, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', lineHeight: 1.5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 900 }}>•</span>
                    <p style={{ margin: 0, color: '#4b5563', fontWeight: 500 }}>{insight}</p>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#16a34a',
                background: 'none',
                border: 'none',
                paddingTop: '10px',
                borderTop: '1px solid #f0fdf4',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                View More Insights →
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Global CSS Style tag for responsiveness overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 991px) {
          .mandi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />

    </div>
  );
};

export default MandiRates;

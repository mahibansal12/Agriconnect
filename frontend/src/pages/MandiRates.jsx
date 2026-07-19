// src/pages/MandiRates.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getTrend, getArrivals } from '../utils/mandiDerived';
import { formatPrice, formatDate } from '../utils/formatters';
import { resolveMandiLocation, haversineDistanceKm, getNearestDistricts } from '../utils/mandiGeo';
import axiosInstance from '../utils/axiosInstance';

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

// Used only as the candidate pool for "Nearby Mandis" before the user has picked a
// state/district/mandi (so the section isn't empty on first load). Distances for
// these are still computed for real via resolveMandiLocation/haversineDistanceKm —
// only the candidate *names* are a fixed starter list, matching the state/district
// already used as page-load defaults elsewhere (Rajasthan > Sikar > Sri Madhopur).
const DEMO_NEARBY_CANDIDATES = [
  { name: 'Sri Madhopur Mandi', state: 'Rajasthan', district: 'Sikar' },
  { name: 'Sikar Mandi', state: 'Rajasthan', district: 'Sikar' },
  { name: 'Neem Ka Thana Mandi', state: 'Rajasthan', district: 'Sikar' },
  { name: 'Fatehpur Mandi', state: 'Rajasthan', district: 'Sikar' },
  { name: 'Jaipur Mandi', state: 'Rajasthan', district: 'Jaipur' },
  { name: 'Bharatpur Mandi', state: 'Rajasthan', district: 'Bharatpur' },
];

const MandiRates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [compareCommodity, setCompareCommodity] = useState('');

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

  // Fallback-aware "current location" labels, used by highlightsComputed /
  // marketInsights below as well as the nearby-mandis logic further down —
  // declared early so every derived section can safely depend on them.
  const effectiveState = reduxState || 'Rajasthan';
  const effectiveDistrict = reduxDistrict || 'Sikar';
  const effectiveMandi = reduxMandi || 'Sri Madhopur Mandi';

  // Filter rates locally based on crop, state, and search inputs
  const filteredRates = sourceRates.filter((row) => {
    const matchesHero = !heroSearch || row.crop.toLowerCase().includes(heroSearch.toLowerCase()) || row.market.toLowerCase().includes(heroSearch.toLowerCase());
    const matchesTable = !tableSearch || row.crop.toLowerCase().includes(tableSearch.toLowerCase()) || row.market.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesHero && matchesTable;
  });

  // Crops actually available at the currently selected mandi (from the same
  // rows already shown in the rates table above), used to drive the Compare
  // Mandis crop dropdown so it never offers a crop with no data behind it.
  const availableCrops = useMemo(() => {
    const unique = Array.from(new Set(sourceRates.map((r) => r.crop).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [sourceRates]);

  // Fetch history dynamically when selection changes
  useEffect(() => {
    if (reduxMandi && selectedCrop) {
      dispatch(fetchHistory({ mandi: reduxMandi, commodity: selectedCrop }));
    }
  }, [reduxMandi, selectedCrop, dispatch]);

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

  // --- Today's Market Highlights -----------------------------------------
  // NOTE: the /v1/mandi/highlights endpoint (getTodayHighlights on the backend)
  // ignores state/district/mandi filters entirely and always aggregates across
  // every mandi in the DB — that mismatch is exactly why the cards used to show
  // a commodity/price unrelated to the selected mandi. Since the backend can't
  // be touched, highlights are instead derived purely from `sourceRates`, i.e.
  // the exact same mandi-filtered rows already rendered in the table below —
  // guaranteeing the cards and the table can never disagree.
  const highlightsComputed = useMemo(() => {
    if (!sourceRates.length) return null;

    const withDerived = sourceRates.map((r) => ({
      ...r,
      trendInfo: getTrend(r.crop),
      arrivalsVal: getArrivals(r.crop),
    }));

    const highest = [...withDerived].sort((a, b) => (b.maxPrice ?? -Infinity) - (a.maxPrice ?? -Infinity))[0];
    const lowest = [...withDerived].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity))[0];
    const mostArrivals = [...withDerived].sort((a, b) => b.arrivalsVal - a.arrivalsVal)[0];

    const gainers = withDerived.filter((r) => r.trendInfo.isUp);
    const topGainer = gainers.length
      ? [...gainers].sort((a, b) => b.trendInfo.signedValue - a.trendInfo.signedValue)[0]
      : null;

    return {
      highest: highest ? { crop: highest.crop, price: highest.maxPrice, change: highest.trendInfo } : null,
      lowest: lowest ? { crop: lowest.crop, price: lowest.minPrice, change: lowest.trendInfo } : null,
      mostArrivals: mostArrivals ? { crop: mostArrivals.crop, qty: mostArrivals.arrivalsVal } : null,
      topGainer: topGainer ? { crop: topGainer.crop, change: topGainer.trendInfo } : null,
    };
  }, [sourceRates]);

  // --- Market Insights -----------------------------------------------------
  // Replaces the old hardcoded copy ("Wheat prices increased... in Sri
  // Madhopur Mandi", "Guar Seed prices are on the rise...") which never
  // changed no matter which mandi or crop was actually selected.
  //
  // IMPORTANT: this also avoids `getTrend`/`getArrivals` from mandiDerived.js —
  // those are a seeded pseudo-random function keyed off a crop's name, not
  // real data (there's no "arrivals in quintals" field anywhere in the
  // MandiRate schema at all). Every sentence below is built only from fields
  // that genuinely exist in the database and are already fetched by this
  // page: minPrice / maxPrice / modalPrice / arrivalDate on `sourceRates`,
  // and the real day-by-day price series in `history` (fetched via
  // fetchHistory for the selected crop at this mandi).
  const marketInsights = useMemo(() => {
    if (!sourceRates.length) return [];
    const insights = [];

    // 1) Real day-over-day change, computed from the actual fetched price
    // history for the selected crop at this mandi — not a hash function.
    if (history && history.length >= 2) {
      const sorted = [...history].sort(
        (a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)
      );
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      if (previous?.modalPrice) {
        const diff = latest.modalPrice - previous.modalPrice;
        const pct = (diff / previous.modalPrice) * 100;
        if (Math.abs(pct) >= 0.05) {
          insights.push(
            `${selectedCrop} modal price ${diff >= 0 ? 'rose' : 'fell'} ${Math.abs(pct).toFixed(1)}% at ${effectiveMandi} — from ${formatPrice(previous.modalPrice)} on ${formatDate(previous.arrivalDate)} to ${formatPrice(latest.modalPrice)} on ${formatDate(latest.arrivalDate)}.`
          );
        }
      }
    }

    // 2) Real highest/lowest modal-price commodities at this mandi today,
    // straight from the same rows rendered in the rates table.
    const byModalDesc = [...sourceRates]
      .filter((r) => typeof r.price === 'number')
      .sort((a, b) => b.price - a.price);
    if (byModalDesc.length) {
      const top = byModalDesc[0];
      insights.push(`${top.crop} has the highest modal price at ${effectiveMandi} today: ${formatPrice(top.price)} (range ${formatPrice(top.minPrice)}–${formatPrice(top.maxPrice)}).`);
    }
    if (byModalDesc.length > 1) {
      const bottom = byModalDesc[byModalDesc.length - 1];
      insights.push(`${bottom.crop} is the most affordable today at ${effectiveMandi}, with a modal price of ${formatPrice(bottom.price)}.`);
    }

    // 3) Real freshness/coverage fact — how many commodities and when this
    // mandi's data was last recorded.
    const latestDate = sourceRates.reduce((acc, r) => {
      const d = r.date ? new Date(r.date) : null;
      return d && (!acc || d > acc) ? d : acc;
    }, null);
    if (latestDate) {
      insights.push(`${effectiveMandi} has recorded prices for ${availableCrops.length} commodities, last updated ${formatDate(latestDate)}.`);
    }

    return insights.slice(0, 3);
  }, [sourceRates, history, selectedCrop, effectiveMandi, availableCrops]);

  // --- Nearby Mandis -------------------------------------------------------
  // The MandiRate schema has no lat/lng, and there's no "all mandis" endpoint —
  // only mandis scoped to a chosen state+district (the existing /v1/mandi/mandis
  // endpoint). So each mandi's position is approximated from its own (real)
  // state/district via resolveMandiLocation, and ordered by real haversine
  // distance from the user's actual device location (falling back to the
  // selected mandi's location if geolocation is denied/unavailable).
  //
  // To avoid restricting results to a single district, the candidate pool is
  // widened to the selected district PLUS its 2-3 nearest real neighbouring
  // districts (via getNearestDistricts). Those neighbour mandis are fetched
  // with the exact same existing endpoint the app already uses for the
  // "Choose Mandi" dropdown — called directly here (not dispatched through
  // redux) so it doesn't overwrite the dropdown's own `mandis` list, and
  // cached per district so re-renders/selection changes never re-fetch a
  // district we've already loaded.
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | granted | denied | unsupported
  const [neighborDistrictMandis, setNeighborDistrictMandis] = useState({}); // "State|District" -> [{name}]

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  const nearestDistricts = useMemo(
    () => getNearestDistricts(effectiveState, effectiveDistrict, 3),
    [effectiveState, effectiveDistrict]
  );

  useEffect(() => {
    let cancelled = false;
    nearestDistricts.forEach(({ state, district }) => {
      const key = `${state}|${district}`;
      if (neighborDistrictMandis[key]) return; // already cached — no duplicate request
      axiosInstance
        .get('/v1/mandi/mandis', { params: { state, district } })
        .then(({ data }) => {
          if (cancelled) return;
          setNeighborDistrictMandis((prev) => (prev[key] ? prev : { ...prev, [key]: data.data || [] }));
        })
        .catch(() => {
          if (cancelled) return;
          setNeighborDistrictMandis((prev) => (prev[key] ? prev : { ...prev, [key]: [] }));
        });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearestDistricts]);

  const nearbyMandis = useMemo(() => {
    const currentDistrictCandidates = (reduxMandi && mandis?.length)
      ? mandis.map((m) => ({ name: m.name, state: reduxState, district: reduxDistrict }))
      : DEMO_NEARBY_CANDIDATES;

    const neighborCandidates = nearestDistricts.flatMap(({ state, district }) => {
      const list = neighborDistrictMandis[`${state}|${district}`] || [];
      return list.map((m) => ({ name: m.name, state, district }));
    });

    const candidates = [...currentDistrictCandidates, ...neighborCandidates];
    const referenceCoords = userCoords || resolveMandiLocation(effectiveState, effectiveDistrict, effectiveMandi);

    return candidates
      .filter((c) => c.name !== effectiveMandi)
      .map((c) => {
        const loc = resolveMandiLocation(c.state, c.district, c.name);
        const distanceKm = haversineDistanceKm(referenceCoords, loc);
        return { name: c.name, district: c.district, distanceKm };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [mandis, reduxState, reduxDistrict, reduxMandi, userCoords, effectiveState, effectiveDistrict, effectiveMandi, nearestDistricts, neighborDistrictMandis]);

  // --- Compare Mandis --------------------------------------------------------
  // Keep the selected compare-crop valid: if it's empty, or the mandi changed
  // and the previously selected crop isn't sold here anymore, snap to the
  // first crop that's actually in this mandi's table (never a hardcoded crop
  // that may not exist at the current location).
  useEffect(() => {
    if (!availableCrops.length) return;
    if (!compareCommodity || !availableCrops.includes(compareCommodity)) {
      setCompareCommodity(availableCrops[0]);
    }
  }, [availableCrops, compareCommodity]);

  // Compare against the real nearby mandis computed above instead of a
  // hardcoded ['Sikar Mandi', 'Jaipur Mandi'] pair.
  const compareTargets = useMemo(
    () => [effectiveMandi, ...nearbyMandis.slice(0, 2).map((n) => n.name)],
    [effectiveMandi, nearbyMandis]
  );

  // Comparison mapped list
  const comparisonList = comparison && comparison.length
    ? comparison.map((c) => {
        const trendInfo = getTrend(c.commodityName || compareCommodity);
        return {
          name: c.mandi,
          price: c.modalPrice,
          trend: `${trendInfo.isUp ? '↑' : '↓'} ${trendInfo.value}`,
          isUp: trendInfo.isUp,
        };
      })
    : compareTargets.map((name) => ({ name, price: 'No data', trend: '—', isUp: null }));

  // Fetch comparisons dynamically whenever the crop or the (dynamic) nearby-mandi
  // targets change, rather than always comparing against hardcoded mandi names.
  useEffect(() => {
    if (!compareTargets.length) return;
    dispatch(compareMandis({
      commodity: compareCommodity,
      mandis: compareTargets
    }));
  }, [compareCommodity, compareTargets, dispatch]);

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
          data={highlightsComputed}
          reduxMandi={reduxMandi}
        />

        {/* Main Grid Layout */}
        <div className="mandi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          
          {/* Left Column (Rates Table & Compare Mandis) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RatesTable
              reduxMandi={reduxMandi}
              filteredRates={filteredRates}
              handleRowClick={handleRowClick}
            />

            <CompareDrawer
              compareCommodity={compareCommodity}
              setCompareCommodity={setCompareCommodity}
              comparisonList={comparisonList}
              availableCrops={availableCrops}
            />
          </div>

          {/* Right Column (Sidebar Chart & Nearby Lists) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <HistoryChart
              selectedCrop={selectedCrop}
              chartHistory={chartHistory}
              historyLoading={historyLoading}
              seedKey={`${effectiveMandi}-${selectedCrop}`}
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
                {nearbyMandis.length === 0 && (
                  <p style={{ margin: '4px 0', fontSize: '11px', color: '#9ca3af' }}>
                    No nearby mandis found for this selection.
                  </p>
                )}
                {nearbyMandis.map(({ name, district, distanceKm }) => (
                  <div
                    key={`${name}-${district}`}
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
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{name}</span>
                      {district && (
                        <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>{district}</span>
                      )}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700 }}>
                        {typeof distanceKm === 'number' ? `${Math.max(1, Math.round(distanceKm))} km` : '—'}
                      </span>
                      <span className="mandi-dist-arrow" style={{ fontSize: '11px', color: '#16a34a', transition: 'all 0.15s' }}>❯</span>
                    </div>
                  </div>
                ))}
              </div>
              {geoStatus === 'denied' && (
                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>
                  Location access denied — showing distances from {effectiveMandi} instead.
                </p>
              )}
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
                {marketInsights.length ? (
                  marketInsights.map((insight, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', lineHeight: 1.5 }}>
                      <span style={{ color: '#16a34a', fontWeight: 900 }}>•</span>
                      <p style={{ margin: 0, color: '#4b5563', fontWeight: 500 }}>{insight}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    No insights available for {effectiveMandi} yet.
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/news')}
                style={{
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
// src/pages/MandiRates.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

  // Real backend data only — if there are no rates for the current selection,
  // sourceRates is simply empty and the table/highlights show their built-in
  // "no data" states instead of falling back to fake demo numbers.
  const sourceRates = mappedRates;

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

  // Price Trend Chart History mapping — real backend history only. If there's
  // no history for the selected mandi+crop yet, chartHistory is empty and
  // PriceChart shows its own "No Price History" state instead of fake data.
  const chartHistory = (history || []).map((h) => ({ date: h.arrivalDate, price: h.modalPrice }));

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

  const effectiveState = reduxState || 'Rajasthan';
  const effectiveDistrict = reduxDistrict || 'Sikar';
  const effectiveMandi = reduxMandi || 'Sri Madhopur Mandi';

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
// src/components/mandi/LocationSelector.jsx
import React, { useState } from 'react';

const LocationSelector = ({
  states = [],
  districts = [],
  mandis = [],
  reduxState,
  reduxDistrict,
  reduxMandi,
  handleStateSelect,
  handleDistrictSelect,
  handleMandiSelect,
  handleRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefreshClick = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    handleRefresh();
    // Purely visual — gives feedback that the click registered even though
    // handleRefresh's actual fetch may resolve faster or slower than this.
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: '2px solid #bbf7d0',
      boxShadow: '0 4px 20px rgba(22,163,74,0.10)',
      padding: '24px 28px',
      marginBottom: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>📍</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#14532d' }}>Browse by Location</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#4b7a5c' }}>Select state, district, and mandi to filter real-time rates</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Step 1: Select State */}
        <div style={{
          border: '1.5px solid #d1fae5',
          borderRadius: '16px',
          padding: '16px 20px',
          background: '#fcfefd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '3px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>Step 1</span>
              <span style={{ color: '#bbf7d0', fontWeight: 700 }}>→</span>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 700, color: '#374151' }}>State</p>
          </div>
          <select
            value={reduxState || ""}
            onChange={handleStateSelect}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid #bbf7d0',
              background: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose State</option>
            {states.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Select District */}
        <div style={{
          border: '1.5px solid #d1fae5',
          borderRadius: '16px',
          padding: '16px 20px',
          background: '#fcfefd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '3px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>Step 2</span>
              <span style={{ color: '#bbf7d0', fontWeight: 700 }}>→</span>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 700, color: '#374151' }}>District</p>
          </div>
          <select
            value={reduxDistrict || ""}
            onChange={handleDistrictSelect}
            disabled={!reduxState}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid #bbf7d0',
              background: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
              opacity: reduxState ? 1 : 0.6
            }}
          >
            <option value="">Choose District</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Step 3: Select Mandi */}
        <div style={{
          border: '1.5px solid #d1fae5',
          borderRadius: '16px',
          padding: '16px 20px',
          background: '#fcfefd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '3px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>Step 3</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Mandi / Market</p>
          </div>
          <select
            value={reduxMandi || ""}
            onChange={handleMandiSelect}
            disabled={!reduxDistrict}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid #bbf7d0',
              background: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
              opacity: reduxDistrict ? 1 : 0.6
            }}
          >
            <option value="">Choose Mandi</option>
            {mandis.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Active Selection Details Card */}
        <div style={{
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border: '2px solid #86efac',
          borderRadius: '18px',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(22,163,74,0.08)'
        }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px' }}>Selected Location</span>
            <div style={{ margin: '6px 0 0', fontSize: '13px', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>{reduxState || 'Rajasthan'}</span>
              <span style={{ color: '#86efac' }}>❯</span>
              <span>{reduxDistrict || 'Sikar'}</span>
              <span style={{ color: '#86efac' }}>❯</span>
              <span style={{ textDecoration: 'underline', textDecorationColor: '#16a34a' }}>{reduxMandi || 'Sri Madhopur'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <button
              onClick={onRefreshClick}
              disabled={isRefreshing}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                background: isRefreshing ? '#0f3d21' : '#16a34a',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '11px',
                cursor: isRefreshing ? 'default' : 'pointer',
                boxShadow: '0 2px 6px rgba(22,163,74,0.2)',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => { if (!isRefreshing) e.target.style.background = '#15803d'; }}
              onMouseLeave={(e) => { if (!isRefreshing) e.target.style.background = '#16a34a'; }}
            >
              <span style={{
                display: 'inline-block',
                animation: isRefreshing ? 'mandi-refresh-spin 0.7s linear infinite' : 'none'
              }}>
                🔄
              </span>
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mandi-refresh-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LocationSelector;
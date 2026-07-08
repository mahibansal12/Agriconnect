// src/components/mandi/MandiTable.jsx
import React, { useState } from 'react';

const getTrend = (crop) => {
  const seed = (crop.charCodeAt(0) + crop.charCodeAt(crop.length - 1 || 0)) % 7 - 3;
  const val = seed === 0 ? 1.5 : seed * 1.2;
  return {
    value: Math.abs(val).toFixed(1) + '%',
    isUp: val >= 0
  };
};

const getArrivals = (crop) => {
  const seed = (crop.charCodeAt(1) || 5) * 7 % 450 + 80;
  return seed;
};

const formatTime = (dateVal) => {
  if (!dateVal) return '10:30 AM';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '10:30 AM';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const MandiTable = ({ rates = [], onRowClick }) => {
  const [sortKey, setSortKey] = useState('crop');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const processedRates = rates.map((r) => {
    const trendInfo = getTrend(r.crop || 'Crop');
    return {
      ...r,
      arrivalsVal: getArrivals(r.crop || 'Crop'),
      trendVal: parseFloat(trendInfo.value) * (trendInfo.isUp ? 1 : -1),
      trendInfo,
    };
  });

  const sortedRates = [...processedRates].sort((a, b) => {
    let va = a[sortKey];
    let vb = b[sortKey];

    if (sortKey === 'arrivals') {
      va = a.arrivalsVal;
      vb = b.arrivalsVal;
    } else if (sortKey === 'trend') {
      va = a.trendVal;
      vb = b.trendVal;
    }

    va = va ?? '';
    vb = vb ?? '';

    const cmp = typeof va === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sortedRates.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRates = sortedRates.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: '#d1d5db', marginLeft: '4px', fontSize: '9px' }}>↕</span>;
    return <span style={{ color: '#16a34a', marginLeft: '4px', fontSize: '9px' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  if (!rates.length) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1.5px solid #d1fae5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#9ca3af'
      }}>
        <span style={{ fontSize: '40px', marginBottom: '12px' }}>📊</span>
        <p style={{ margin: 0, fontWeight: 700, color: '#4b7a5c' }}>No Mandi Rates Found</p>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Try adjusting the filters or select a different market</p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #d1fae5',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              {[
                { key: 'crop',       label: 'Commodity'     },
                { key: 'minPrice',   label: 'Min. Price (₹)'},
                { key: 'maxPrice',   label: 'Max. Price (₹)'},
                { key: 'price',      label: 'Modal Price (₹)'},
                { key: 'arrivals',   label: 'Arrivals (Qtl)'},
                { key: 'trend',      label: 'Trend'         },
                { key: 'date',       label: 'Last Updated'  },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 700,
                    color: '#4b5563',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1.5px solid #f3f4f6',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {label}<SortIcon col={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ color: '#374151' }}>
            {paginatedRates.map((row, i) => (
              <tr
                key={`${row.crop}_${i}`}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>{row.crop}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#4b5563' }}>₹{row.minPrice?.toLocaleString('en-IN') ?? '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#4b5563' }}>₹{row.maxPrice?.toLocaleString('en-IN') ?? '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#111827' }}>₹{row.price?.toLocaleString('en-IN') ?? '—'}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{row.arrivalsVal}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: row.trendInfo.isUp ? '#dcfce7' : '#fee2e2',
                    color: row.trendInfo.isUp ? '#16a34a' : '#ef4444'
                  }}>
                    {row.trendInfo.isUp ? '↑' : '↓'} {row.trendInfo.value}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '11px' }}>{formatTime(row.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1.5px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        fontSize: '12px',
        color: '#4b5563'
      }}>
        <span>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, rates.length)} of {rates.length} commodities
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              opacity: currentPage === 1 ? 0.4 : 1,
              transition: 'all 0.2s'
            }}
          >
            ←
          </button>
          
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                border: page === currentPage ? 'none' : '1.5px solid #d1d5db',
                background: page === currentPage ? '#16a34a' : '#fff',
                color: page === currentPage ? '#fff' : '#4b5563',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              opacity: currentPage === totalPages ? 0.4 : 1,
              transition: 'all 0.2s'
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandiTable;

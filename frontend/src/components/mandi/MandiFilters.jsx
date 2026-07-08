// src/components/mandi/MandiFilters.jsx
import React from 'react';

const MandiFilters = ({ search, setSearch, onToggleFilters }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '340px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#9ca3af', pointerEvents: 'none' }}>
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commodity..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px 10px 32px',
            borderRadius: '10px',
            border: '1.5px solid #d1fae5',
            background: '#fff',
            fontSize: '12px',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#16a34a'}
          onBlur={(e) => e.target.style.borderColor = '#d1fae5'}
        />
      </div>
      <button
        onClick={onToggleFilters}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1.5px solid #d1fae5',
          background: '#fff',
          color: '#374151',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#f0fdf4'}
        onMouseLeave={(e) => e.target.style.background = '#fff'}
      >
        <span>⚙️</span>
        <span>Filters</span>
      </button>
    </div>
  );
};

export default MandiFilters;

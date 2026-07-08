// src/components/mandi/RatesTable.jsx
import React from 'react';
import MandiTable from './MandiTable';
import SearchFilters from './SearchFilters';

const RatesTable = ({
  reduxMandi,
  filteredRates,
  tableSearch,
  setTableSearch,
  showFiltersPanel,
  setShowFiltersPanel,
  handleRowClick,
}) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: '2px solid #bbf7d0',
      boxShadow: '0 4px 20px rgba(22,163,74,0.10)',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 850, color: '#14532d' }}>
            Mandi Rates - {reduxMandi || 'Sri Madhopur Mandi'}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>Showing {filteredRates.length} commodities</p>
        </div>
        
        <SearchFilters
          tableSearch={tableSearch}
          setTableSearch={setTableSearch}
          showFiltersPanel={showFiltersPanel}
          setShowFiltersPanel={setShowFiltersPanel}
        />
      </div>

      {showFiltersPanel && (
        <div style={{
          padding: '14px',
          background: '#fcfefd',
          border: '1.5px solid #d1fae5',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          fontSize: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#4b7a5c', marginBottom: '6px' }}>CROP RANGE</label>
            <select style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #bbf7d0', borderRadius: '8px', background: '#fff', outline: 'none', fontWeight: 600, color: '#374151' }}>
              <option>All Prices</option>
              <option>₹0 - ₹2,000</option>
              <option>₹2,000 - ₹5,000</option>
              <option>Over ₹5,000</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#4b7a5c', marginBottom: '6px' }}>SORT OPTION</label>
            <select style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #bbf7d0', borderRadius: '8px', background: '#fff', outline: 'none', fontWeight: 600, color: '#374151' }}>
              <option>Default (Alphabetical)</option>
              <option>Price (High to Low)</option>
              <option>Price (Low to High)</option>
            </select>
          </div>
        </div>
      )}

      <MandiTable rates={filteredRates} onRowClick={handleRowClick} />
    </div>
  );
};

export default RatesTable;

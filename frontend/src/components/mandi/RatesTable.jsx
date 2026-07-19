// src/components/mandi/RatesTable.jsx
import React from 'react';
import MandiTable from './MandiTable';

const RatesTable = ({
  reduxMandi,
  filteredRates,
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
      <div>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 850, color: '#14532d' }}>
          Mandi Rates - {reduxMandi || 'Sri Madhopur Mandi'}
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>Showing {filteredRates.length} commodities</p>
      </div>

      <MandiTable rates={filteredRates} onRowClick={handleRowClick} />
    </div>
  );
};

export default RatesTable;
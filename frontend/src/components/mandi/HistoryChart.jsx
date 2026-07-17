// src/components/mandi/HistoryChart.jsx
import React from 'react';
import PriceChart from './PriceChart';

const HistoryChart = ({ selectedCrop, chartHistory, historyLoading, seedKey }) => {
  return (
    <PriceChart
      crop={selectedCrop}
      history={chartHistory}
      loading={historyLoading}
      seedKey={seedKey}
    />
  );
};

export default HistoryChart;
// src/components/mandi/HistoryChart.jsx
import React from 'react';
import PriceChart from './PriceChart';

const HistoryChart = ({ selectedCrop, chartHistory, historyLoading }) => {
  return (
    <PriceChart
      crop={selectedCrop}
      history={chartHistory}
      loading={historyLoading}
    />
  );
};

export default HistoryChart;

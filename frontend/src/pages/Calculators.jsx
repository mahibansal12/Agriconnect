// src/pages/Calculators.jsx

import { useState } from 'react';
import YieldCalculator  from '../components/calculators/YieldCalculator';
import ProfitCalculator from '../components/calculators/ProfitCalculator';

const TABS = [
  { key: 'yield',  label: '📦 Yield Estimator',   desc: 'Estimate your expected harvest'    },
  { key: 'profit', label: '💰 Profit Calculator',  desc: 'Calculate net profit and ROI'      },
];

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('yield');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Farm Calculators</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan your season with accurate yield and profit estimates
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Tab selector */}
        <div className="grid grid-cols-2 gap-3">
          {TABS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-left p-4 rounded-2xl border transition ${
                activeTab === key
                  ? 'bg-white border-green-300 shadow-md'
                  : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
              }`}
            >
              <p className={`font-semibold text-sm ${activeTab === key ? 'text-green-700' : 'text-gray-700'}`}>
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Active calculator */}
        {activeTab === 'yield'  && <YieldCalculator />}
        {activeTab === 'profit' && <ProfitCalculator />}

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
          💡 <span className="font-medium">Tip:</span> Use the Yield Estimator first, then plug those numbers into the Profit Calculator for a complete picture.
        </div>
      </div>
    </div>
  );
};

export default Calculators;

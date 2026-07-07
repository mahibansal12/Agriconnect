// src/pages/Calculators.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import YieldCalculator from '../components/calculators/YieldCalculator';
import ProfitCalculator from '../components/calculators/ProfitCalculator';

const TABS = [
  { key: 'yield', icon: '📦', label: 'Yield Estimator', desc: 'Estimate your expected harvest before the season' },
  { key: 'profit', icon: '💰', label: 'Profit Calculator', desc: 'Calculate net profit and ROI on your investment' },
];

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('yield');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)',
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '150px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(134,239,172,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '80px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(52,211,153,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px', position: 'relative', zIndex: 1 }}>
          <Link
            to="/"
            aria-label="Go to AgriConnect homepage"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              textDecoration: 'none', marginBottom: '18px',
              padding: '6px 12px 6px 6px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(134,239,172,0.3)',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(134,239,172,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(134,239,172,0.3)'; }}
          >
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg,#16A34A,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
                <path d="M12 14v6"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>AgriConnect</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(134,239,172,0.4)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', backdropFilter: 'blur(6px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>🧮</div>
          <div>
            <div style={{ color: '#86efac', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>AgriConnect • Tools</div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px' }}>Farm Calculators</h1>
            <p style={{ margin: '7px 0 0', color: '#a7f3d0', fontSize: '14px' }}>Plan your season with accurate yield and profit estimates.</p>
          </div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(134,239,172,0.12)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 48px', display: 'flex', gap: '36px' }}>
            {[{ val: '2', label: 'Calculators' }, { val: '12+', label: 'Crops Supported' }, { val: 'Free', label: 'To Use' }].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{s.val}</span>
                <span style={{ color: '#6ee7b7', fontSize: '11px', fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px 56px' }}>

        {/* Tab selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {TABS.map(({ key, icon, label, desc }) => {
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                textAlign: 'left', padding: '20px 22px', borderRadius: '18px',
                cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
                border: active ? '2.5px solid #16a34a' : '2px solid #d1fae5',
                background: active ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#fff',
                boxShadow: active ? '0 6px 24px rgba(22,163,74,0.18)' : '0 2px 8px rgba(0,0,0,0.05)',
                transform: active ? 'translateY(-2px)' : 'scale(1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#16a34a,#86efac)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: active ? '#16a34a' : '#f0fdf4', border: `1.5px solid ${active ? '#16a34a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, boxShadow: active ? '0 3px 10px rgba(22,163,74,0.3)' : 'none', transition: 'all 0.2s' }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: active ? '#14532d' : '#374151' }}>{label}</p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: active ? '#4b7a5c' : '#9ca3af' }}>{desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Calculator */}
        <div style={{ marginBottom: '24px' }}>
          {activeTab === 'yield' && <YieldCalculator />}
          {activeTab === 'profit' && <ProfitCalculator />}
        </div>

        {/* Tip */}
        <div style={{ background: '#fff', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '16px 22px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 3px 12px rgba(22,163,74,0.08)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', border: '1.5px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💡</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#14532d', fontSize: '13px' }}>Pro Tip</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4b7a5c', lineHeight: 1.6 }}>
              Use the <strong>Yield Estimator</strong> first to get your expected harvest, then plug those numbers into the <strong>Profit Calculator</strong> for a complete picture of your season's finances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculators;
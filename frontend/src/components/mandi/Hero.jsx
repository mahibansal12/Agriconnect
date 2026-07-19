// src/components/mandi/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <div style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-50px', right: '150px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(134,239,172,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30px', left: '80px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(52,211,153,0.06)', pointerEvents: 'none' }} />
      
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 48px 18px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(134,239,172,0.4)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', backdropFilter: 'blur(6px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', flexShrink: 0 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#86efac', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>AgriConnect • Mandi</div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px' }}>Real-Time Mandi Prices</h1>
            <p style={{ margin: '7px 0 0', color: '#a7f3d0', fontSize: '14px', lineHeight: '1.5' }}>Stay updated with daily crop market prices and insights across India.</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(134,239,172,0.12)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '8px 48px', display: 'flex', gap: '36px' }}>
          {[{ val: '28', label: 'States Covered' }, { val: '740+', label: 'Active Mandis' }, { val: '160+', label: 'Crops' }].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{s.val}</span>
              <span style={{ color: '#6ee7b7', fontSize: '11px', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
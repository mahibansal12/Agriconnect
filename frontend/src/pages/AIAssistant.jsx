import { Link } from 'react-router-dom';
import ChatInterface from '../components/ai-assistant/ChatInterface';

export default function AIAssistant() {
  return (
    <div className="aia-page">
      {/* ── Header ── */}
      <header className="aia-header">
        <div className="aia-header-inner">
          <div className="aia-header-left">
            <Link to="/" className="aia-brand" aria-label="Go to AgriConnect homepage">
              <div className="aia-brand-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
                  <path d="M12 14v6"/>
                </svg>
              </div>
              <div>
                <div className="aia-brand-name">AgriConnect</div>
                <div className="aia-brand-sub">SMART FARMING PLATFORM</div>
              </div>
            </Link>

            <span className="aia-header-divider" aria-hidden="true" />

            <div className="aia-header-icon">🤖</div>
            <div>
              <h1 className="aia-title">KRISHI AI</h1>
              <p className="aia-subtitle">Smart Agricultural Agent</p>
            </div>
          </div>

          <div className="aia-header-right">
            <div className="aia-status">
              <span className="aia-status-dot" />
              Online
            </div>
          </div>
        </div>
      </header>

      {/* ── Full-page farm-scene background ── */}
      <div className="aia-bg-scene" aria-hidden="true" />
      <div className="aia-bg-overlay" aria-hidden="true" />

      {/* ── Chat area ── */}
      <div className="aia-body">
        <div className="aia-body-inner">
          <ChatInterface />
        </div>
      </div>

      <style>{`
        .aia-page {
          height: 100vh;
          display: flex; flex-direction: column;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
          background: #FAFAFA;
        }

        /* Header */
        .aia-header {
          flex-shrink: 0; position: relative; z-index: 2;
          background: linear-gradient(100deg, #14532D 0%, #15803D 32%, #4D7C0F 60%, #CA8A04 100%);
          border-bottom: 2px solid #A16207;
          box-shadow: 0 4px 22px rgba(21,128,61,0.25);
        }
        .aia-header::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 12% -20%, rgba(253,224,71,0.25) 0%, transparent 55%);
        }
        .aia-header-inner {
          max-width: 1300px; margin: 0 auto;
          padding: 14px 40px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          position: relative; z-index: 1;
        }
        .aia-header-left { display: flex; align-items: center; gap: 14px; }

        .aia-brand {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
          transition: opacity 0.15s ease;
        }
        .aia-brand:hover { opacity: 0.85; }
        .aia-brand-box {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #FDE047, #CA8A04);
          border: 1.5px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
        }
        .aia-brand-name { font-size: 14.5px; font-weight: 700; color: #FFFFFF; line-height: 1.1; }
        .aia-brand-sub { font-size: 9px; color: #FEF9C3; letter-spacing: 0.06em; }

        .aia-header-divider {
          width: 1px; align-self: stretch; margin: 2px 0;
          background: rgba(255,255,255,0.3);
        }
        .aia-header-icon {
          width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg,#FDE047,#CA8A04);
          border: 1.5px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
        .aia-title { margin: 0; font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em; }
        .aia-subtitle { margin: 2px 0 0; font-size: 12.5px; color: #FEF9C3; }

        .aia-header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .aia-status {
          display: flex; align-items: center; gap: 7px;
          font-size: 12.5px; font-weight: 700; color: #FFFFFF;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 999px; padding: 6px 14px;
        }
        .aia-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #BBF451;
          box-shadow: 0 0 0 3px rgba(187,244,81,0.3);
          animation: aia-glow 2s ease-in-out infinite;
        }

        /* Body */
        .aia-body { flex: 1; overflow: hidden; position: relative; z-index: 1; }
        .aia-body-inner { position: relative; z-index: 1; height: 100%; }

        /* Full-page original farm-scene illustration (tractor + fields), fixed behind everything */
        .aia-bg-scene {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-color: #EDECDF;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 500'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23EFEEE2'/%3E%3Cstop offset='1' stop-color='%23DAD9C7'/%3E%3C/linearGradient%3E%3ClinearGradient id='ground' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23C99A5B'/%3E%3Cstop offset='1' stop-color='%23A87B42'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='500' fill='url(%23sky)'/%3E%3Ccircle cx='690' cy='120' r='46' fill='%23F3EFE0'/%3E%3Cellipse cx='560' cy='95' rx='34' ry='9' fill='%23FFFFFF' opacity='0.7'/%3E%3Cellipse cx='790' cy='150' rx='40' ry='10' fill='%23FFFFFF' opacity='0.6'/%3E%3Cpath d='M0 300c120-40 220-40 340-10s260 30 380 0 180-30 180-30v40H0Z' fill='%23B7BBA0'/%3E%3Cpath d='M0 330c150-30 260-25 400 5s260 15 500-15v45H0Z' fill='%23A3AA8C' opacity='0.85'/%3E%3Crect x='0' y='355' width='900' height='145' fill='url(%23ground)'/%3E%3Cellipse cx='120' cy='430' rx='60' ry='10' fill='%238C6631' opacity='0.5'/%3E%3Cellipse cx='330' cy='460' rx='70' ry='11' fill='%238C6631' opacity='0.5'/%3E%3Cellipse cx='650' cy='445' rx='65' ry='10' fill='%238C6631' opacity='0.4'/%3E%3Cg%3E%3Crect x='760' y='300' width='70' height='55' rx='3' fill='%23E7C873'/%3E%3Cpolygon points='755,300 795,265 835,300' fill='%236B4A2A'/%3E%3Crect x='785' y='325' width='16' height='30' fill='%23895C33'/%3E%3C/g%3E%3Cg%3E%3Ccircle cx='840' cy='355' r='22' fill='%237C8A5A'/%3E%3Crect x='836' y='355' width='8' height='24' fill='%236B5738'/%3E%3Ccircle cx='815' cy='365' r='17' fill='%23879566'/%3E%3Crect x='812' y='365' width='6' height='20' fill='%236B5738'/%3E%3C/g%3E%3Cg%3E%3Crect x='55' y='250' width='16' height='55' rx='3' fill='%232B2320'/%3E%3Crect x='45' y='245' width='30' height='10' rx='2' fill='%232B2320'/%3E%3Crect x='70' y='285' width='150' height='75' rx='10' fill='%23D9702B'/%3E%3Crect x='150' y='260' width='95' height='55' rx='8' fill='%23C4602A'/%3E%3Crect x='158' y='268' width='55' height='30' rx='4' fill='%23F4E6C8' opacity='0.85'/%3E%3Ccircle cx='115' cy='385' r='42' fill='%23231C19'/%3E%3Ccircle cx='115' cy='385' r='16' fill='%23D9702B'/%3E%3Ccircle cx='225' cy='385' r='30' fill='%23231C19'/%3E%3Ccircle cx='225' cy='385' r='11' fill='%23D9702B'/%3E%3Crect x='240' y='300' width='14' height='14' rx='2' fill='%23FCEBC8'/%3E%3C/g%3E%3Cg%3E%3Crect x='120' y='215' width='34' height='45' rx='6' fill='%23FFFFFF'/%3E%3Ccircle cx='137' cy='205' r='15' fill='%23E7B27C'/%3E%3Cpath d='M122 200c4-10 26-10 30 0 3 7-2 10-15 10s-18-3-15-10Z' fill='%23FBFBFB'/%3E%3Cpath d='M120 235c-8 4-12 12-10 20l16-4Z' fill='%23FFFFFF'/%3E%3C/g%3E%3Cg%3E%3Cpath d='M330 335c10-18 26-18 34 0l-6 22h-24Z' fill='%23E2B450'/%3E%3Ccircle cx='347' cy='320' r='13' fill='%23E7B27C'/%3E%3Cpath d='M336 314c3-7 20-7 22 1-9 4-16 4-22-1Z' fill='%232B2320'/%3E%3Cpath d='M310 375c8-16 20-26 34-30l6 10c-12 8-20 16-26 28Z' fill='%23E2B450'/%3E%3C/g%3E%3Crect x='330' y='385' width='2' height='14' fill='%235B7A3F' opacity='0.6'/%3E%3Crect x='345' y='388' width='2' height='11' fill='%235B7A3F' opacity='0.6'/%3E%3Crect x='360' y='384' width='2' height='15' fill='%235B7A3F' opacity='0.6'/%3E%3Crect x='375' y='389' width='2' height='10' fill='%235B7A3F' opacity='0.6'/%3E%3Crect x='390' y='385' width='2' height='14' fill='%235B7A3F' opacity='0.6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: cover;
          background-position: bottom center;
          opacity: 0.55;
        }
        /* Soft readability wash over the scene so header/cards stay legible */
        .aia-bg-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.55) 32%, rgba(250,250,250,0.35) 60%, rgba(250,250,250,0.55) 100%);
        }

        @keyframes aia-glow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.1); }
        }

        @media (max-width: 760px) {
          .aia-header-inner { padding: 12px 16px; }
          .aia-title { font-size: 16px; }
          .aia-brand-sub { display: none; }
          .aia-header-divider { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .aia-status-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
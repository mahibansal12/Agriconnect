import ChatInterface from '../components/ai-assistant/ChatInterface';

export default function AIAssistant() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        background: 'linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)',
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden', zIndex: 10,
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(134,239,172,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '180px', bottom: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52,211,153,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '46px', height: '46px',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(134,239,172,0.45)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', backdropFilter: 'blur(6px)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
          }}>🤖</div>
          <div>
            <div style={{ color: '#86efac', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>AgriConnect • AI</div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '17px', fontWeight: 800, lineHeight: 1.2 }}>AI Farming Assistant</h1>
          </div>
        </div>

        {/* Right: status + model tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(134,239,172,0.25)',
            borderRadius: '999px', padding: '5px 14px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: 600 }}>Powered by</span>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 800 }}>Gemini AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80, 0 0 16px #4ade8066' }} />
            <span style={{ color: '#a7f3d0', fontSize: '12px', fontWeight: 600 }}>Online</span>
          </div>
        </div>
      </div>

      {/* ── Chat area with background ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Background — dark agri-tech gradient with overlaid pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(160deg, #0a1f0e 0%, #0f2d14 30%, #0d2410 60%, #071a0a 100%)',
        }} />

        {/* Hex grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpath d='M15 0 L45 0 L60 26 L45 52 L15 52 L0 26 Z' fill='none' stroke='rgba(134,239,172,0.06)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 52px',
        }} />

        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Thin horizontal scan-line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(134,239,172,0.3) 50%, transparent 100%)',
          zIndex: 3, pointerEvents: 'none',
        }} />

        {/* Chat content on top */}
        <div style={{ position: 'relative', zIndex: 4, height: '100%' }}>
          <ChatInterface compact darkMode />
        </div>
      </div>
    </div>
  );
}

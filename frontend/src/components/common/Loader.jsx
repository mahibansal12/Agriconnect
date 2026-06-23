// src/components/common/Loader.jsx
// Usage:
//   <Loader />                  → fullscreen spinner (page loading)
//   <Loader size="sm" />        → small inline spinner
//   <Loader size="md" />        → medium spinner
//   <Loader inline text="Loading crops..." />  → inline with text

export default function Loader({
  size    = "lg",     // "sm" | "md" | "lg"
  inline  = false,    // true = inline, false = fullscreen overlay
  text    = "",       // optional loading text
}) {
  const sizes = { sm: 16, md: 28, lg: 44 };
  const px    = sizes[size] || 44;
  const bw    = size === "sm" ? 2 : size === "md" ? 2.5 : 3;

  const spinner = (
    <div
      className="ld-spin"
      style={{ width: px, height: px, borderWidth: bw }}
      role="status"
      aria-label="Loading"
    />
  );

  if (inline) {
    return (
      <div className="ld-inline">
        {spinner}
        {text && <span className="ld-text">{text}</span>}
        <style>{`
          .ld-inline { display: flex; align-items: center; gap: 10px; padding: 16px 0; }
          .ld-spin {
            border: 2.5px solid #E0EAD8;
            border-top-color: #1B5E20;
            border-radius: 50%;
            animation: ld-r 0.7s linear infinite;
            flex-shrink: 0;
          }
          .ld-text  { font-size: 13px; color: #7A8F76; }
          @keyframes ld-r { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ld-full" role="status" aria-label="Loading page">
      <div className="ld-box">
        <div className="ld-logo-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
            <path d="M12 14v6"/>
          </svg>
        </div>
        <div className="ld-spin ld-spin--lg"/>
        {text && <p className="ld-full-text">{text}</p>}
      </div>

      <style>{`
        .ld-full {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(248,251,246,0.9);
          display: flex; align-items: center; justify-content: center;
        }
        .ld-box {
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .ld-logo-box {
          width: 52px; height: 52px; background: #1B5E20;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .ld-spin {
          border: 3px solid #E0EAD8;
          border-top-color: #1B5E20;
          border-radius: 50%;
          animation: ld-r 0.7s linear infinite;
        }
        .ld-spin--lg { width: 44px; height: 44px; }
        .ld-full-text { font-size: 13px; color: #7A8F76; margin: 0; }
        @keyframes ld-r { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

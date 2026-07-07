// src/components/common/FloatingAIAssistant.jsx
import { useNavigate, useLocation } from "react-router-dom";

// Routes where the floating launcher should stay out of the way
// (it would collide with in-page chat UIs or auth forms).
const HIDDEN_ON = ["/ai-assistant", "/login", "/register"];

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_ON.includes(location.pathname)) return null;

  return (
    <>
      <button
        type="button"
        className="faa-fab"
        onClick={() => navigate("/ai-assistant")}
        aria-label="Open Krishi AI Assistant"
      >
        <span className="faa-fab-ring" aria-hidden="true" />

        <span className="faa-fab-icon" aria-hidden="true">
          {/* Full 3D-style turbaned-farmer portrait */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="faa-face-shade" x1="14" y1="16" x2="50" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FBD9A8" />
                <stop offset="1" stopColor="#EEB57D" />
              </linearGradient>
              <linearGradient id="faa-turban-shade" x1="8" y1="4" x2="56" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F2A33E" />
                <stop offset="1" stopColor="#D9791C" />
              </linearGradient>
              <linearGradient id="faa-shawl-shade" x1="18" y1="46" x2="46" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#9A3412" />
                <stop offset="1" stopColor="#7C2D12" />
              </linearGradient>
            </defs>

            {/* shirt / shoulders */}
            <path d="M10 64c1-9 8.5-13.5 22-13.5S53 55 54 64H10Z" fill="#FFF7ED" />
            {/* shawl diagonal */}
            <path d="M22 51c2 4 3 8.5 2.5 13H31c-.5-6-2.5-11-5-14.5-1.4.5-2.7 1-4 1.5Z" fill="url(#faa-shawl-shade)" />

            {/* neck */}
            <rect x="26" y="42" width="12" height="10" rx="4" fill="#EEB57D" />

            {/* ears */}
            <circle cx="14.5" cy="34" r="3" fill="#F0B87C" />
            <circle cx="49.5" cy="34" r="3" fill="#F0B87C" />
            <circle cx="49.7" cy="36.5" r="1.1" fill="#E8B84A" />

            {/* face */}
            <circle cx="32" cy="33" r="18.5" fill="url(#faa-face-shade)" />

            {/* turban */}
            <path
              d="M10 31C10 15 19 5 32 5s22 10 22 26c0 2.4-1.3 4-3.4 4.2-1.7-2-4.2-.9-4-1.5-2-1.7-4.3 0-4.2 2.3-1.9-1.8-4.5-.9-4.4 1.5-2-1.6-4.6-1.6-6.6 0 0-2.4-2.5-2.4-4.4-1.5-.1-2.4-2.7-1.5-4.3.1.2-2.4-2.3-3.5-4.2-2.3-2.1-.2-3.4-1.8-3.4-4.2Z"
              fill="url(#faa-turban-shade)"
            />
            <path
              d="M10 31C10 15 19 5 32 5s22 10 22 26"
              stroke="#B8571A"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
            <path d="M47 21.5c3.2 1 5.4 3.8 4.9 7.4-.4 3-2.8 4.6-4.7 3.8 1.4-3.5 1-8-.2-11.2Z" fill="#C9691E" />
            {/* turban knot / tail */}
            <path d="M46 32c3 1.5 4.6 4.3 3.8 7.5-.6 2.3-2.6 3.3-4.2 2.6 1.5-3.2 1.3-6.8.4-10.1Z" fill="#E8871E" />

            {/* eyebrows */}
            <path d="M23 29.5c1.8-1.1 4-1.1 5.6.1" stroke="#4A2E17" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M35.4 29.6c1.6-1.2 3.8-1.2 5.6-.1" stroke="#4A2E17" strokeWidth="1.4" strokeLinecap="round" fill="none" />

            {/* eyes */}
            <circle cx="25.8" cy="33.5" r="1.9" fill="#4A2E17" />
            <circle cx="38.2" cy="33.5" r="1.9" fill="#4A2E17" />
            <circle cx="26.3" cy="32.9" r="0.6" fill="#fff" />
            <circle cx="38.7" cy="32.9" r="0.6" fill="#fff" />

            {/* cheeks */}
            <circle cx="21.5" cy="38" r="2.4" fill="#F2A277" opacity="0.55" />
            <circle cx="42.5" cy="38" r="2.4" fill="#F2A277" opacity="0.55" />

            {/* moustache */}
            <path
              d="M20.5 39.5c2.4-2 5.7-2.6 10-2.6s7.6.6 10 2.6c-1.1 2-3.3 2.5-5.5 1.2-1.6-1-3-1.1-4.5-1.1s-2.9.1-4.5 1.1c-2.2 1.3-4.4.8-5.5-1.2Z"
              fill="#3A2A1E"
            />

            {/* shirt collar buttons */}
            <path d="M28 52.5v9M36 52.5v9" stroke="#EAD6BF" strokeWidth="1" opacity="0.7" />
            <circle cx="32" cy="55" r="0.9" fill="#D9791C" />
            <circle cx="32" cy="59.5" r="0.9" fill="#D9791C" />
          </svg>
        </span>

        <span className="faa-fab-label">KRISHI AI</span>
      </button>

      <style>{`
        .faa-fab {
          position: fixed;
          right: clamp(14px, 3.5vw, 28px);
          bottom: clamp(14px, 3.5vw, 28px);
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          padding: 8px 20px 8px 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, #9A3412, #6B1D1D);
          box-shadow: 0 14px 34px rgba(107, 29, 29, 0.4), 0 4px 10px rgba(0,0,0,0.16);
          animation: faa-float 3.4s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .faa-fab:hover,
        .faa-fab:focus-visible {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 20px 42px rgba(107, 29, 29, 0.48), 0 6px 14px rgba(0,0,0,0.18);
        }
        .faa-fab:active { transform: translateY(-1px) scale(0.99); }

        .faa-fab-icon {
          position: relative;
          width: 68px;
          height: 68px;
          min-width: 68px;
          border-radius: 50%;
          background: #FFF3E0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: inset 0 0 0 2.5px rgba(154, 52, 18, 0.3);
        }
        .faa-fab-icon svg { width: 62px; height: 62px; }

        .faa-fab-ring {
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          border: 2px solid rgba(232, 135, 30, 0.55);
          animation: faa-pulse 2.6s ease-out infinite;
        }
        .faa-fab-label {
          font-family: inherit;
          font-size: 16px;
          font-weight: 700;
          color: #FFF3E0;
          white-space: nowrap;
          letter-spacing: 0.05em;
        }

        @keyframes faa-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes faa-pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { opacity: 0; }
        }

        /* Slightly smaller on narrow phones so it doesn't crowd the screen */
        @media (max-width: 480px) {
          .faa-fab { padding: 6px 16px 6px 6px; gap: 9px; }
          .faa-fab-icon { width: 52px; height: 52px; min-width: 52px; }
          .faa-fab-icon svg { width: 46px; height: 46px; }
          .faa-fab-label { font-size: 13px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .faa-fab, .faa-fab-ring { animation: none; }
        }
      `}</style>
    </>
  );
}
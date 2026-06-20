const roles = [
  {
    id: "farmer",
    label: "Farmer",
    desc: "Sell crops & get advice",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C14 4 7 9 7 16a7 7 0 0 0 14 0c0-7-7-12-7-12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 16v8M10 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "buyer",
    label: "Buyer",
    desc: "Purchase crops directly",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 7h2l3 10h12l2-7H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="22" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="22" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Admin",
    desc: "Manage the platform",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 6l1.5 1.5L24 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="role-selector">
      <p className="role-label">I am a</p>
      <div className="role-grid">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`role-btn ${value === role.id ? "role-btn--active" : ""}`}
          >
            <span className="role-icon">{role.icon}</span>
            <span className="role-name">{role.label}</span>
            <span className="role-desc">{role.desc}</span>
          </button>
        ))}
      </div>

      <style>{`
        .role-selector { margin-bottom: 20px; }

        .role-label {
          font-size: 13px;
          font-weight: 500;
          color: #6B7C5E;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 10px;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border-radius: 12px;
          border: 1.5px solid #D8E4CC;
          background: #F7FAF4;
          cursor: pointer;
          transition: all 0.18s ease;
          color: #5A6B4E;
        }

        .role-btn:hover {
          border-color: #3D7A2B;
          background: #EEF6E8;
          color: #2D5C1E;
        }

        .role-btn--active {
          border-color: #3D7A2B;
          background: #3D7A2B;
          color: #fff;
          box-shadow: 0 4px 14px rgba(61,122,43,0.25);
        }

        .role-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-name {
          font-size: 13px;
          font-weight: 600;
        }

        .role-desc {
          font-size: 11px;
          opacity: 0.75;
          text-align: center;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}

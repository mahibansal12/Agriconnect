// src/components/recommendations/CropRecommendForm.jsx

const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clay'];
const SEASONS = ['Kharif (Jun-Oct)', 'Rabi (Nov-Mar)', 'Zaid (Mar-Jun)'];
const STATES = [
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Bihar', 'Uttarakhand', 'Gujarat', 'Andhra Pradesh',
  'Tamil Nadu', 'Karnataka', 'West Bengal',
];

const CropRecommendForm = ({ onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      soilType: fd.get('soilType'),
      season: fd.get('season'),
      state: fd.get('state'),
      rainfall: fd.get('rainfall'),
      temperature: fd.get('temperature'),
      ph: fd.get('ph'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="crop-advisor-form">
      <div className="caf-head">
        <div className="caf-icon">🌱</div>
        <div>
          <div className="caf-kicker">Field input</div>
          <h2>Crop Recommendation</h2>
          <p>Enter field conditions to generate a practical crop shortlist.</p>
        </div>
      </div>

      <div className="caf-grid">
        <Field label="Soil Type" required>
          <select name="soilType" required defaultValue="">
            <option value="" disabled>Select soil type</option>
            {SOIL_TYPES.map((soil) => <option key={soil} value={soil}>{soil}</option>)}
          </select>
        </Field>

        <Field label="Season" required>
          <select name="season" required defaultValue="">
            <option value="" disabled>Select season</option>
            {SEASONS.map((season) => <option key={season} value={season}>{season}</option>)}
          </select>
        </Field>

        <Field label="State" required>
          <select name="state" required defaultValue="">
            <option value="" disabled>Select state</option>
            {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </Field>

        <Field label="Annual Rainfall" suffix="mm">
          <input name="rainfall" type="number" placeholder="800" min="0" />
        </Field>

        <Field label="Avg Temperature" suffix="C">
          <input name="temperature" type="number" placeholder="25" min="0" max="55" />
        </Field>

        <Field label="Soil pH">
          <input name="ph" type="number" placeholder="6.5" min="0" max="14" step="0.1" />
        </Field>
      </div>

      <div className="caf-footer">
        <div className="caf-note">
          <strong>Tip</strong>
          <span>Complete soil, season and state for better ranking.</span>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Finding crops...' : 'Get Recommendations'}
        </button>
      </div>

      <style>{`
        .crop-advisor-form {
          background: rgba(255,255,255,0.94);
          border: 1px solid #D8E8C8;
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(45,92,30,0.08);
          padding: 22px;
        }
        .caf-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid #E0EAD8;
        }
        .caf-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #DCFCE7, #E0F2FE);
          border: 1px solid #BBF7D0;
          font-size: 24px;
          flex-shrink: 0;
        }
        .caf-kicker {
          color: #B45309;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .caf-head h2 {
          margin: 3px 0 2px;
          color: #0A2E0C;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 900;
        }
        .caf-head p {
          margin: 0;
          color: #4B7A5C;
          font-size: 14px;
        }
        .caf-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .caf-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .caf-label {
          color: #166534;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .caf-label em {
          color: #EF4444;
          font-style: normal;
        }
        .caf-control {
          position: relative;
        }
        .caf-control select,
        .caf-control input {
          width: 100%;
          height: 46px;
          border: 1px solid #D8E8C8;
          border-radius: 10px;
          background: #F8FBF6;
          color: #0A2E0C;
          padding: 0 13px;
          font-size: 14px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .caf-control input::placeholder {
          color: #8FA87E;
          font-weight: 600;
        }
        .caf-control select:focus,
        .caf-control input:focus {
          border-color: #16A34A;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.12);
        }
        .caf-suffix {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #7A8F76;
          font-size: 12px;
          font-weight: 900;
          pointer-events: none;
        }
        .caf-suffix + input,
        .caf-control:has(.caf-suffix) input {
          padding-right: 44px;
        }
        .caf-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #E0EAD8;
        }
        .caf-note {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: #4B7A5C;
          font-size: 13px;
        }
        .caf-note strong {
          color: #0A2E0C;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .caf-footer button {
          min-height: 46px;
          min-width: 210px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #16A34A, #0EA5E9);
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(22,163,74,0.18);
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .caf-footer button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }
        .caf-footer button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        @media (max-width: 720px) {
          .caf-grid { grid-template-columns: 1fr; }
          .caf-footer { align-items: stretch; flex-direction: column; }
          .caf-footer button { width: 100%; min-width: 0; }
        }
      `}</style>
    </form>
  );
};

function Field({ label, required = false, suffix, children }) {
  return (
    <label className="caf-field">
      <span className="caf-label">{label} {required && <em>*</em>}</span>
      <span className="caf-control">
        {children}
        {suffix && <span className="caf-suffix">{suffix}</span>}
      </span>
    </label>
  );
}

export default CropRecommendForm;

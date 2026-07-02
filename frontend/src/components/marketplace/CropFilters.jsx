// src/components/marketplace/CropFilters.jsx

const CROP_TYPES = ['All', 'Grain', 'Vegetable', 'Fruit', 'Spice', 'Oilseed'];

const STATES = [
  'All',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Bihar',
  'Uttarakhand',
  'Gujarat',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Karnataka',
  'West Bengal',
];

const CropFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({ type: 'All', minPrice: '', maxPrice: '', state: 'All', district: '' });
  };

  const hasActiveFilters =
    filters.type !== 'All' ||
    filters.state !== 'All' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.district !== '';

  return (
    <section className="mf">
      <div className="mf-head">
        <div>
          <h3>Find Crops Faster</h3>
          <p>Use filters to narrow fresh marketplace listings</p>
        </div>

        {hasActiveFilters && (
          <button type="button" onClick={handleReset} className="mf-reset">
            Reset filters
          </button>
        )}
      </div>

      <div className="mf-grid">
        <label className="mf-field">
          <span>Crop Type</span>
          <select value={filters.type} onChange={(e) => handleChange('type', e.target.value)}>
            {CROP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="mf-field">
          <span>Min Price (Rs)</span>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
        </label>

        <label className="mf-field">
          <span>Max Price (Rs)</span>
          <input
            type="number"
            placeholder="99999"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </label>

        <label className="mf-field">
          <span>State</span>
          <select value={filters.state} onChange={(e) => handleChange('state', e.target.value)}>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label className="mf-field">
          <span>District</span>
          <input
            type="text"
            placeholder="e.g. Haridwar"
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />
        </label>
      </div>

      <style>{`
        .mf {
          width: 100%;
          border: 1px solid #D8E8C8;
          border-radius: 14px;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 18px 40px rgba(45,92,30,0.08);
          padding: 20px;
        }

        .mf-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .mf-head h3 {
          margin: 0;
          color: #0A2E0C;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
        }

        .mf-head p {
          margin: 5px 0 0;
          color: #4B7A5C;
          font-size: 13px;
        }

        .mf-reset {
          min-height: 36px;
          padding: 0 14px;
          border: 1px solid #FECACA;
          border-radius: 999px;
          background: #FEF2F2;
          color: #B91C1C;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .mf-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr 0.9fr 1.4fr 1.2fr;
          gap: 14px;
        }

        .mf-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .mf-field span {
          color: #166534;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .mf-field select,
        .mf-field input {
          width: 100%;
          height: 44px;
          border: 1px solid #D8E8C8;
          border-radius: 10px;
          background: #F8FBF6;
          color: #0A2E0C;
          padding: 0 12px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .mf-field:nth-child(2) input,
        .mf-field:nth-child(3) input {
          background: #FFFBEB;
          border-color: #FDE68A;
        }

        .mf-field:nth-child(4) select {
          background: #F0F9FF;
          border-color: #BAE6FD;
        }

        .mf-field:nth-child(5) input {
          background: #FFF1F2;
          border-color: #FECDD3;
        }

        .mf-field select:focus,
        .mf-field input:focus {
          border-color: #16A34A;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.12);
        }

        @media (max-width: 980px) {
          .mf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 560px) {
          .mf { padding: 16px; }
          .mf-head { align-items: flex-start; flex-direction: column; }
          .mf-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};

export default CropFilters;

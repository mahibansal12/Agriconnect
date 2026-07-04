import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addCrop,
  updateCrop,
  fetchCropById,
  clearCropMessages,
  clearSelectedCrop,
} from '../../redux/slices/cropSlice';
import CropImageUpload from '../../components/marketplace/CropImageUpload';

const CROP_TYPES = ['Grain', 'Vegetable', 'Fruit', 'Spice', 'Oilseed'];
const UNITS = ['quintal', 'kg', 'ton'];

const STATES = [
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

const INITIAL_FORM = {
  name: '',
  type: '',
  price: '',
  quantity: '',
  unit: 'quintal',
  state: '',
  district: '',
  description: '',
};

// ─── Small inline icons — same convention as FarmerDashboard.jsx's
//     `Icon` object, no external icon library ──────────────────────
const Icon = {
  back: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 12H5" /><path d="M12 19 5 12l7-7" />
    </svg>
  ),
  upload: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  ),
  alert: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  ),
};

const AddListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // present only on /marketplace/edit/:id
  const isEditMode = Boolean(id);

  const { loading, error, successMessage, selectedCrop } = useSelector((state) => state.crops);

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [formError, setFormError] = useState('');
  const [prefilled, setPrefilled] = useState(!isEditMode); // guards against re-filling on every re-render

  // ── Edit mode: fetch the existing listing, then prefill the form ──
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchCropById(id));
    }
    return () => {
      dispatch(clearSelectedCrop());
      dispatch(clearCropMessages());
    };
  }, [isEditMode, id, dispatch]);

  useEffect(() => {
    if (isEditMode && !prefilled && selectedCrop && selectedCrop._id === id) {
      setForm({
        name: selectedCrop.name || '',
        type: selectedCrop.type || '',
        price: selectedCrop.price ?? '',
        quantity: selectedCrop.quantity ?? '',
        unit: selectedCrop.unit || 'quintal',
        state: selectedCrop.state || '',
        district: selectedCrop.district || '',
        description: selectedCrop.description || '',
      });
      setImages(Array.isArray(selectedCrop.images) ? selectedCrop.images : []);
      setPrefilled(true);
    }
  }, [isEditMode, prefilled, selectedCrop, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(''); // clear error on typing
  };

  const validate = () => {
    const { name, type, price, quantity, state, district } = form;
    if (!name.trim())     return 'Crop name is required.';
    if (!type)            return 'Please select a crop type.';
    if (!price)           return 'Price is required.';
    if (Number(price) <= 0) return 'Price must be greater than 0.';
    if (!quantity)        return 'Quantity is required.';
    if (Number(quantity) <= 0) return 'Quantity must be greater than 0.';
    if (!state)           return 'Please select a state.';
    if (!district.trim()) return 'District is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setFormError(err);
    setFormError('');

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });
    // Only File objects are new uploads — pre-existing images arrive as URL
    // strings (see CropImageUpload) and are left untouched server-side when
    // no new files are appended, matching the backend's replace-on-upload behavior.
    images.filter((img) => img instanceof File).forEach((img) => formData.append('images', img));

    if (isEditMode) {
      const result = await dispatch(updateCrop({ id, formData }));
      if (updateCrop.fulfilled.match(result)) {
        setTimeout(() => {
          dispatch(clearCropMessages());
          navigate('/dashboard/farmer');
        }, 1500);
      }
    } else {
      const result = await dispatch(addCrop(formData));
      if (addCrop.fulfilled.match(result)) {
        setTimeout(() => {
          dispatch(clearCropMessages());
          navigate('/marketplace');
        }, 1500);
      }
    }
  };

  return (
    <div className="al-page">
      <div className="al-wrap">
        {/* ── Header ── */}
        <div className="al-header">
          <button onClick={() => navigate(-1)} className="al-back">
            <Icon.back width={16} height={16} />
            Back
          </button>
          <h1 className="al-title">{isEditMode ? 'Update Your Crop Listing' : 'List Your Crop'}</h1>
          <p className="al-subtitle">
            {isEditMode
              ? 'Edit the details below and save to update your listing.'
              : 'Fill in the details below to publish your crop to the marketplace.'}
          </p>
        </div>

        {/* ── Glass Card ── */}
        {isEditMode && !prefilled ? (
          <div className="al-card al-loading">Loading listing details…</div>
        ) : (
        <form onSubmit={handleSubmit} className="al-card">
          {/* Row 1: Crop Name + Crop Type */}
          <div className="al-row">
            <div className="al-field">
              <label className="al-label">Crop Name <span className="al-req">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Basmati Rice"
                className="al-input"
              />
            </div>
            <div className="al-field">
              <label className="al-label">Crop Type <span className="al-req">*</span></label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="al-input al-select"
              >
                <option value="">Select crop type</option>
                {CROP_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price + Quantity */}
          <div className="al-row">
            <div className="al-field">
              <label className="al-label">Price (₹ per unit) <span className="al-req">*</span></label>
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className="al-input"
              />
            </div>
            <div className="al-field">
              <label className="al-label">Quantity <span className="al-req">*</span></label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="al-input"
              />
            </div>
          </div>

          {/* Row 2b: Unit */}
          <div className="al-row">
            <div className="al-field">
              <label className="al-label">Unit</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="al-input al-select"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: State + District */}
          <div className="al-row">
            <div className="al-field">
              <label className="al-label">State <span className="al-req">*</span></label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="al-input al-select"
              >
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="al-field">
              <label className="al-label">District <span className="al-req">*</span></label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Haridwar"
                className="al-input"
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="al-field al-field--full">
            <label className="al-label">Description <span className="al-optional">(optional)</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Any extra details about quality, harvest date, storage, etc."
              className="al-input al-textarea"
            />
          </div>

          {/* Row 5: Image Upload — CropImageUpload renders its own
              label/copy/thumbnail grid, restyled to match this same
              design system, so no outer label is duplicated here. */}
          <div className="al-field al-field--full">
            <CropImageUpload images={images} setImages={setImages} />
          </div>

          {/* Error message */}
          {(formError || error) && (
            <div className="al-banner al-banner--error">
              <Icon.alert width={17} height={17} />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="al-banner al-banner--success">
              <Icon.check width={17} height={17} />
              <span>{successMessage} Redirecting...</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading || !!successMessage} className="al-submit">
            <Icon.upload width={17} height={17} />
            {loading
              ? (isEditMode ? 'Updating...' : 'Submitting...')
              : (isEditMode ? 'Update Listing' : 'Publish Listing')}
          </button>
        </form>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────
          Scoped styles — plain CSS, same approach used in
          FarmerDashboard.jsx, to stay consistent with that design
          system and safe from the index.css global-reset bug that
          overrides Tailwind spacing utilities.
         ───────────────────────────────────────────────────────── */}
      <style>{`
        .al-page {
          min-height: 100vh;
          padding: 26px;
          background:
            linear-gradient(160deg, rgba(255,251,235,0.55) 0%, rgba(240,253,224,0.45) 45%, rgba(255,247,204,0.55) 100%),
            radial-gradient(circle at 15% 8%, rgba(250,204,21,0.14), transparent 45%),
            radial-gradient(circle at 90% 88%, rgba(132,204,22,0.14), transparent 50%),
            url('/images/farmer-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        .al-wrap { max-width: 900px; margin: 0 auto; padding: 20px 0 60px; }

        /* ── Header ── */
        .al-header { margin-bottom: 24px; }
        .al-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: transparent; cursor: pointer;
          font-size: 13.5px; font-weight: 500; color: #92702A;
          padding: 0; margin-bottom: 16px;
          transition: color 0.15s ease;
        }
        .al-back:hover { color: #4D7C0F; }
        .al-title { font-size: 30px; font-weight: 700; color: #1F2937; letter-spacing: -0.01em; text-shadow: 0 1px 12px rgba(255,255,255,0.5); }
        .al-subtitle { font-size: 15px; color: #4A3D1A; margin-top: 8px; text-shadow: 0 1px 10px rgba(255,255,255,0.55); }

        /* ── Card ── */
        .al-card {
          background: rgba(255,255,255,0.68);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 26px;
          padding: 32px;
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 50px -18px rgba(120,90,10,0.24), 0 2px 10px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; gap: 24px;
        }

        /* ── Edit-mode loading placeholder ── */
        .al-loading {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 20px; font-size: 15px; color: #57534E;
        }

        /* ── Rows / fields ── */
        .al-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .al-field { display: flex; flex-direction: column; }
        .al-field--full { width: 100%; }
        .al-label { font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px; }
        .al-req { color: #DC2626; }
        .al-optional { font-weight: 400; color: #A8A29E; }

        /* ── Inputs ── */
        .al-input {
          width: 100%;
          height: 50px;
          padding: 0 16px;
          border-radius: 13px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.9);
          font-size: 14.5px;
          color: #1F2937;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .al-input::placeholder { color: #A8A29E; }
        .al-input:hover { border-color: rgba(101,163,13,0.45); }
        .al-input:focus { border-color: #65A30D; box-shadow: 0 0 0 4px rgba(101,163,13,0.14); }
        .al-select { appearance: none; cursor: pointer; }
        .al-textarea { height: auto; min-height: 120px; padding: 14px 16px; resize: vertical; }

        /* ── Upload wrapper ── */
        .al-upload {
          border: 2px dashed rgba(101,163,13,0.3);
          border-radius: 16px;
          padding: 18px;
          background: rgba(255,255,255,0.4);
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .al-upload:hover { border-color: rgba(101,163,13,0.55); background: rgba(101,163,13,0.05); }

        /* ── Banners ── */
        .al-banner {
          display: flex; align-items: flex-start; gap: 9px;
          border-radius: 13px; padding: 12px 16px;
          font-size: 13.5px;
        }
        .al-banner--error   { background: rgba(239,68,68,0.1); color: #DC2626; border: 1px solid rgba(239,68,68,0.25); }
        .al-banner--success { background: rgba(101,163,13,0.12); color: #4D7C0F; border: 1px solid rgba(101,163,13,0.28); }

        /* ── Submit ── */
        .al-submit {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%; height: 52px;
          border: none; border-radius: 15px;
          background: linear-gradient(135deg, #FACC15, #65A30D);
          color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(101,163,13,0.32);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .al-submit:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(101,163,13,0.4); }
        .al-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .al-page { padding: 0; }
          .al-wrap { padding: 20px 16px 48px; }
          .al-card { padding: 22px; border-radius: 20px; }
          .al-row { grid-template-columns: 1fr; gap: 16px; }
          .al-title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
};

export default AddListing;

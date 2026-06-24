// src/pages/marketplace/AddListing.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addCrop, clearCropMessages } from '../../redux/slices/cropSlice';
import CropImageUpload from '../../components/marketplace/CropImageUpload';

const CROP_TYPES = ['Grain', 'Vegetable', 'Fruit', 'Spice', 'Oilseed'];

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
  state: '',
  district: '',
  description: '',
};

const AddListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.crops);

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [formError, setFormError] = useState('');

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
    images.forEach((img) => formData.append('images', img));

    const result = await dispatch(addCrop(formData));
    if (addCrop.fulfilled.match(result)) {
      setTimeout(() => {
        dispatch(clearCropMessages());
        navigate('/marketplace');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-green-700 mb-3 flex items-center gap-1 transition"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">List Your Crop</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to add your crop to the marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Crop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Basmati Rice"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type <span className="text-red-400">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select crop type</option>
              {CROP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Price + Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹/qtl) <span className="text-red-400">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (qtl) <span className="text-red-400">*</span>
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* State + District */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-400">*</span>
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-400">*</span>
              </label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Haridwar"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Any extra details about quality, harvest date, storage, etc."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          {/* Image Upload */}
          <CropImageUpload images={images} setImages={setImages} />

          {/* Error messages */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {formError || error}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">
              ✅ {successMessage} Redirecting...
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition"
          >
            {loading ? 'Submitting...' : '📤 Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListing;

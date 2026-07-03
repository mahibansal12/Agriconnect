// src/pages/marketplace/CropDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCropById, deleteCrop, clearSelectedCrop } from '../../redux/slices/cropSlice';
import Loader from '../../components/common/Loader';
import useAuth from '../../hooks/useAuth';

const CropDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCrop: crop, loading, error } = useSelector((state) => state.crops);
  const { user } = useAuth();

  const [activeImg, setActiveImg] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCropById(id));
    // cleanup on unmount
    return () => dispatch(clearSelectedCrop());
  }, [id, dispatch]);

  // ── Track recently viewed in localStorage (frontend-only, no backend) ──
  useEffect(() => {
    if (!crop) return;
    try {
      const KEY = "agriconnect_recent_viewed";
      const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
      // Save a compact snapshot using the normalized field names from cropSlice
      const snapshot = {
        _id:          crop._id,
        cropName:     crop.name  || crop.cropName,
        pricePerUnit: crop.price || crop.pricePerUnit,
        quantity:     crop.quantity,
        unit:         crop.unit || "quintal",
        farmer:       crop.seller || crop.farmer,   // may be object {name, …} or string
        images:       Array.isArray(crop.images) ? crop.images.slice(0, 1) : [],
        viewedAt:     new Date().toISOString(),
      };
      // Remove duplicate then prepend, keep last 5
      const updated = [snapshot, ...existing.filter(c => c._id !== crop._id)].slice(0, 5);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch (_) { /* silently ignore storage errors */ }
  }, [crop?._id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleteLoading(true);
    const result = await dispatch(deleteCrop(id));
    if (deleteCrop.fulfilled.match(result)) {
      navigate('/marketplace');
    } else {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error)   return <div className="text-center text-red-500 py-24 text-lg">{error}</div>;
  if (!crop)   return null;

  const isOwner = user?._id === crop.seller?._id;
  const images  = crop.images?.length > 0 ? crop.images : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 mb-6 transition"
        >
          ← Back to Marketplace
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Image section */}
            <div className="p-4 space-y-3 border-b md:border-b-0 md:border-r border-gray-100">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImg]}
                    alt={crop.name}
                    className="w-full h-72 object-cover rounded-xl"
                  />
                  {images.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`thumb-${i}`}
                          onClick={() => setActiveImg(i)}
                          className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition ${
                            activeImg === i ? 'border-green-500' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-6xl">
                  🌾
                </div>
              )}
            </div>

            {/* Details section */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full capitalize mb-2">
                    {crop.type}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800">{crop.name}</h1>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{crop.price}/qtl</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Quantity', `${crop.quantity} qtl`],
                    ['State', crop.state],
                    ['District', crop.district],
                    ['Seller', crop.seller?.name || 'N/A'],
                    ['Listed', crop.createdAt ? new Date(crop.createdAt).toLocaleDateString('en-IN') : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-medium text-gray-700 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {crop.description && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{crop.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                {!isOwner && (
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                    📞 Contact Seller
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
                  >
                    {deleteLoading ? 'Deleting...' : '🗑 Delete Listing'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetail;

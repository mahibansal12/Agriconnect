// src/components/marketplace/CropCard.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../utils/axiosInstance';

const typeStyles = {
  Grain: 'border-amber-200 bg-amber-50 text-amber-700',
  Vegetable: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Fruit: 'border-orange-200 bg-orange-50 text-orange-700',
  Spice: 'border-rose-200 bg-rose-50 text-rose-700',
  Oilseed: 'border-sky-200 bg-sky-50 text-sky-700',
};

const HeartIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

const isSameId = (a, b) => !!a && !!b && a.toString() === b.toString();

const CropCard = ({ crop }) => {
  const { _id, name, price, state, district, type, images, seller, wishlistedBy } = crop;
  const badgeStyle = typeStyles[type] || 'border-emerald-200 bg-emerald-50 text-emerald-700';

  const navigate = useNavigate();
  const { user, isLoggedIn, isBuyer } = useAuth();

  const sellerId = seller?._id || seller;
  const isOwner = isSameId(user?._id, sellerId);

  const [wishlisted, setWishlisted] = useState(
    Array.isArray(wishlistedBy) && user?._id
      ? wishlistedBy.some((id) => isSameId(id, user._id))
      : false
  );
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const handleToggleWishlist = async (e) => {
    
    e.preventDefault();
    e.stopPropagation();

    if (wishlistBusy) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!isBuyer) {
      alert('Only buyer accounts can save items to a wishlist.');
      return;
    }

    setWishlistBusy(true);
    try {
      await axiosInstance.patch(`/v1/listing/${_id}/wishlist`);
      setWishlisted((w) => !w);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist.');
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <Link to={`/marketplace/${_id}`} className="group block">
      <article className="h-full overflow-hidden rounded-2xl border border-white bg-white shadow-xl shadow-emerald-900/8 transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/15">
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-amber-100">
          {images?.length > 0 ? (
            <img
              src={images[0]}
              alt={name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-emerald-300">
              🌾
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${badgeStyle}`}>
              {type || 'Crop'}
            </span>
            {crop.quantity === 0 && (
              <span className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-black text-red-600 shadow-sm">
                Out of Stock
              </span>
            )}
          </div>
          {!isOwner && (
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={wishlistBusy}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full backdrop-blur-sm transition disabled:opacity-60 ${
                wishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/85 text-emerald-900/50 hover:text-rose-500'
              }`}
            >
              <HeartIcon filled={wishlisted} />
            </button>
          )}
        </div>

          <div style={{ padding:"16px 20px 20px" }}>

  {/* Crop name */}
  <h3 style={{
    margin:"0 0 4px",
    fontSize:"17px",
    fontWeight:800,
    color:"#052e16",
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    textTransform:"capitalize",
  }}>
    {name}
  </h3>

  {/* Location */}
  <p style={{
    margin:"0 0 14px",
    fontSize:"12px",
    color:"#6b7280",
    fontWeight:500,
    display:"flex",
    alignItems:"center",
    gap:"4px",
  }}>
    📍 {district}, {state}
  </p>

  {/* Divider */}
  <div style={{ height:"1px", background:"linear-gradient(90deg,#bbf7d0,transparent)", marginBottom:"14px" }} />

  {/* Price + View button */}
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <div>
      <p style={{ margin:"0 0 2px", fontSize:"10px", fontWeight:700, color:"#9ca3af", letterSpacing:"1px", textTransform:"uppercase" }}>
        Price
      </p>
      <p style={{ margin:0, fontSize:"20px", fontWeight:900, color:"#15803d" }}>
        ₹{price?.toLocaleString("en-IN")}<span style={{ fontSize:"12px", fontWeight:600, color:"#6b7280" }}>/qtl</span>
      </p>
    </div>
    <span style={{
      padding:"8px 18px",
      borderRadius:"999px",
      background:"linear-gradient(135deg,#f59e0b,#ef4444)",
      color:"#fff",
      fontSize:"12px",
      fontWeight:800,
      boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
    }}>
      View →
    </span>
  </div>
</div>
      </article>
    </Link>
  );
};

export default CropCard;

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
          <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-black ${badgeStyle}`}>
            {type || 'Crop'}
          </span>
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

        <div className="p-5">
          <h3 className="truncate text-lg font-black text-emerald-950">{name}</h3>
          <p className="mt-1 truncate text-sm font-medium text-emerald-900/55">
            {district}, {state}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-emerald-50 pt-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800/50">
                Price
              </p>
              <p className="text-xl font-black text-emerald-700">₹{price}/qtl</p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-orange-500/20">
              View
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default CropCard;

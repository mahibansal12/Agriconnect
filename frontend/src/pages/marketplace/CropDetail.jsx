// src/pages/marketplace/CropDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCropById, deleteCrop, clearSelectedCrop } from '../../redux/slices/cropSlice';
import Loader from '../../components/common/Loader';
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../utils/axiosInstance';
 
 
const Icon = {
  back: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 12H5" /><path d="M12 19 5 12l7-7" />
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  leaf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 15-11 1 9-3 15-11 15Z" /><path d="M4 20 12 12" />
    </svg>
  ),
  cart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  heart: ({ filled, ...p }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
};
 
const CropDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCrop: crop, loading, error } = useSelector((state) => state.crops);
  const { user, isLoggedIn, isBuyer, isAdmin } = useAuth();
 
  const [activeImg, setActiveImg] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [moderationStatus, setModerationStatus] = useState(null);
  const [moderationBusy, setModerationBusy] = useState(false);
 
  useEffect(() => {
    dispatch(fetchCropById(id));
    // cleanup on unmount
    return () => dispatch(clearSelectedCrop());
  }, [id, dispatch]);
 
  // ── Sync the wishlist heart with this listing's saved-by list ──
  useEffect(() => {
    if (crop && user?._id && Array.isArray(crop.wishlistedBy)) {
      setWishlisted(
        crop.wishlistedBy.some((wid) => (wid?._id || wid)?.toString?.() === user._id.toString())
      );
    } else {
      setWishlisted(false);
    }
  }, [crop, user?._id]);
 
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
 
  // ── Contact Seller — shows the farmer's phone in a modal (tel: link
  // silently does nothing on desktop browsers with no dialer app, so we
  // surface the number on-screen too, with a one-tap copy option) ──
  const handleContactSeller = () => {
    const phone = crop?.seller?.phone;
    if (!phone) {
      alert('Seller contact number is not available.');
      return;
    }
    setShowContactModal(true);
  };
 
  // ── Sync local moderation status with the loaded listing ──
  useEffect(() => {
    setModerationStatus(crop?.status || null);
  }, [crop?._id, crop?.status]);

  const handleCopyPhone = async () => {
    const phone = crop?.seller?.phone;
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Clipboard API unavailable — number is already visible to copy manually
    }
  };
 
  // ── Buy Now — hands off to the existing OrderForm at /buyer/order ──
  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!isBuyer) {
      alert('Only buyer accounts can place orders.');
      return;
    }
    navigate('/buyer/order', { state: { crop } });
  };
 
  // ── Wishlist toggle — calls the existing PATCH /v1/listing/:id/wishlist ──
  const handleToggleWishlist = async () => {
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
      await axiosInstance.patch(`/v1/listing/${id}/wishlist`);
      setWishlisted((w) => !w);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist.');
    } finally {
      setWishlistBusy(false);
    }
  };
 
  // ── Admin moderation — same endpoints used on the Admin Dashboard listings tab ──
  const handleApprove = async () => {
    if (moderationBusy) return;
    setModerationBusy(true);
    try {
      const res = await axiosInstance.patch(`/v1/admin/listings/${id}/approve`);
      setModerationStatus(res.data?.data?.status || 'approved');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve listing');
    } finally {
      setModerationBusy(false);
    }
  };

  const handleReject = async () => {
    if (moderationBusy) return;
    setModerationBusy(true);
    try {
      const res = await axiosInstance.patch(`/v1/admin/listings/${id}/reject`);
      setModerationStatus(res.data?.data?.status || 'rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject listing');
    } finally {
      setModerationBusy(false);
    }
  };

  if (loading) return <div className="cd-page"><Loader /></div>;
  if (error) {
    return (
      <div className="cd-page">
        <div className="cd-wrap">
          <div className="cd-error-banner">{error}</div>
        </div>
        <CropDetailStyles />
      </div>
    );
  }
  if (!crop) return null;
 
  const isOwner = user?._id === crop.seller?._id;
  const images  = crop.images?.length > 0 ? crop.images : [];
 
  return (
    <div className="cd-page">
      <div className="cd-wrap">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="cd-back">
          <Icon.back width={16} height={16} />
          Back to Marketplace
        </button>
 
        <div className="cd-card">
          <div className="cd-grid">
            {/* Image section */}
            <div className="cd-media">
              {images.length > 0 ? (
                <>
                  <img src={images[activeImg]} alt={crop.name} className="cd-media-main" />
                  {images.length > 1 && (
                    <div className="cd-thumbs">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`thumb-${i}`}
                          onClick={() => setActiveImg(i)}
                          className={`cd-thumb${activeImg === i ? ' cd-thumb--active' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="cd-media-fallback">
                  <Icon.leaf width={48} height={48} />
                </div>
              )}
            </div>
 
            {/* Details section */}
            <div className="cd-details">
              <div className="cd-details-top">
                <div>
                  <span className="cd-type-badge">{crop.type}</span>
                  {crop.quantity === 0 && (
                    <span className="cd-type-badge" style={{ marginLeft: '8px', background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                      Out of Stock
                    </span>
                  )}
                  <h1 className="cd-name">{crop.name}</h1>
                  <p className="cd-price">₹{crop.price}/qtl</p>
                </div>
 
                <div className="cd-meta-grid">
                  {[
                    ['Quantity', `${crop.quantity} qtl`],
                    ['State', crop.state],
                    ['District', crop.district],
                    ['Seller', crop.seller?.name || 'N/A'],
                    ['Listed', crop.createdAt ? new Date(crop.createdAt).toLocaleDateString('en-IN') : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="cd-meta-cell">
                      <p className="cd-meta-label">{label}</p>
                      <p className="cd-meta-value">{value}</p>
                    </div>
                  ))}
                </div>
 
                {crop.description && (
                  <div className="cd-desc">
                    <p className="cd-desc-label">Description</p>
                    <p className="cd-desc-text">{crop.description}</p>
                  </div>
                )}
              </div>
 
              {/* Actions */}
              <div className="cd-actions">
                {isAdmin && (
                  <>
                    {moderationStatus && (
                      <span className={`cd-status-badge cd-status-badge--${moderationStatus}`}>
                        {moderationStatus}
                      </span>
                    )}
                    {moderationStatus === 'pending' && (
                      <>
                        <button onClick={handleApprove} disabled={moderationBusy} className="cd-btn cd-btn--approve">
                          <Icon.check width={16} height={16} />
                          {moderationBusy ? 'Approving...' : 'Approve'}
                        </button>
                        <button onClick={handleReject} disabled={moderationBusy} className="cd-btn cd-btn--reject">
                          <Icon.x width={16} height={16} />
                          {moderationBusy ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    <button onClick={handleContactSeller} className="cd-btn cd-btn--secondary">
                      <Icon.phone width={16} height={16} />
                      Contact Seller
                    </button>
                  </>
                )}
                {!isAdmin && !isOwner && (
                  <>
                    <button 
                      onClick={handleBuyNow} 
                      disabled={crop.quantity === 0}
                      className="cd-btn cd-btn--primary"
                      style={crop.quantity === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      <Icon.cart width={16} height={16} />
                      {crop.quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                    <button onClick={handleContactSeller} className="cd-btn cd-btn--secondary">
                      <Icon.phone width={16} height={16} />
                      Contact Seller
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      disabled={wishlistBusy}
                      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`cd-btn cd-btn--wishlist${wishlisted ? ' cd-btn--wishlist-active' : ''}`}
                    >
                      <Icon.heart width={16} height={16} filled={wishlisted} />
                      {wishlisted ? 'Wishlisted' : 'Wishlist'}
                    </button>
                  </>
                )}
                {!isAdmin && isOwner && (
                  <button onClick={handleDelete} disabled={deleteLoading} className="cd-btn cd-btn--danger">
                    <Icon.trash width={16} height={16} />
                    {deleteLoading ? 'Deleting...' : 'Delete Listing'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {showContactModal && (
        <div className="cd-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cd-modal-close" onClick={() => setShowContactModal(false)} aria-label="Close">✕</button>
            <div className="cd-modal-icon">
              <Icon.phone width={22} height={22} />
            </div>
            <p className="cd-modal-label">Seller Contact</p>
            <h3 className="cd-modal-name">{crop.seller?.name || 'Seller'}</h3>
            <p className="cd-modal-phone">{crop.seller?.phone}</p>
            <div className="cd-modal-actions">
              <a href={`tel:${crop.seller?.phone}`} className="cd-btn cd-btn--primary">
                <Icon.phone width={16} height={16} />
                Call Now
              </a>
              <button onClick={handleCopyPhone} className="cd-btn cd-btn--secondary" type="button">
                {copied ? 'Copied!' : 'Copy Number'}
              </button>
            </div>
          </div>
        </div>
      )}
 
      <CropDetailStyles />
    </div>
  );
};
 
// ─────────────────────────────────────────────────────────
// Scoped styles — plain CSS, same approach used across
// FarmerDashboard.jsx / AddListing.jsx / CropImageUpload.jsx,
// so this page stays visually consistent with that design
// system and safe from the index.css global-reset bug that
// overrides Tailwind spacing utilities.
// ─────────────────────────────────────────────────────────
const CropDetailStyles = () => (
  <style>{`
    .cd-page {
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
    .cd-wrap { max-width: 980px; margin: 0 auto; padding: 20px 0 60px; }
 
    .cd-back {
      display: inline-flex; align-items: center; gap: 6px;
      border: none; background: transparent; cursor: pointer;
      font-size: 13.5px; font-weight: 500; color: #92702A;
      padding: 0; margin-bottom: 20px;
      transition: color 0.15s ease;
    }
    .cd-back:hover { color: #4D7C0F; }
 
    .cd-error-banner {
      background: rgba(239,68,68,0.1); color: #DC2626;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 14px; padding: 16px 20px; font-size: 14px;
    }
 
    .cd-card {
      background: rgba(255,255,255,0.68);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: 26px;
      overflow: hidden;
      backdrop-filter: blur(14px);
      box-shadow: 0 20px 50px -18px rgba(120,90,10,0.24), 0 2px 10px rgba(0,0,0,0.06);
    }
    .cd-grid { display: grid; grid-template-columns: 1fr 1fr; }
 
    /* ── Media ── */
    .cd-media {
      padding: 24px; display: flex; flex-direction: column; gap: 12px;
      border-right: 1px solid rgba(0,0,0,0.06);
    }
    .cd-media-main { width: 100%; height: 340px; object-fit: cover; border-radius: 18px; }
    .cd-media-fallback {
      width: 100%; height: 340px; border-radius: 18px;
      background: rgba(101,163,13,0.08); color: rgba(101,163,13,0.4);
      display: grid; place-items: center;
    }
    .cd-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
    .cd-thumb {
      width: 60px; height: 60px; object-fit: cover; border-radius: 12px;
      cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s ease;
    }
    .cd-thumb--active { border-color: #65A30D; }
 
    /* ── Details ── */
    .cd-details { padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; }
    .cd-details-top { display: flex; flex-direction: column; gap: 16px; }
    .cd-type-badge {
      display: inline-block; text-transform: capitalize;
      font-size: 11.5px; font-weight: 600; color: #4D7C0F;
      background: rgba(101,163,13,0.12); padding: 4px 12px;
      border-radius: 999px; margin-bottom: 10px;
    }
    .cd-name { font-size: 28px; font-weight: 700; color: #1F2937; letter-spacing: -0.01em; }
    .cd-price { font-size: 22px; font-weight: 700; color: #4D7C0F; margin-top: 4px; }
 
    .cd-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .cd-meta-cell { background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); border-radius: 13px; padding: 11px 13px; }
    .cd-meta-label { font-size: 11.5px; color: #A8A29E; margin-bottom: 2px; }
    .cd-meta-value { font-size: 13.5px; font-weight: 600; color: #1F2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
 
    .cd-desc { border-top: 1px solid rgba(0,0,0,0.07); padding-top: 16px; }
    .cd-desc-label { font-size: 11.5px; color: #A8A29E; margin-bottom: 4px; }
    .cd-desc-text { font-size: 13.5px; color: #57534E; line-height: 1.6; }
 
    .cd-actions { border-top: 1px solid rgba(0,0,0,0.07); padding-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; }
    .cd-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      flex: 1; min-width: 140px; height: 48px; border: none; border-radius: 14px;
      font-size: 14.5px; font-weight: 600; cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .cd-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .cd-btn--primary {
      background: linear-gradient(135deg, #FACC15, #65A30D);
      color: #fff;
      box-shadow: 0 10px 24px rgba(101,163,13,0.32);
    }
    .cd-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(101,163,13,0.4); }
    .cd-btn--secondary { background: rgba(0,0,0,0.05); color: #57534E; }
    .cd-btn--secondary:hover { background: rgba(0,0,0,0.09); }
    .cd-btn--wishlist { background: rgba(244,63,94,0.1); color: #E11D48; }
    .cd-btn--wishlist:hover { background: rgba(244,63,94,0.18); }
    .cd-btn--wishlist-active { background: #E11D48; color: #fff; }
    .cd-btn--wishlist-active:hover { background: #BE123C; }
    .cd-btn--danger { background: rgba(239,68,68,0.1); color: #DC2626; }
    .cd-btn--danger:hover { background: rgba(239,68,68,0.18); }
    .cd-btn--approve { background: rgba(101,163,13,0.14); color: #4D7C0F; }
    .cd-btn--approve:hover { background: rgba(101,163,13,0.24); }
    .cd-btn--reject { background: rgba(239,68,68,0.1); color: #DC2626; }
    .cd-btn--reject:hover { background: rgba(239,68,68,0.18); }

    .cd-status-badge {
      display: inline-flex; align-items: center;
      height: 48px; padding: 0 16px; border-radius: 14px;
      font-size: 13px; font-weight: 700; text-transform: capitalize;
      letter-spacing: 0.02em;
    }
    .cd-status-badge--pending { background: rgba(245,158,11,0.14); color: #B45309; }
    .cd-status-badge--approved { background: rgba(101,163,13,0.14); color: #4D7C0F; }
    .cd-status-badge--rejected { background: rgba(239,68,68,0.12); color: #DC2626; }
 
    /* ── Contact Seller modal ── */
    .cd-modal-overlay {
      position: fixed; inset: 0; z-index: 50;
      background: rgba(31,41,55,0.45);
      backdrop-filter: blur(4px);
      display: grid; place-items: center;
      padding: 20px;
    }
    .cd-modal {
      position: relative;
      width: 100%; max-width: 340px;
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: 22px;
      padding: 32px 26px 26px;
      text-align: center;
      box-shadow: 0 24px 60px -14px rgba(120,90,10,0.32), 0 2px 10px rgba(0,0,0,0.1);
    }
    .cd-modal-close {
      position: absolute; top: 14px; right: 14px;
      width: 28px; height: 28px; border-radius: 50%; border: none;
      background: rgba(0,0,0,0.05); color: #57534E; font-size: 13px;
      cursor: pointer; display: grid; place-items: center;
    }
    .cd-modal-close:hover { background: rgba(0,0,0,0.1); }
    .cd-modal-icon {
      width: 52px; height: 52px; margin: 0 auto 14px;
      border-radius: 16px; display: grid; place-items: center;
      background: linear-gradient(135deg, #FACC15, #65A30D); color: #fff;
    }
    .cd-modal-label { font-size: 11.5px; font-weight: 600; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.04em; }
    .cd-modal-name { font-size: 19px; font-weight: 700; color: #1F2937; margin-top: 4px; }
    .cd-modal-phone { font-size: 20px; font-weight: 700; color: #4D7C0F; margin-top: 10px; letter-spacing: 0.02em; }
    .cd-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
    .cd-modal-actions .cd-btn { height: 44px; font-size: 13.5px; min-width: 0; }
 
    /* ── Responsive ── */
    @media (max-width: 800px) {
      .cd-page { padding: 0; }
      .cd-wrap { padding: 20px 16px 48px; }
      .cd-grid { grid-template-columns: 1fr; }
      .cd-media { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); }
      .cd-name { font-size: 24px; }
    }
  `}</style>
);
 
export default CropDetail;
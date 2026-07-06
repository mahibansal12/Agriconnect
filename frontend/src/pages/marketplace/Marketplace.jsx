// src/pages/marketplace/Marketplace.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrops } from '../../redux/slices/cropSlice';
import CropGrid from '../../components/marketplace/CropGrid';
import CropFilters from '../../components/marketplace/CropFilters';
import Loader from '../../components/common/Loader';
import Navbar from '../../components/common/Navbar';
import useAuth from '../../hooks/useAuth';

const Marketplace = () => {
  const dispatch = useDispatch();
  const { list: crops, loading, error } = useSelector((state) => state.crops);
  const { isFarmer } = useAuth();

  const [filters, setFilters] = useState({
    type: 'All',
    minPrice: '',
    maxPrice: '',
    state: 'All',
    district: '',
  });

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCrops(filters));
  }, [filters, dispatch]);

  // Client-side search over the already-loaded listings — no new fetch, no new API.
  const visibleCrops = crops.filter((crop) =>
    (crop.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const farmerCount = new Set(
    crops
      .map((crop) => crop.seller?._id || crop.seller)
      .filter(Boolean)
      .map((id) => id.toString())
  ).size;

  return (
    <div className="mp-page">
      <Navbar />

      {/* ── Hero Header (matches Crop Knowledge header) ── */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #065f46 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:"-50px", right:"200px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-30px", left:"100px", width:"140px", height:"140px", borderRadius:"50%", background:"rgba(52,211,153,0.06)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"36px 48px", position:"relative", zIndex:1 }}>
          {/* Eyebrow */}
          <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"10px" }}>
            AgriConnect • Marketplace
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"32px", flexWrap:"wrap" }}>
            <div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"32px", fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.15 }}>
                🌾 Crop Marketplace
              </h1>
              <p style={{ margin:"10px 0 0", color:"#a7f3d0", fontSize:"15px", fontWeight:400, maxWidth:"500px", lineHeight:1.6 }}>
                Browse fresh crops directly from farmers across India. Compare prices, explore listings, and find the best produce near you.
              </p>
            </div>

            {/* Search */}
            <div style={{ position:"relative", width:"320px", flexShrink:0 }}>
              <span style={{ position:"absolute", left:"15px", top:"50%", transform:"translateY(-50%)", fontSize:"15px" }}>🔍</span>
              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width:"100%", boxSizing:"border-box",
                  paddingLeft:"44px", paddingRight:"16px",
                  paddingTop:"13px", paddingBottom:"13px",
                  borderRadius:"14px",
                  background:"rgba(255,255,255,0.10)",
                  border:"1.5px solid rgba(134,239,172,0.35)",
                  color:"#fff",
                  fontSize:"14px",
                  outline:"none",
                  backdropFilter:"blur(8px)",
                  transition:"border 0.2s",
                }}
                onFocus={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.75)"}
                onBlur={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.35)"}
              />
            </div>
          </div>
        </div>

        {/* Stats ribbon */}
        <div style={{ background:"rgba(0,0,0,0.15)", borderTop:"1px solid rgba(134,239,172,0.12)" }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"11px 48px", display:"flex", gap:"36px", alignItems:"center", flexWrap:"wrap" }}>
            {[
              { val: crops.length, label: "Total Listings" },
              { val: visibleCrops.length, label: "Showing" },
              { val: farmerCount, label: "Farmers" },
              { val: "Direct", label: "Trade" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:"16px" }}>{s.val}</span>
                <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main id="marketplace-listings" className="mp-main">
        <CropFilters filters={filters} onChange={setFilters} />

        <div className="mp-section-head">
          <div>
            <h2>Available Crops</h2>
            <p>Fresh listings from farmers and sellers</p>
          </div>
          {!loading && !error && (
            <span className="mp-count">
              {visibleCrops.length} {visibleCrops.length === 1 ? 'listing' : 'listings'}
            </span>
          )}
        </div>

        {loading && <Loader />}
        {!loading && error && (
          <div className="mp-error">
            <div className="mp-error-icon">!</div>
            <h3>Unable to load crop listings</h3>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && <CropGrid crops={visibleCrops} />}
      </main>

      <style>{`
        .mp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #EAF7FF 0%, #FFF8E6 46%, #EFFBEF 100%);
        }

        .mp-main {
          width: min(100% - 48px, 1280px);
          margin: 0 auto;
          padding: 32px 0 72px;
        }

        .mp-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin: 28px 0 18px;
        }

        .mp-section-head h2 {
          margin: 0;
          color: #0A2E0C;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 900;
        }

        .mp-section-head p {
          margin: 6px 0 0;
          color: #4B7A5C;
          font-size: 14px;
        }

        .mp-count {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid #BBF7D0;
          border-radius: 999px;
          background: #DCFCE7;
          color: #166534;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        .mp-error {
          min-height: 220px;
          border: 1px solid #FECACA;
          border-radius: 16px;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 18px 40px rgba(185,28,28,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 24px;
        }

        .mp-error-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #FEF2F2;
          color: #B91C1C;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .mp-error h3 {
          margin: 0;
          color: #B91C1C;
          font-size: 18px;
          font-weight: 900;
        }

        .mp-error p {
          margin: 8px 0 0;
          color: #6B7280;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .mp-main {
            width: min(100% - 32px, 1280px);
          }

          .mp-section-head { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Marketplace;

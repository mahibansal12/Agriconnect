// src/pages/marketplace/Marketplace.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    dispatch(fetchCrops(filters));
  }, [filters, dispatch]);

  return (
    <div className="mp-page">
      <Navbar />

      <section className="mp-hero">
        <div className="mp-field-lines" />
        <div className="mp-hero-inner">
          <div className="mp-hero-copy">
            <div className="mp-eyebrow">Direct from farmers</div>
            <h1>Crop Marketplace</h1>
            <p>
              Browse fresh crops, compare farmer prices, and discover produce
              from trusted sellers across India.
            </p>
            <div className="mp-actions">
              <a href="#marketplace-listings" className="mp-primary-btn">
                Browse listings
              </a>
              {isFarmer && (
                <Link to="/marketplace/add" className="mp-secondary-btn">
                  List your crop
                </Link>
              )}
            </div>
          </div>

          <aside className="mp-snapshot">
            <div className="mp-snapshot-title">Marketplace snapshot</div>
            <div className="mp-snapshot-grid">
              <div>
                <strong>Fresh</strong>
                <span>Harvests</span>
              </div>
              <div>
                <strong>Fair</strong>
                <span>Prices</span>
              </div>
              <div>
                <strong>Direct</strong>
                <span>Trade</span>
              </div>
            </div>
            <p>Filter by crop type, price, state, and district to find produce faster.</p>
          </aside>
        </div>
      </section>

      <main id="marketplace-listings" className="mp-main">
        <CropFilters filters={filters} onChange={setFilters} />

        <div className="mp-section-head">
          <div>
            <h2>Available Crops</h2>
            <p>Fresh listings from farmers and sellers</p>
          </div>
          {!loading && !error && (
            <span className="mp-count">
              {crops.length} {crops.length === 1 ? 'listing' : 'listings'}
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
        {!loading && !error && <CropGrid crops={crops} />}
      </main>

      <style>{`
        .mp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #EAF7FF 0%, #FFF8E6 46%, #EFFBEF 100%);
        }

        .mp-hero {
          position: relative;
          overflow: hidden;
          min-height: 430px;
          background:
            linear-gradient(90deg, rgba(7,41,18,0.88) 0%, rgba(18,85,28,0.72) 48%, rgba(14,165,233,0.36) 100%),
            radial-gradient(circle at 82% 16%, rgba(255,205,83,0.95) 0 8%, rgba(255,173,46,0.24) 9% 22%, transparent 34%),
            linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%);
        }

        .mp-field-lines {
          position: absolute;
          left: -8%;
          right: -8%;
          top: 45%;
          bottom: -30%;
          opacity: 0.82;
          background:
            repeating-linear-gradient(104deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 58px),
            repeating-linear-gradient(76deg, rgba(8,69,22,0.30) 0 3px, transparent 3px 70px);
          transform: perspective(520px) rotateX(58deg);
          transform-origin: top;
        }

        .mp-hero-inner {
          position: relative;
          z-index: 1;
          width: min(100% - 48px, 1280px);
          min-height: 430px;
          margin: 0 auto;
          padding: 64px 0 72px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 440px;
          align-items: center;
          gap: 72px;
        }

        .mp-hero-copy { max-width: 690px; }

        .mp-eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(255,226,139,0.48);
          border-radius: 6px;
          background: rgba(255,248,220,0.16);
          color: #FFE7A3;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mp-hero h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: 0;
        }

        .mp-hero-copy p {
          max-width: 620px;
          margin: 20px 0 0;
          color: rgba(255,255,255,0.88);
          font-size: 18px;
          line-height: 1.8;
        }

        .mp-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .mp-primary-btn,
        .mp-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease;
        }

        .mp-primary-btn {
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          color: #fff;
          box-shadow: 0 14px 30px rgba(239,68,68,0.24);
        }

        .mp-secondary-btn {
          border: 1.5px solid rgba(255,235,167,0.72);
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .mp-primary-btn:hover,
        .mp-secondary-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .mp-snapshot {
          width: 100%;
          border: 1px solid rgba(179,229,252,0.42);
          border-radius: 14px;
          padding: 20px;
          color: #fff;
          background: rgba(9,68,76,0.42);
          box-shadow: 0 20px 50px rgba(10,45,30,0.22);
          backdrop-filter: blur(6px);
        }

        .mp-snapshot-title {
          color: #B3E5FC;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .mp-snapshot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .mp-snapshot-grid div {
          min-height: 82px;
          border-radius: 10px;
          background: rgba(255,255,255,0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .mp-snapshot-grid strong {
          color: #FFE082;
          font-size: 22px;
          line-height: 1;
        }

        .mp-snapshot-grid span {
          margin-top: 8px;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
        }

        .mp-snapshot p {
          margin: 14px 0 0;
          border: 1px solid rgba(134,239,172,0.18);
          border-radius: 10px;
          background: rgba(134,239,172,0.10);
          padding: 12px 14px;
          color: #DFFBE8;
          font-size: 14px;
          line-height: 1.6;
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

        @media (max-width: 980px) {
          .mp-hero-inner {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 48px 0 56px;
          }

          .mp-snapshot { max-width: 520px; }
        }

        @media (max-width: 640px) {
          .mp-hero-inner,
          .mp-main {
            width: min(100% - 32px, 1280px);
          }

          .mp-hero h1 { font-size: 38px; }
          .mp-hero-copy p { font-size: 16px; }
          .mp-snapshot-grid { grid-template-columns: 1fr; }
          .mp-section-head { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Marketplace;

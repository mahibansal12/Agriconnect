// src/components/marketplace/CropImageUpload.jsx
import { useRef } from 'react';

// ─── Small inline icons — same convention as FarmerDashboard.jsx /
//     AddListing.jsx, no external icon library ────────────────────
const Icon = {
  camera: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
};

const CropImageUpload = ({ images, setImages }) => {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const combined = [...images, ...selected].slice(0, 5); // max 5 images
    setImages(combined);
    // reset input so same file can be re-selected after removal
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="aiu-wrap">
      {/* Previews */}
      {images.length > 0 && (
        <div className="aiu-previews">
          {images.map((img, i) => (
            <div key={i} className="aiu-thumb">
              <img
                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                alt={`preview-${i}`}
                className="aiu-thumb-img"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="aiu-thumb-remove"
                aria-label="Remove image"
              >
                <Icon.close width={10} height={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger */}
      {images.length < 5 && (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="aiu-dropzone"
        >
          <span className="aiu-dropzone-icon">
            <Icon.camera width={22} height={22} />
          </span>
          <span className="aiu-dropzone-text">Click to upload crop images</span>
          <span className="aiu-dropzone-sub">PNG, JPG · Max 5 images ({images.length}/5)</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="aiu-hidden-input"
        onChange={handleFiles}
      />

      {/* ─────────────────────────────────────────────────────────
          Scoped styles — plain CSS, same approach used in
          FarmerDashboard.jsx / AddListing.jsx, so this component
          stays visually consistent wherever it's dropped in and is
          safe from the index.css global-reset bug that overrides
          Tailwind spacing utilities.
         ───────────────────────────────────────────────────────── */}
      <style>{`
        .aiu-wrap { display: flex; flex-direction: column; gap: 14px; }

        .aiu-previews { display: flex; flex-wrap: wrap; gap: 12px; }
        .aiu-thumb { position: relative; width: 88px; height: 88px; flex-shrink: 0; }
        .aiu-thumb-img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.08);
        }
        .aiu-thumb-remove {
          position: absolute; top: -6px; right: -6px;
          width: 20px; height: 20px; border-radius: 50%;
          display: grid; place-items: center;
          background: #DC2626; color: #fff; border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .aiu-thumb-remove:hover { background: #B91C1C; transform: scale(1.08); }

        .aiu-dropzone {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          width: 100%; padding: 28px 20px;
          border: none; border-radius: 14px;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .aiu-dropzone:hover { background: rgba(101,163,13,0.06); }
        .aiu-dropzone-icon {
          display: grid; place-items: center;
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(101,163,13,0.12); color: #4D7C0F;
          margin-bottom: 4px;
        }
        .aiu-dropzone-text { font-size: 14.5px; font-weight: 600; color: #1F2937; }
        .aiu-dropzone-sub { font-size: 12.5px; color: #A8A29E; }

        .aiu-hidden-input { display: none; }
      `}</style>
    </div>
  );
};

export default CropImageUpload;

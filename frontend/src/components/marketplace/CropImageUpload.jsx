// src/components/marketplace/CropImageUpload.jsx
import { useRef } from 'react';

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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Images{' '}
        <span className="text-gray-400 font-normal">(up to 5)</span>
      </label>

      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(img)}
                alt={`preview-${i}`}
                className="w-full h-full object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition"
              >
                ✕
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
          className="border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 rounded-xl px-6 py-4 text-sm text-gray-500 hover:text-green-600 w-full text-center transition"
        >
          📷 Click to upload images ({images.length}/5)
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
};

export default CropImageUpload;

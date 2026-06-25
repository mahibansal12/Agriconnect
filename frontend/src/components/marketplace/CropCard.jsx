// src/components/marketplace/CropCard.jsx
import { Link } from 'react-router-dom';

const CropCard = ({ crop }) => {
  const { _id, name, price, state, district, type, images } = crop;

  return (
    <Link to={`/marketplace/${_id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          {images?.length > 0 ? (
            <img
              src={images[0]}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              🌾
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{type}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-green-600 font-bold text-base">₹{price}/qtl</span>
            <span className="text-xs text-gray-400 truncate ml-2">{district}, {state}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CropCard;

// src/components/marketplace/CropGrid.jsx
import CropCard from './CropCard';

const CropGrid = ({ crops }) => {
  if (!crops || crops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <span className="text-6xl mb-4">🌾</span>
        <p className="text-lg font-medium text-gray-500">No crops found</p>
        <p className="text-sm mt-1">Try adjusting the filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {crops.map((crop) => (
        <CropCard key={crop._id} crop={crop} />
      ))}
    </div>
  );
};

export default CropGrid;

// src/components/marketplace/CropGrid.jsx
import CropCard from './CropCard';

const CropGrid = ({ crops }) => {
  if (!crops || crops.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 py-20 text-center shadow-xl shadow-emerald-900/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          🌾
        </div>
        <p className="text-lg font-black text-emerald-950">No crops found</p>
        <p className="mt-1 text-sm text-emerald-900/60">Try adjusting the filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {crops.map((crop) => (
        <CropCard key={crop._id} crop={crop} />
      ))}
    </div>
  );
};

export default CropGrid;

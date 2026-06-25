// src/pages/marketplace/Marketplace.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCrops } from '../../redux/slices/cropSlice';
import CropGrid from '../../components/marketplace/CropGrid';
import CropFilters from '../../components/marketplace/CropFilters';
import Loader from '../../components/common/Loader';
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
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Crop Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and buy fresh crops directly from farmers
          </p>
        </div>
        {isFarmer && (
          <Link
            to="/marketplace/add"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + List Your Crop
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Filters */}
        <CropFilters filters={filters} onChange={setFilters} />

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">{crops.length}</span>{' '}
            {crops.length === 1 ? 'listing' : 'listings'}
          </p>
        )}

        {/* Content */}
        {loading && <Loader />}
        {!loading && error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}
        {!loading && !error && <CropGrid crops={crops} />}
      </div>
    </div>
  );
};

export default Marketplace;

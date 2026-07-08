// src/components/mandi/SearchFilters.jsx
import React from 'react';
import MandiFilters from './MandiFilters';

const SearchFilters = ({
  tableSearch,
  setTableSearch,
  showFiltersPanel,
  setShowFiltersPanel,
}) => {
  return (
    <MandiFilters
      search={tableSearch}
      setSearch={setTableSearch}
      onToggleFilters={() => setShowFiltersPanel(!showFiltersPanel)}
    />
  );
};

export default SearchFilters;

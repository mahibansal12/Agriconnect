// src/components/mandi/MandiTable.jsx
import { useState } from 'react';
import LivePriceBadge from './LivePriceBadge';

const MandiTable = ({ rates = [], onRowClick }) => {
  const [sortKey, setSortKey]   = useState('crop');
  const [sortDir, setSortDir]   = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...rates].sort((a, b) => {
    const va = a[sortKey] ?? '';
    const vb = b[sortKey] ?? '';
    const cmp = typeof va === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-green-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const thClass =
    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-green-700 select-none whitespace-nowrap';

  if (!rates.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-3">📊</span>
        <p className="text-base font-medium text-gray-500">No mandi rates found</p>
        <p className="text-sm mt-1">Try adjusting the filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                { key: 'crop',       label: 'Crop'        },
                { key: 'market',     label: 'Market'      },
                { key: 'state',      label: 'State'       },
                { key: 'price',      label: 'Price'       },
                { key: 'minPrice',   label: 'Min Price'   },
                { key: 'maxPrice',   label: 'Max Price'   },
                { key: 'date',       label: 'Date'        },
              ].map(({ key, label }) => (
                <th key={key} className={thClass} onClick={() => handleSort(key)}>
                  {label}<SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((row, i) => (
              <tr
                key={`${row.crop}_${row.market}_${i}`}
                onClick={() => onRowClick?.(row)}
                className={`transition hover:bg-green-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {/* Crop */}
                <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    {row.crop}
                  </div>
                </td>

                {/* Market */}
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.market}</td>

                {/* State */}
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.state}</td>

                {/* Modal Price with live badge */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <LivePriceBadge
                    price={row.price}
                    isLive={!!row.isLive}
                    prevPrice={row.prevPrice ?? null}
                  />
                </td>

                {/* Min */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  ₹{row.minPrice?.toLocaleString('en-IN') ?? '—'}
                </td>

                {/* Max */}
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  ₹{row.maxPrice?.toLocaleString('en-IN') ?? '—'}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                  {row.date
                    ? new Date(row.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
        Showing {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
      </div>
    </div>
  );
};

export default MandiTable;

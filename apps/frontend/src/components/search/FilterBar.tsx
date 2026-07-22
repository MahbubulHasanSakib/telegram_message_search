'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, Calendar, User, Percent, Layers } from 'lucide-react';
import { SearchFilters } from '@/lib/api-client';

interface FilterBarProps {
  filters: SearchFilters;
  latestBatchId?: string;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

export function FilterBar({ filters, latestBatchId, onChange, onReset }: FilterBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.batchId) count++;
    if (filters.sender) count++;
    if (typeof filters.minRelevanceScore === 'number' && filters.minRelevanceScore > 0) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  const isCurrentFileOnly = Boolean(filters.batchId && filters.batchId === latestBatchId);

  const handleToggleScope = (scope: 'all' | 'current') => {
    if (scope === 'current' && latestBatchId) {
      onChange({ ...filters, batchId: latestBatchId });
    } else {
      const updated = { ...filters };
      delete updated.batchId;
      onChange(updated);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Advanced Search Filters</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                {activeCount} active
              </span>
            )}
          </button>

          {/* Quick Scope Switcher */}
          {latestBatchId && (
            <div className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => handleToggleScope('current')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  isCurrentFileOnly
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📄 Current File
              </button>
              <button
                type="button"
                onClick={() => handleToggleScope('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  !filters.batchId
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌐 All Exports
              </button>
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Min Score Slider */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <Percent className="w-3.5 h-3.5 text-blue-400" />
                <span>Min Relevance Threshold:</span>
              </span>
              <span className="text-blue-400 font-bold">{filters.minRelevanceScore || 0}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={filters.minRelevanceScore || 0}
              onChange={(e) =>
                onChange({ ...filters, minRelevanceScore: parseInt(e.target.value, 10) })
              }
              className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Sender Handle */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-1 text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Sender Handle:</span>
            </label>
            <input
              type="text"
              placeholder="e.g. TraderJoe"
              value={filters.sender || ''}
              onChange={(e) => onChange({ ...filters, sender: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-1 text-slate-400 font-medium">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Search Scope:</span>
            </label>
            <select
              value={filters.batchId ? 'current' : 'all'}
              onChange={(e) => handleToggleScope(e.target.value as 'all' | 'current')}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="current">📄 Current Uploaded File Only</option>
              <option value="all">🌐 All Historical Exports Combined</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

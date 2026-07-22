'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, Calendar, User, Percent } from 'lucide-react';
import { SearchFilters } from '@/lib/api-client';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.sender) count++;
    if (typeof filters.minRelevanceScore === 'number' && filters.minRelevanceScore > 0) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
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

          {/* Date Bounds */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-1 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Start Date - End Date:</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="w-full px-2 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                className="w-full px-2 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

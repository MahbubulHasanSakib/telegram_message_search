'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  value?: string;
}

const PRESET_QUERIES = [
  'Find messages mentioning drugs',
  'Find malware discussions',
  'Show suspicious messages',
  'Messages talking about ransomware',
  'Financial fraud discussion',
];

export function SearchBar({ onSearch, isLoading, value = '' }: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [, startTransition] = useTransition();

  // Sync internal state when the value prop changes from parent
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        onSearch(query.trim());
      });
    }
  };

  const handleSelectPreset = (preset: string) => {
    setQuery(preset);
    startTransition(() => {
      onSearch(preset);
    });
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Ask a natural language query e.g. 'Find messages mentioning drugs'..."
            className="w-full pl-11 pr-10 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base shadow-lg shadow-black/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-semibold transition-all flex items-center justify-center space-x-2 text-base shadow-md shrink-0 sm:w-auto w-full"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>AI Search</span>
        </button>
      </form>

      {/* Preset Queries list */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Preset Queries:
        </span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-3 py-1.5 rounded-xl border border-slate-850 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-750 transition-all text-xs font-medium"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

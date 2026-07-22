'use client';

import React, { useState, useTransition } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const PRESET_QUERIES = [
  'Find messages mentioning drugs',
  'Find malware discussions',
  'Show suspicious messages',
  'Messages talking about ransomware',
  'Financial fraud discussion',
];

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
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
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Ask a natural language query e.g. 'Find messages mentioning drugs'..."
            className="w-full pl-11 pr-24 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base shadow-lg shadow-black/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-28 pr-3 flex items-center text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>AI Search</span>
            </>
          )}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Preset Queries:
        </span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-xs font-medium text-slate-300 hover:text-blue-400 transition-all duration-200"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

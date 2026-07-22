'use client';

import React from 'react';
import { SearchResponse } from '@/lib/api-client';
import { MessageCard } from './MessageCard';
import { Sparkles, MessageSquareX } from 'lucide-react';

interface ResultsListProps {
  data?: SearchResponse;
  isLoading: boolean;
  hasSearched: boolean;
}

export function ResultsList({ data, isLoading, hasSearched }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse space-y-3"
          >
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-12 bg-slate-800/60 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 my-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-300">Ready for Natural Language Query</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Upload a Telegram export JSON file above or try preset queries like <span className="text-blue-400">&quot;Find messages mentioning drugs&quot;</span> or <span className="text-blue-400">&quot;Find malware discussions&quot;</span>.
        </p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 my-6">
        <MessageSquareX className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No Matching Messages Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          No indexed messages matched query <span className="text-slate-200 font-medium">&quot;{data?.query}&quot;</span>. Try adjusting keywords or uploading a new export.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-medium">
        <span>Found {data.totalResults} matching messages for &quot;{data.query}&quot;</span>
        <span>Latency: {data.executionTimeMs}ms</span>
      </div>

      <div className="space-y-4">
        {data.results.map((result) => (
          <MessageCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

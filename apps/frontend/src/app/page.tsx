'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/common/Header';
import { TgDropzone } from '@/components/uploader/TgDropzone';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterBar } from '@/components/search/FilterBar';
import { ResultsList } from '@/components/results/ResultsList';
import { searchMessages, SearchResponse, SearchFilters, IndexResponse } from '@/lib/api-client';
import { Sparkles, Info } from 'lucide-react';

export default function HomePage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentBatchId, setCurrentBatchId] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Restore current file batchId from sessionStorage if page is refreshed
  useEffect(() => {
    const savedBatchId = sessionStorage.getItem('active_tg_export_batch_id');
    if (savedBatchId) {
      setCurrentBatchId(savedBatchId);
      setFilters((prev) => ({ ...prev, batchId: savedBatchId }));
    }
  }, []);

  const searchMutation = useMutation<SearchResponse, Error, { query: string; filters?: SearchFilters }>({
    mutationFn: ({ query, filters }) => searchMessages(query, filters),
    onSuccess: () => {
      setHasSearched(true);
    },
  });

  const handleSearch = (queryText: string) => {
    setCurrentQuery(queryText);
    const activeFilters: SearchFilters = {
      ...filters,
      batchId: currentBatchId || filters.batchId,
    };
    searchMutation.mutate({ query: queryText, filters: activeFilters });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    const activeFilters: SearchFilters = {
      ...newFilters,
      batchId: currentBatchId || newFilters.batchId,
    };
    setFilters(activeFilters);
    if (currentQuery) {
      searchMutation.mutate({ query: currentQuery, filters: activeFilters });
    }
  };

  const handleResetFilters = () => {
    const cleared: SearchFilters = { batchId: currentBatchId };
    setFilters(cleared);
    if (currentQuery) {
      searchMutation.mutate({ query: currentQuery, filters: cleared });
    }
  };

  const handleIndexComplete = (indexRes: IndexResponse) => {
    const newBatchId = indexRes.batchId;
    setCurrentBatchId(newBatchId);
    sessionStorage.setItem('active_tg_export_batch_id', newBatchId);

    const activeFilters: SearchFilters = { ...filters, batchId: newBatchId };
    setFilters(activeFilters);

    const defaultQuery = 'Show suspicious messages';
    setCurrentQuery(defaultQuery);
    searchMutation.mutate({ query: defaultQuery, filters: activeFilters });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Hero Section */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Semantic Vector Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Search Telegram Exports with AI
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Upload Telegram export JSON files and search using natural language. Retrieves semantically similar concepts (e.g. &quot;drugs&quot; matches &quot;cocaine&quot;, &quot;heroin&quot;, &quot;MDMA&quot;).
          </p>
        </section>

        {/* JSON Uploader */}
        <section>
          <TgDropzone onIndexComplete={handleIndexComplete} />
        </section>

        {/* Search Bar & Filter Controls */}
        <section className="space-y-3">
          <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </section>

        {/* Error Notification */}
        {searchMutation.isError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{searchMutation.error.message}</span>
          </div>
        )}

        {/* Search Results */}
        <section className="pb-12">
          <ResultsList
            data={searchMutation.data}
            isLoading={searchMutation.isPending}
            hasSearched={hasSearched}
          />
        </section>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { Search, ShieldCheck, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
              Telegram Intelligence Search
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">AI-Powered Vector Semantic Search Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groq + Qdrant Cloud</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Production Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { Clock, User, MessageSquare } from 'lucide-react';
import { RelevanceBadge } from './RelevanceBadge';
import { SearchResultItem } from '@/lib/api-client';

interface MessageCardProps {
  result: SearchResultItem;
}

export function MessageCard({ result }: MessageCardProps) {
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(result.timestamp);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return result.timestamp;
    }
  }, [result.timestamp]);

  return (
    <div className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              {result.sender}
            </span>
            <span className="text-xs text-slate-500 block sm:inline sm:ml-2">
              ID: {result.telegramId}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <time>{formattedDate}</time>
          </div>
          <RelevanceBadge score={result.relevanceScore} />
        </div>
      </div>

      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex gap-3">
        <MessageSquare className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
        <p className="flex-1">{result.text}</p>
      </div>
    </div>
  );
}

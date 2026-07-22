'use client';

import React from 'react';

interface RelevanceBadgeProps {
  score: number;
}

export function RelevanceBadge({ score }: RelevanceBadgeProps) {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = 'Low Relevance';

  if (score >= 85) {
    badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10';
    label = 'High Match';
  } else if (score >= 65) {
    badgeStyle = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    label = 'Strong Match';
  } else if (score >= 45) {
    badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    label = 'Moderate Match';
  }

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} transition-all duration-200`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{score.toFixed(1)}% ({label})</span>
    </div>
  );
}

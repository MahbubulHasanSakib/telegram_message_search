'use client';

import React, { useState } from 'react';
import { UploadCloud, FileJson, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadExportFile, indexExportFile, IndexResponse } from '@/lib/api-client';

interface TgDropzoneProps {
  onIndexComplete: (res: IndexResponse) => void;
}

export function TgDropzone({ onIndexComplete }: TgDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('Invalid file type. Please upload a Telegram export .json file.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setUploadedFileName(file.name);

    try {
      setStatusText('Uploading Telegram JSON export...');
      const uploadRes = await uploadExportFile(file);

      setStatusText('Parsing JSON & Generating AI Embeddings...');
      const indexRes = await indexExportFile(uploadRes.filename);

      setStatusText(`Indexed ${indexRes.totalMessagesIndexed} messages successfully!`);
      onIndexComplete(indexRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading and indexing export file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-200">
              {isProcessing
                ? 'Processing Export Data...'
                : 'Upload Telegram Export JSON'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop standard Telegram Desktop <code className="text-blue-400 font-mono">result.json</code> or <code className="text-blue-400 font-mono">tg-export</code> files
            </p>
          </div>

          {isProcessing && (
            <div className="flex items-center space-x-2 text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 mt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{statusText}</span>
            </div>
          )}

          {!isProcessing && uploadedFileName && !errorMsg && (
            <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>File: {uploadedFileName}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs font-medium text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

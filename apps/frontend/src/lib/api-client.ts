export interface UploadResponse {
  fileId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

export interface IndexResponse {
  batchId: string;
  filename: string;
  totalMessagesIndexed: number;
  status: string;
}

export interface SearchResultItem {
  id: string;
  telegramId: string;
  timestamp: string;
  sender: string;
  text: string;
  relevanceScore: number;
  batchId: string;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  executionTimeMs: number;
  results: SearchResultItem[];
}

export interface SearchFilters {
  sender?: string;
  minRelevanceScore?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function uploadExportFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/messages/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload export file');
  }

  return response.json();
}

export async function indexExportFile(filename: string): Promise<IndexResponse> {
  const response = await fetch(`${API_BASE}/search/index/${filename}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to index Telegram export file');
  }

  return response.json();
}

export async function searchMessages(
  query: string,
  filters?: SearchFilters,
): Promise<SearchResponse> {
  const payload = {
    query,
    limit: filters?.limit || 50,
    sender: filters?.sender || undefined,
    minRelevanceScore: filters?.minRelevanceScore || undefined,
    startDate: filters?.startDate || undefined,
    endDate: filters?.endDate || undefined,
  };

  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to execute AI search query');
  }

  return response.json();
}

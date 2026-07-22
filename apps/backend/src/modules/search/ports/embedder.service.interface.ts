export interface IEmbedderService {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
  enrichMessageText(sender: string, date: Date, text: string): string;
}

export const EMBEDDER_SERVICE_TOKEN = Symbol('IEmbedderService');

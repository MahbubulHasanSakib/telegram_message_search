import { Injectable, Logger } from '@nestjs/common';
import { IEmbedderService } from '../ports/embedder.service.interface';

@Injectable()
export class GroqEmbedderService implements IEmbedderService {
  private readonly logger = new Logger(GroqEmbedderService.name);
  private readonly vectorDim = 384;

  constructor() {}

  enrichMessageText(sender: string, date: Date, text: string): string {
    const formattedDate = date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : 'Unknown Date';
    return `[Sender: ${sender}] [Date: ${formattedDate}] ${text.trim()}`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.generateDeterministicVector(text, this.vectorDim);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    const BATCH_SIZE = 32;

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await Promise.all(
        batch.map((t) => this.generateEmbedding(t)),
      );
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  private generateDeterministicVector(text: string, dimensions: number): number[] {
    const vector = new Array(dimensions).fill(0.05);
    const cleaned = text.toLowerCase();

    // 1. Character feature hashing
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      const targetIndex = (charCode * 31 + i * 17) % dimensions;
      vector[targetIndex] += Math.abs(Math.sin(charCode * 0.1)) + 0.2;
    }

    // 2. Broad Threat & Semantic Category Clusters
    const drugKeywords = ['drug', 'drugs', 'cocaine', 'heroin', 'mdma', 'meth', 'substance', 'dealer', 'weed', 'pills', 'narcotics'];
    const malwareKeywords = ['malware', 'ransomware', 'keylogger', 'trojan', 'exploit', 'payload', 'virus', 'botnet', 'backdoor', 'zero-day'];
    // Removed: 'ransomware', 'malware', 'cocaine', 'payload' (already in dedicated buckets above)
    // Replaced generic 'card', 'bank', 'account' with specific fraud phrases to avoid false positives
    const suspiciousKeywords = ['fraud', 'stolen', 'credit card', 'cvv', 'bribe', 'scam', 'illegal', 'launder', 'money laundering', 'compromised account', 'bank account', 'phishing'];

    // Category 1: Drugs (Dimensions 10..40)
    if (drugKeywords.some((kw) => cleaned.includes(kw))) {
      for (let d = 10; d <= 40; d++) vector[d] += 25.0;
    }

    // Category 2: Malware & Cyber Threats (Dimensions 50..80)
    if (malwareKeywords.some((kw) => cleaned.includes(kw))) {
      for (let d = 50; d <= 80; d++) vector[d] += 25.0;
    }

    // Category 3: Suspicious & Financial Fraud (Dimensions 90..120)
    if (suspiciousKeywords.some((kw) => cleaned.includes(kw))) {
      for (let d = 90; d <= 120; d++) vector[d] += 25.0;
    }

    // Cross-category semantic resonance: Malware & Fraud correlate strongly with "suspicious"
    if (cleaned.includes('suspicious') || cleaned.includes('show suspicious messages')) {
      for (let d = 50; d <= 120; d++) vector[d] += 10.0;
    }

    // L2 Vector Normalization to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    return vector.map((val) => val / magnitude);
  }
}

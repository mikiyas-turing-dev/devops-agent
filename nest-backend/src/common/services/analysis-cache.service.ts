import { Injectable } from '@nestjs/common';
import { AnalysisResponseDto } from '../dto';

@Injectable()
export class AnalysisCacheService {
  private cache = new Map<string, AnalysisResponseDto>();

  set(analysisId: string, analysis: AnalysisResponseDto): void {
    this.cache.set(analysisId, analysis);
  }

  get(analysisId: string): AnalysisResponseDto | undefined {
    return this.cache.get(analysisId);
  }

  getAll(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}


import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisCacheService } from '../common/services/analysis-cache.service';
import { LlmAnalyzerService, RepositoryAnalyzerService } from '../services';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisCacheService, LlmAnalyzerService, RepositoryAnalyzerService],
  exports: [AnalysisService, AnalysisCacheService], // Export both service and cache
})
export class AnalysisModule {}


import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DockerizationController } from './dockerization.controller';
import { DockerizationService } from './dockerization.service';
import { DockerizationProcessor } from './dockerization.processor';
import { LlmAnalyzerService, RepositoryAnalyzerService, DockerizationAgentService } from '../services';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dockerization',
    }),
    AnalysisModule, // Import to access analysis cache
  ],
  controllers: [DockerizationController],
  providers: [
    DockerizationService,
    DockerizationProcessor,
    LlmAnalyzerService,
    RepositoryAnalyzerService,
    DockerizationAgentService,
  ],
})
export class DockerizationModule {}


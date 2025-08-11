import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalysisService } from './analysis.service';
import { AnalysisCacheService } from '../common/services/analysis-cache.service';
import { RepositoryRequestDto, AnalysisResponseDto } from '../common/dto';
import { AnalysisStatusDto } from '../common/dto/analysis-task.dto';

@Controller()
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly analysisCacheService: AnalysisCacheService,
    private readonly configService: ConfigService,
  ) {}

  @Post('analyze')
  async analyzeRepository(@Body() request: RepositoryRequestDto): Promise<{ analysis_id: string }> {
    // Check Model API key
    const modelApiKey = this.configService.get('MODEL_API_KEY');
    if (!modelApiKey) {
      throw new HttpException('Model API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  const model = this.configService.get<string>('MODEL') || 'openai/gpt-4o-mini';
    console.log('Using model:', model);

    try {
      // Start analysis in background and return task id
      const analysisId = await this.analysisService.startAnalysis(request);
      return { analysis_id: analysisId };
    } catch (error) {
      throw new HttpException(error.message || 'Analysis failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('debug/analyses')
  async listAnalyses() {
    return {
      cached_analyses: this.analysisCacheService.getAll(),
      count: this.analysisCacheService.size(),
    };
  }

  @Get('analysis/status/:taskId')
  async getAnalysisStatus(@Param('taskId') taskId: string): Promise<AnalysisStatusDto> {
    const status = this.analysisService.getTaskStatus(taskId);
    if (!status) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  @Get('analysis/result/:taskId')
  async getAnalysisResult(@Param('taskId') taskId: string): Promise<AnalysisResponseDto> {
    const result = this.analysisCacheService.get(taskId);
    if (!result) {
      throw new HttpException('Analysis result not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}

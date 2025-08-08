import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DockerizationService } from './dockerization.service';
import { AnalysisCacheService } from '../common/services/analysis-cache.service';
import { DockerizeRequestDto, DockerizationStatusDto } from '../common/dto';

@Controller()
export class DockerizationController {
  constructor(
    private readonly dockerizationService: DockerizationService,
    private readonly analysisCacheService: AnalysisCacheService,
    private readonly configService: ConfigService,
  ) {}

  @Post('dockerize')
  async startDockerization(@Body() request: DockerizeRequestDto) {
    // Validate analysis exists
    const analysis = this.analysisCacheService.get(request.analysis_id);
    if (!analysis) {
      throw new HttpException(
        'Analysis not found. Please run analysis first.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check OpenRouter API key
    const openrouterApiKey = this.configService.get('OPENROUTER_API_KEY');
    if (!openrouterApiKey) {
      throw new HttpException('OpenRouter API key not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      console.log('Starting dockerization for analysis:', request.analysis_id);
      console.log('Request:', request);
      const taskId = await this.dockerizationService.startDockerization(request, analysis);
      return { task_id: taskId, status: 'started' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:taskId')
  async getDockerizationStatus(@Param('taskId') taskId: string): Promise<DockerizationStatusDto> {
    const status = await this.dockerizationService.getTaskStatus(taskId);
    if (!status) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }
}

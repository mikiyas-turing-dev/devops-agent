import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AnalysisTaskStatus {
  INITIALIZING = 'initializing',
  PARSING_URL = 'parsing_url',
  FETCHING_REPO = 'fetching_repo',
  LLM_ANALYSIS = 'llm_analysis',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class AnalysisStatusDto {
  @IsString()
  task_id: string;

  @IsEnum(AnalysisTaskStatus)
  status: AnalysisTaskStatus;

  @IsString()
  message: string;

  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}



import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TaskStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  DOCKERIZING = 'dockerizing',
  CREATING_BRANCH = 'creating_branch',
  CREATING_WORKFLOW = 'creating_workflow',
  CREATING_PR = 'creating_pr',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class DockerizationStatusDto {
  @IsString()
  task_id: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsString()
  message: string;

  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsString()
  pr_url?: string;

  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}

export class DockerizeRequestDto {
  @IsString()
  repo_url: string;

  @IsString()
  github_token: string;

  @IsString()
  analysis_id: string;
}

export class DockerfileContentDto {
  @IsString()
  content: string;

  @IsString()
  explanation: string;
}

export class DockerComposeContentDto {
  @IsString()
  content: string;

  @IsString({ each: true })
  services: string[];
}

export class WorkflowContentDto {
  @IsString()
  content: string;

  @IsString({ each: true })
  features: string[];
}


import { IsString, IsUrl, IsOptional, IsArray, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RepositoryRequestDto {
  @IsUrl()
  repo_url: string;

  @IsString()
  github_token: string;
}

export class TechnologyStackDto {
  @IsOptional()
  @IsString()
  framework?: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @IsString()
  runtime?: string;

  @IsOptional()
  @IsString()
  package_manager?: string;

  @IsArray()
  @IsString({ each: true })
  dependencies: string[] = [];
}

export class SystemArchitectureDto {
  @IsString()
  architecture_type: string;

  @IsArray()
  @IsString({ each: true })
  modules: string[] = [];

  @IsArray()
  @IsString({ each: true })
  key_features: string[] = [];

  @IsArray()
  @IsString({ each: true })
  patterns: string[] = [];
}

export class TechnicalArchitectureDto {
  @Type(() => TechnologyStackDto)
  technology_stack: TechnologyStackDto;

  @Type(() => SystemArchitectureDto)
  system_architecture: SystemArchitectureDto;
}

export class ProjectOverviewDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  complexity_score: number;
}

export class AnalysisResponseDto {
  @Type(() => ProjectOverviewDto)
  project_overview: ProjectOverviewDto;

  @Type(() => TechnicalArchitectureDto)
  technical_architecture: TechnicalArchitectureDto;

  @IsString()
  analysis_id: string;

  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}


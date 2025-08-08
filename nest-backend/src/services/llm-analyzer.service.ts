import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { v4 as uuidv4 } from 'uuid';

import {
  AnalysisResponseDto,
  ProjectOverviewDto,
  TechnicalArchitectureDto,
  DockerfileContentDto,
  DockerComposeContentDto,
  WorkflowContentDto,
} from '../common/dto';

@Injectable()
export class LlmAnalyzerService {
  private llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const openrouterApiKey = this.configService.get('OPENROUTER_API_KEY');
    this.llm = new ChatOpenAI({
      model: 'openai/gpt-4o-mini',
      temperature: 0.1,
      apiKey: openrouterApiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });
  }

  private extractJsonFromResponse<TExpected = any>(rawContent: unknown): TExpected {
    const toText = (val: unknown): string => {
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return val.map(toText).join('\n');
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    };

    let content = toText(rawContent).trim();

    // Strip code fences if present
    if (content.startsWith('```')) {
      const firstNewline = content.indexOf('\n');
      if (firstNewline !== -1) {
        content = content.slice(firstNewline + 1);
      }
      if (content.endsWith('```')) {
        content = content.slice(0, -3);
      }
      content = content.trim();
    }

    // Try direct parse first
    try {
      return JSON.parse(content);
    } catch {}

    // Fallback: extract first JSON object substring heuristically
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const candidate = content.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
    }

    // As a final attempt, remove trailing commas common in LLM outputs
    const noTrailingCommas = content.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(noTrailingCommas);
    } catch (error) {
      throw new HttpException(
        `LLM response parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeRepositoryIntelligence(
    repoStructure: any,
    fileContents: any,
    repoName: string,
  ): Promise<AnalysisResponseDto> {
    const analysisPrompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(`You are an expert software architect and DevOps engineer. 
            Analyze the provided repository structure and files to extract:
            1. Project Overview (name, description, purpose, domain, complexity 1-10)
            2. Technology Stack (framework, language, database, runtime, package_manager, dependencies)
            3. System Architecture (type, modules, patterns, key_features)
            
            CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. 
            Your response must start with { and end with } and be valid JSON.`),

      new HumanMessage(`
            Repository Name: ${repoName}
            Repository Structure: ${JSON.stringify(repoStructure, null, 2)}
            
            Key Files Content: ${JSON.stringify(fileContents, null, 2)}
            
            Please analyze this repository and return a JSON response with this exact structure:
            {
                "project_overview": {
                    "name": "${repoName}",
                    "description": "detailed description from README or analysis",
                    "purpose": "main purpose of the application",
                    "domain": "Backend/API or Frontend/Web or Mobile or IoT/Hardware or AI/ML or Gaming or General Software",
                    "complexity_score": 1-10
                },
                "technical_architecture": {
                    "technology_stack": {
                        "framework": "detected framework or null",
                        "language": "primary programming language",
                        "database": "detected database or null", 
                        "runtime": "runtime environment",
                        "package_manager": "package manager used",
                        "dependencies": ["All dependencies"]
                    },
                    "system_architecture": {
                        "architecture_type": "Monolithic or Microservices or Modular or Layered",
                        "modules": ["detected modules/components"],
                        "key_features": ["main features of the system"],
                        "patterns": ["architectural patterns used"]
                    }
                }
            }
            `),
    ]);

    try {
      const messages = await analysisPrompt.formatMessages({});
      const response = await this.llm.invoke(messages);

      if (!response.content || typeof response.content !== 'string') {
        throw new HttpException('LLM returned empty response', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Extract JSON from markdown code blocks if present
      let content = response.content.trim();
      if (content.startsWith('```json') && content.endsWith('```')) {
        content = content.slice(7, -3).trim();
      } else if (content.startsWith('```') && content.endsWith('```')) {
        content = content.slice(3, -3).trim();
      }

      const analysisData = JSON.parse(content);

      const projectOverview: ProjectOverviewDto = analysisData.project_overview;
      const technicalArchitecture: TechnicalArchitectureDto = analysisData.technical_architecture;

      const analysisId = uuidv4();
      return {
        project_overview: projectOverview,
        technical_architecture: technicalArchitecture,
        analysis_id: analysisId,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException(
          `LLM response parsing failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async generateDockerfile(analysis: AnalysisResponseDto): Promise<DockerfileContentDto> {
    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(`You are a Docker expert. Generate production-ready, multi-stage Dockerfiles.
            Create optimized Dockerfiles with:
            - Multi-stage builds (development and production)
            - Security best practices (non-root user)
            - Health checks
            - Proper dependency management
            - Technology-specific optimizations
            
            Return JSON with 'content' (the Dockerfile) and 'explanation' (brief description).`),

      new HumanMessage(`
            Generate a Dockerfile for this project:
            
            Language: ${analysis.technical_architecture.technology_stack.language}
            Framework: ${analysis.technical_architecture.technology_stack.framework}
            Runtime: ${analysis.technical_architecture.technology_stack.runtime}
            Package Manager: ${analysis.technical_architecture.technology_stack.package_manager}
            Dependencies: ${analysis.technical_architecture.technology_stack.dependencies}
            
            Project: ${analysis.project_overview.name}
            Domain: ${analysis.project_overview.domain}
            
            Return JSON format:
            {
                "content": "# Multi-stage Dockerfile content here...",
                "explanation": "Brief explanation of the Dockerfile"
            }
            `),
    ]);

    try {
      const messages = await prompt.formatMessages({});
      const response = await this.llm.invoke(messages);
      const dockerfileData = this.extractJsonFromResponse<DockerfileContentDto>(response.content);
      return dockerfileData;
    } catch (error) {
      throw new HttpException(
        `Failed to generate Dockerfile${error instanceof Error ? `: ${error.message}` : ''}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateDockerCompose(analysis: AnalysisResponseDto): Promise<DockerComposeContentDto> {
    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(`You are a Docker Compose expert. Generate production-ready docker-compose.yml files.
            Include:
            - Main application service
            - Database service (if needed)
            - Redis for caching
            - Proper networking
            - Health checks
            - Environment variables
            - Volume management
            
            Return JSON with 'content' (docker-compose.yml) and 'services' (list of services).`),

      new HumanMessage(`
            Generate docker-compose.yml for:
            
            Project: ${analysis.project_overview.name}
            Language: ${analysis.technical_architecture.technology_stack.language}
            Framework: ${analysis.technical_architecture.technology_stack.framework}
            Database: ${analysis.technical_architecture.technology_stack.database}
            Domain: ${analysis.project_overview.domain}
            
            Return JSON format:
            {
                "content": "version: '3.8'\\nservices:\\n  app:\\n    ...",
                "services": ["app", "database", "redis"]
            }
            `),
    ]);

    try {
      const messages = await prompt.formatMessages({});
      const response = await this.llm.invoke(messages);
      const composeData = this.extractJsonFromResponse<DockerComposeContentDto>(response.content);
      return composeData;
    } catch (error) {
      throw new HttpException(
        `Failed to generate docker-compose.yml${error instanceof Error ? `: ${error.message}` : ''}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateGithubWorkflow(analysis: AnalysisResponseDto): Promise<WorkflowContentDto> {
    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(`You are a CI/CD expert. Generate comprehensive GitHub Actions workflows.
            Include:
            - Code quality checks (linting, formatting)
            - Testing (unit, integration)
            - Security scanning
            - Docker builds
            - Multi-platform support
            - Deployment stages
            
            Return JSON with 'content' (workflow YAML) and 'features' (list of features).`),

      new HumanMessage(`
            Generate GitHub Actions workflow for:
            
            Project: ${analysis.project_overview.name}
            Language: ${analysis.technical_architecture.technology_stack.language}
            Framework: ${analysis.technical_architecture.technology_stack.framework}
            Package Manager: ${analysis.technical_architecture.technology_stack.package_manager}
            Domain: ${analysis.project_overview.domain}
            
            Return JSON format:
            {
                "content": "name: CI/CD Pipeline\\non:\\n  push:\\n    ...",
                "features": ["Code Quality", "Testing", "Docker Build", "Security Scan"]
            }
            `),
    ]);

    try {
      const messages = await prompt.formatMessages({});
      const response = await this.llm.invoke(messages);
      const workflowData = this.extractJsonFromResponse<WorkflowContentDto>(response.content);
      return workflowData;
    } catch (error) {
      throw new HttpException(
        `Failed to generate GitHub workflow${error instanceof Error ? `: ${error.message}` : ''}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


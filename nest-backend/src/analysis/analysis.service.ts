import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RepositoryAnalyzerService } from '../services';
import { RepositoryRequestDto, AnalysisResponseDto } from '../common/dto';
import { AnalysisStatusDto, AnalysisTaskStatus } from '../common/dto/analysis-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisCacheService } from '../common/services/analysis-cache.service';

@Injectable()
export class AnalysisService implements OnModuleDestroy {
  private repositoryAnalyzer: RepositoryAnalyzerService | null = null;
  private taskStatusMap = new Map<string, AnalysisStatusDto>();

  constructor(
    private readonly repositoryAnalyzerService: RepositoryAnalyzerService,
    private readonly analysisCacheService: AnalysisCacheService,
  ) {}

  async startAnalysis(request: RepositoryRequestDto): Promise<string> {
    const taskId = uuidv4();
    // Initialize status
    this.taskStatusMap.set(taskId, {
      task_id: taskId,
      status: AnalysisTaskStatus.INITIALIZING,
      message: 'Initializing analyzer...',
      progress: 5,
      timestamp: new Date(),
    });

    // Kick off background analysis without blocking response
    void this.analyzeRepositoryWithTask(request, taskId);
    return taskId;
  }

  private async analyzeRepositoryWithTask(request: RepositoryRequestDto, taskId: string): Promise<void> {
    // Initialize repository analyzer
    this.repositoryAnalyzer = this.repositoryAnalyzerService;
    await this.repositoryAnalyzer.initializeMcp(request.github_token);

    try {
      const { owner, repo } = this.repositoryAnalyzer.parseRepoUrl(request.repo_url);
      this.taskStatusMap.set(taskId, {
        task_id: taskId,
        status: AnalysisTaskStatus.PARSING_URL,
        message: 'Parsing repository URL...',
        progress: 15,
        timestamp: new Date(),
      });

      this.taskStatusMap.set(taskId, {
        task_id: taskId,
        status: AnalysisTaskStatus.FETCHING_REPO,
        message: 'Fetching repository structure...',
        progress: 35,
        timestamp: new Date(),
      });

      const analysis = await this.repositoryAnalyzer.analyzeRepository(owner, repo);

      this.taskStatusMap.set(taskId, {
        task_id: taskId,
        status: AnalysisTaskStatus.LLM_ANALYSIS,
        message: 'Running AI analysis...',
        progress: 70,
        timestamp: new Date(),
      });

      // Completed
      this.taskStatusMap.set(taskId, {
        task_id: taskId,
        status: AnalysisTaskStatus.COMPLETED,
        message: 'Analysis completed',
        progress: 100,
        timestamp: new Date(),
      });

      // Ensure analysis_id & timestamp stored
      this.analysisCacheService.set(taskId, { ...analysis, analysis_id: taskId, timestamp: new Date() } as any);
      // Debug log
      // eslint-disable-next-line no-console
      console.log('[analysis] cached result for task', taskId);
    } catch (error) {
      this.taskStatusMap.set(taskId, {
        task_id: taskId,
        status: AnalysisTaskStatus.FAILED,
        message: (error as Error)?.message || 'Analysis failed',
        progress: 0,
        timestamp: new Date(),
      });
      // eslint-disable-next-line no-console
      console.error('[analysis] task failed', taskId, error);
    } finally {
      if (this.repositoryAnalyzer) {
        await this.repositoryAnalyzer.close();
      }
    }
  }

  getTaskStatus(taskId: string): AnalysisStatusDto | null {
    return this.taskStatusMap.get(taskId) || null;
  }

  async onModuleDestroy() {
    if (this.repositoryAnalyzer) {
      await this.repositoryAnalyzer.close();
    }
  }
}


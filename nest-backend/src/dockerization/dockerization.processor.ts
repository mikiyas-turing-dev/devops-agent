import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DockerizationAgentService, RepositoryAnalyzerService } from '../services';
import { DockerizationService } from './dockerization.service';
import { TaskStatus, AnalysisResponseDto } from '../common/dto';

interface DockerizationJobData {
  taskId: string;
  repoUrl: string;
  githubToken: string;
  analysisId: string;
  analysis: AnalysisResponseDto;
}

@Processor('dockerization')
export class DockerizationProcessor extends WorkerHost {
  private readonly logger = new Logger(DockerizationProcessor.name);

  constructor(
    private readonly dockerizationService: DockerizationService,
    private readonly dockerizationAgent: DockerizationAgentService,
    private readonly repositoryAnalyzer: RepositoryAnalyzerService,
  ) {
    super();
  }

  async process(job: Job<DockerizationJobData>): Promise<{ prUrl?: string }> {
    const { taskId, repoUrl, githubToken, analysis } = job.data;

    let agent: DockerizationAgentService | null = null;

    try {
      // Update status: Analyzing
      await job.updateProgress(10);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.ANALYZING,
        message: 'AI analyzing repository structure...',
        progress: 10,
      });

      // Parse repo URL
      const { owner, repo } = this.repositoryAnalyzer.parseRepoUrl(repoUrl);

      // Initialize dockerization agent with AI
      agent = this.dockerizationAgent;
      await agent.initializeMcp(githubToken);

      // Create branch
      await job.updateProgress(20);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.CREATING_BRANCH,
        message: 'Creating feature branch...',
        progress: 20,
      });

      const branch = await agent.createBranch(owner, repo);

      // AI-generated Docker files
      await job.updateProgress(40);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.DOCKERIZING,
        message: 'AI generating Docker configuration...',
        progress: 40,
      });

      await agent.createDockerfile(owner, repo, analysis, branch);
      await agent.createDockerCompose(owner, repo, analysis, branch);

      // AI-generated workflow
      await job.updateProgress(70);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.CREATING_WORKFLOW,
        message: 'AI setting up CI/CD pipeline...',
        progress: 70,
      });

      await agent.createGithubWorkflow(owner, repo, analysis, branch);

      // AI-generated Kubernetes manifests
      await job.updateProgress(80);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.CREATING_K8S,
        message: 'AI generating Kubernetes manifests...',
        progress: 80,
      });

      await agent.createKubernetesConfigs(owner, repo, analysis, branch);

      // Create pull request with AI description
      await job.updateProgress(90);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.CREATING_PR,
        message: 'AI creating pull request...',
        progress: 90,
      });

      const prUrl = await agent.createPullRequest(owner, repo, branch, analysis, githubToken);

      // Complete
      await job.updateProgress(100);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.COMPLETED,
        message: 'AI dockerization completed successfully!',
        progress: 100,
        pr_url: prUrl,
        timestamp: new Date(),
      });

      return { prUrl };
    } catch (error) {
      this.logger.error(`Dockerization failed for task ${taskId}:`, error as Error);
      this.dockerizationService.updateTaskStatusFromProcessor(taskId, {
        status: TaskStatus.FAILED,
        message: (error as Error)?.message || 'AI dockerization failed',
        progress: 0,
        timestamp: new Date(),
      });
      throw error;
    } finally {
      if (agent) {
        await agent.close();
      }
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error);
  }
}


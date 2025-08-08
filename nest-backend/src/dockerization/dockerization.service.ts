import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import {
  DockerizeRequestDto,
  AnalysisResponseDto,
  DockerizationStatusDto,
  TaskStatus,
} from '../common/dto';

@Injectable()
export class DockerizationService implements OnModuleInit {
  private taskStatusMap = new Map<string, DockerizationStatusDto>();

  constructor(
    @InjectQueue('dockerization') private dockerizationQueue: Queue,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Event listeners are now handled in the processor
    // This keeps the service focused on task management
  }

  async startDockerization(
    request: DockerizeRequestDto,
    analysis: AnalysisResponseDto,
  ): Promise<string> {
    const taskId = uuidv4();

    // Initialize task status
    const initialStatus: DockerizationStatusDto = {
      task_id: taskId,
      status: TaskStatus.PENDING,
      message: 'AI dockerization task queued',
      progress: 0,
      timestamp: new Date(),
    };

    this.taskStatusMap.set(taskId, initialStatus);

    // Add job to queue
    await this.dockerizationQueue.add(
      'dockerize-repository',
      {
        taskId,
        repoUrl: request.repo_url,
        githubToken: request.github_token,
        openaiApiKey: this.configService.get('OPENAI_API_KEY'),
        analysisId: request.analysis_id,
        analysis,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return taskId;
  }

  async getTaskStatus(taskId: string): Promise<DockerizationStatusDto | null> {
    return this.taskStatusMap.get(taskId) || null;
  }

  private updateTaskStatus(taskId: string, updates: Partial<DockerizationStatusDto>) {
    const existingStatus = this.taskStatusMap.get(taskId);
    if (existingStatus) {
      const updatedStatus = {
        ...existingStatus,
        ...updates,
        task_id: taskId, // Ensure task_id is preserved
        timestamp: updates.timestamp || existingStatus.timestamp,
      };
      this.taskStatusMap.set(taskId, updatedStatus);
    }
  }

  // Method to update status from processor
  updateTaskStatusFromProcessor(taskId: string, updates: Partial<DockerizationStatusDto>) {
    this.updateTaskStatus(taskId, updates);
  }
}


export interface RepositoryRequest {
  repo_url: string;
  github_token: string;
}

export interface TechnologyStack {
  framework?: string;
  language: string;
  database?: string;
  runtime?: string;
  package_manager?: string;
  dependencies: string[];
}

export interface SystemArchitecture {
  architecture_type: string;
  modules: string[];
  key_features: string[];
  patterns: string[];
}

export interface TechnicalArchitecture {
  technology_stack: TechnologyStack;
  system_architecture: SystemArchitecture;
}

export interface ProjectOverview {
  name: string;
  description: string;
  purpose: string;
  domain?: string;
  complexity_score: number;
}

export interface AnalysisResponse {
  project_overview: ProjectOverview;
  technical_architecture: TechnicalArchitecture;
  analysis_id: string;
  timestamp: string;
}

export interface AnalysisStatus {
  task_id: string;
  status: 'initializing' | 'parsing_url' | 'fetching_repo' | 'llm_analysis' | 'completed' | 'failed';
  message: string;
  progress: number;
  timestamp: string;
}

export enum TaskStatus {
  PENDING = "pending",
  ANALYZING = "analyzing",
  DOCKERIZING = "dockerizing",
  CREATING_BRANCH = "creating_branch",
  CREATING_WORKFLOW = "creating_workflow",
  CREATING_PR = "creating_pr",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface DockerizationStatus {
  task_id: string;
  status: TaskStatus;
  message: string;
  progress: number;
  pr_url?: string;
  timestamp: string;
}

export interface DockerizeRequest {
  repo_url: string;
  github_token: string;
  analysis_id: string;
}
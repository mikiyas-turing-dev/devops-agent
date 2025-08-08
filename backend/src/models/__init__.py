from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RepositoryRequest(BaseModel):
    repo_url: HttpUrl
    github_token: str

class TechnologyStack(BaseModel):
    framework: Optional[str] = None
    language: str
    database: Optional[str] = None
    runtime: Optional[str] = None
    package_manager: Optional[str] = None
    dependencies: List[str] = []

class SystemArchitecture(BaseModel):
    architecture_type: str
    modules: List[str] = []
    key_features: List[str] = []
    patterns: List[str] = []

class TechnicalArchitecture(BaseModel):
    technology_stack: TechnologyStack
    system_architecture: SystemArchitecture

class ProjectOverview(BaseModel):
    name: str
    description: str
    purpose: str
    domain: Optional[str] = None
    complexity_score: int  # 1-10

class AnalysisResponse(BaseModel):
    project_overview: ProjectOverview
    technical_architecture: TechnicalArchitecture
    analysis_id: str
    timestamp: datetime

class TaskStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    DOCKERIZING = "dockerizing"
    CREATING_BRANCH = "creating_branch"
    CREATING_WORKFLOW = "creating_workflow"
    CREATING_PR = "creating_pr"
    COMPLETED = "completed"
    FAILED = "failed"

class DockerizationStatus(BaseModel):
    task_id: str
    status: TaskStatus
    message: str
    progress: int  # 0-100
    pr_url: Optional[str] = None
    timestamp: datetime

class DockerizeRequest(BaseModel):
    repo_url: str
    github_token: str
    analysis_id: str

class DockerfileContent(BaseModel):
    content: str
    explanation: str

class DockerComposeContent(BaseModel):
    content: str
    services: List[str]

class WorkflowContent(BaseModel):
    content: str
    features: List[str]
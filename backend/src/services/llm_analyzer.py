from fastapi import HTTPException
from typing import Dict, Any
import json
import uuid
from datetime import datetime
import dotenv
import os
dotenv.load_dotenv()
# LangChain for intelligent analysis and generation
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate

from ..models import (
    AnalysisResponse, ProjectOverview, TechnicalArchitecture,
    DockerfileContent, DockerComposeContent, WorkflowContent
)


class LLMAnalyzer:
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="openrouter/horizon-beta",
            temperature=0.1,
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )
    
    async def analyze_repository_intelligence(self, repo_structure: Dict, file_contents: Dict, repo_name: str) -> AnalysisResponse:
        """Use LLM to intelligently analyze repository"""
        
        # Create analysis prompt

        analysis_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an expert software architect and DevOps engineer. 
            Analyze the provided repository structure and files to extract:
            1. Project Overview (name, description, purpose, domain, complexity 1-10)
            2. Technology Stack (framework, language, database, runtime, package_manager, dependencies)
            3. System Architecture (type, modules, patterns, key_features)
            
            CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. 
            Your response must start with { and end with } and be valid JSON."""),
            
            HumanMessage(content=f"""
            Repository Name: {repo_name}
            Repository Structure: {json.dumps(repo_structure, indent=2)}
            
            Key Files Content: {json.dumps(file_contents, indent=2)}
            
            Please analyze this repository and return a JSON response with this exact structure:
            {{
                "project_overview": {{
                    "name": "{repo_name}",
                    "description": "detailed description from README or analysis",
                    "purpose": "main purpose of the application",
                    "domain": "Backend/API or Frontend/Web or Mobile or IoT/Hardware or AI/ML or Gaming or General Software",
                    "complexity_score": 1-10
                }},
                "technical_architecture": {{
                    "technology_stack": {{
                        "framework": "detected framework or null",
                        "language": "primary programming language",
                        "database": "detected database or null", 
                        "runtime": "runtime environment",
                        "package_manager": "package manager used",
                        "dependencies": ["All dependencies"]
                    }},
                    "system_architecture": {{
                        "architecture_type": "Monolithic or Microservices or Modular or Layered",
                        "modules": ["detected modules/components"],
                        "key_features": ["main features of the system"],
                        "patterns": ["architectural patterns used"]
                    }}
                }}
            }}
            """)
        ])
        
        # Get LLM response
        response = await self.llm.ainvoke(analysis_prompt.format_messages())
        
        try:
            if not response.content or response.content.strip() == "":
                raise HTTPException(status_code=500, detail="LLM returned empty response")
            
            # Extract JSON from markdown code blocks if present
            content = response.content.strip()
            if content.startswith("```json") and content.endswith("```"):
                content = content[7:-3].strip()  # Remove ```json and ```
            elif content.startswith("```") and content.endswith("```"):
                content = content[3:-3].strip()   # Remove ``` and ```
            
            analysis_data = json.loads(content)
            
            # Create structured response
            project_overview = ProjectOverview(**analysis_data["project_overview"])
            technical_architecture = TechnicalArchitecture(**analysis_data["technical_architecture"])
            
            analysis_id = str(uuid.uuid4())
            return AnalysisResponse(
                project_overview=project_overview,
                technical_architecture=technical_architecture,
                analysis_id=analysis_id,
                timestamp=datetime.now()
            )
            
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"LLM response parsing failed: {str(e)}")
    
    async def generate_dockerfile(self, analysis: AnalysisResponse) -> DockerfileContent:
        """Generate Dockerfile using LLM"""
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are a Docker expert. Generate production-ready, multi-stage Dockerfiles.
            Create optimized Dockerfiles with:
            - Multi-stage builds (development and production)
            - Security best practices (non-root user)
            - Health checks
            - Proper dependency management
            - Technology-specific optimizations
            
            Return JSON with 'content' (the Dockerfile) and 'explanation' (brief description)."""),
            
            HumanMessage(content=f"""
            Generate a Dockerfile for this project:
            
            Language: {analysis.technical_architecture.technology_stack.language}
            Framework: {analysis.technical_architecture.technology_stack.framework}
            Runtime: {analysis.technical_architecture.technology_stack.runtime}
            Package Manager: {analysis.technical_architecture.technology_stack.package_manager}
            Dependencies: {analysis.technical_architecture.technology_stack.dependencies}
            
            Project: {analysis.project_overview.name}
            Domain: {analysis.project_overview.domain}
            
            Return JSON format:
            {{
                "content": "# Multi-stage Dockerfile content here...",
                "explanation": "Brief explanation of the Dockerfile"
            }}
            """)
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            dockerfile_data = json.loads(response.content)
            return DockerfileContent(**dockerfile_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to generate Dockerfile")
    
    async def generate_docker_compose(self, analysis: AnalysisResponse) -> DockerComposeContent:
        """Generate docker-compose.yml using LLM"""
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are a Docker Compose expert. Generate production-ready docker-compose.yml files.
            Include:
            - Main application service
            - Database service (if needed)
            - Redis for caching
            - Proper networking
            - Health checks
            - Environment variables
            - Volume management
            
            Return JSON with 'content' (docker-compose.yml) and 'services' (list of services)."""),
            
            HumanMessage(content=f"""
            Generate docker-compose.yml for:
            
            Project: {analysis.project_overview.name}
            Language: {analysis.technical_architecture.technology_stack.language}
            Framework: {analysis.technical_architecture.technology_stack.framework}
            Database: {analysis.technical_architecture.technology_stack.database}
            Domain: {analysis.project_overview.domain}
            
            Return JSON format:
            {{
                "content": "version: '3.8'\\nservices:\\n  app:\\n    ...",
                "services": ["app", "database", "redis"]
            }}
            """)
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            compose_data = json.loads(response.content)
            return DockerComposeContent(**compose_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to generate docker-compose.yml")
    
    async def generate_github_workflow(self, analysis: AnalysisResponse) -> WorkflowContent:
        """Generate GitHub Actions workflow using LLM"""
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are a CI/CD expert. Generate comprehensive GitHub Actions workflows.
            Include:
            - Code quality checks (linting, formatting)
            - Testing (unit, integration)
            - Security scanning
            - Docker builds
            - Multi-platform support
            - Deployment stages
            
            Return JSON with 'content' (workflow YAML) and 'features' (list of features)."""),
            
            HumanMessage(content=f"""
            Generate GitHub Actions workflow for:
            
            Project: {analysis.project_overview.name}
            Language: {analysis.technical_architecture.technology_stack.language}
            Framework: {analysis.technical_architecture.technology_stack.framework}
            Package Manager: {analysis.technical_architecture.technology_stack.package_manager}
            Domain: {analysis.project_overview.domain}
            
            Return JSON format:
            {{
                "content": "name: CI/CD Pipeline\\non:\\n  push:\\n    ...",
                "features": ["Code Quality", "Testing", "Docker Build", "Security Scan"]
            }}
            """)
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            workflow_data = json.loads(response.content)
            return WorkflowContent(**workflow_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to generate GitHub workflow")

from datetime import datetime

from ..models import TaskStatus, DockerizationStatus
from ..services import RepositoryAnalyzer, DockerizationAgent


async def dockerize_repository_task(
    task_id: str,
    repo_url: str,
    github_token: str,
    openai_api_key: str,
    analysis_id: str,
    task_status: dict,
    analysis_cache: dict
):
    """Background task to dockerize repository using AI"""
    
    agent = None
    try:
        # Update status
        task_status[task_id].status = TaskStatus.ANALYZING
        task_status[task_id].message = "AI analyzing repository structure..."
        task_status[task_id].progress = 10
        
        # Get analysis
        analysis = analysis_cache[analysis_id]
        
        # Parse repo URL
        analyzer = RepositoryAnalyzer(github_token, openai_api_key)
        owner, repo = analyzer.parse_repo_url(repo_url)
        
        # Initialize dockerization agent with AI
        agent = DockerizationAgent(github_token, openai_api_key, owner, repo)
        await agent.initialize_mcp()
        
        # Create branch
        task_status[task_id].status = TaskStatus.CREATING_BRANCH
        task_status[task_id].message = "Creating feature branch..."
        task_status[task_id].progress = 20
        
        branch = await agent.create_branch()
        
        # AI-generated Docker files
        task_status[task_id].status = TaskStatus.DOCKERIZING
        task_status[task_id].message = "AI generating Docker configuration..."
        task_status[task_id].progress = 40
        
        await agent.create_dockerfile(analysis, branch)
        await agent.create_docker_compose(analysis, branch)
        
        # AI-generated workflow
        task_status[task_id].status = TaskStatus.CREATING_WORKFLOW
        task_status[task_id].message = "AI setting up CI/CD pipeline..."
        task_status[task_id].progress = 70
        
        await agent.create_github_workflow(analysis, branch)
        
        # Create pull request with AI description
        task_status[task_id].status = TaskStatus.CREATING_PR
        task_status[task_id].message = "AI creating pull request..."
        task_status[task_id].progress = 90
        
        pr_url = await agent.create_pull_request(branch, analysis)
        
        # Complete
        task_status[task_id].status = TaskStatus.COMPLETED
        task_status[task_id].message = "AI dockerization completed successfully!"
        task_status[task_id].progress = 100
        task_status[task_id].pr_url = pr_url
        task_status[task_id].timestamp = datetime.now()
        
    except Exception as e:
        task_status[task_id].status = TaskStatus.FAILED
        task_status[task_id].message = f"AI dockerization failed: {str(e)}"
        task_status[task_id].progress = 0
        task_status[task_id].timestamp = datetime.now()
    finally:
        if agent:
            await agent.close()

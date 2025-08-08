from fastapi import FastAPI, HTTPException, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import services
from .services import RepositoryAnalyzer
from .utils import dockerize_repository_task

app = FastAPI(
    title="AI-Powered Repository Dockerization Agent",
    description="Automatically analyze and dockerize GitHub repositories using AI",
    version="2.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import models
from .models import (
    RepositoryRequest, AnalysisResponse, DockerizationStatus, 
    TaskStatus, DockerizeRequest
)

# In-memory storage (use Redis/DB in production)
analysis_cache: Dict[str, AnalysisResponse] = {}
task_status: Dict[str, DockerizationStatus] = {}

# API Endpoints

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_repository(request: RepositoryRequest):
    """Analyze a GitHub repository using AI intelligence"""
    
    # Get API keys from environment
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    analyzer = None
    try:
        # Initialize analyzer with AI capabilities
        analyzer = RepositoryAnalyzer(request.github_token, openai_api_key)
        await analyzer.initialize_mcp()
        
        # Parse repository URL
        owner, repo = analyzer.parse_repo_url(str(request.repo_url))
        
        # AI-powered repository analysis
        analysis = await analyzer.analyze_repository(owner, repo)
        
        # Cache the analysis
        analysis_cache[analysis.analysis_id] = analysis
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if analyzer:
            await analyzer.close()

@app.post("/dockerize")
async def start_dockerization(
    background_tasks: BackgroundTasks,
    repo_url: str = Form(None),
    github_token: str = Form(None),
    analysis_id: str = Form(None),
    request: DockerizeRequest = None
):
    """Start the AI-powered dockerization process"""
    
    # Handle both form data and JSON request
    if request is None:
        # Form data submission
        if not all([repo_url, github_token, analysis_id]):
            raise HTTPException(status_code=422, detail="Missing required fields: repo_url, github_token, analysis_id")
        final_repo_url = repo_url
        final_github_token = github_token
        final_analysis_id = analysis_id
    else:
        # JSON request submission
        final_repo_url = request.repo_url
        final_github_token = request.github_token
        final_analysis_id = request.analysis_id
    
    # Validate analysis exists
    if final_analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found. Please run analysis first.")
    
    # Check OpenAI API key
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    # Initialize task status
    task_status[task_id] = DockerizationStatus(
        task_id=task_id,
        status=TaskStatus.PENDING,
        message="AI dockerization task queued",
        progress=0,
        timestamp=datetime.now()
    )
    
    # Start background task
    background_tasks.add_task(
        dockerize_repository_task,
        task_id,
        final_repo_url,
        final_github_token,
        openai_api_key,
        final_analysis_id,
        task_status,
        analysis_cache
    )
    
    return {"task_id": task_id, "status": "started"}

@app.get("/status/{task_id}", response_model=DockerizationStatus)
async def get_dockerization_status(task_id: str):
    """Get the status of a dockerization task"""
    
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_status[task_id]

# Background task is now imported from utils

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AI-Powered Repository Dockerization Agent",
        "version": "2.0.0",
        "description": "Automatically analyze and dockerize GitHub repositories using AI",
        "features": [
            "LangChain + OpenAI powered analysis",
            "Intelligent file generation",
            "Smart CI/CD pipeline creation",
            "Scalable architecture detection"
        ],
        "endpoints": {
            "analyze": "POST /analyze - AI repository analysis",
            "dockerize": "POST /dockerize - AI dockerization process",
            "status": "GET /status/{task_id} - Task status"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "healthy",
        "ai_configured": openai_configured,
        "timestamp": datetime.now()
    }

@app.get("/debug/analyses")
async def list_analyses():
    """Debug endpoint to list all cached analyses"""
    return {
        "cached_analyses": list(analysis_cache.keys()),
        "count": len(analysis_cache)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
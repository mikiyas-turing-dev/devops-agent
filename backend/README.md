# AI-Powered DevOps Agent Backend

An intelligent FastAPI backend service that uses **OpenAI GPT-4** and **LangChain** to analyze GitHub repositories, detects technology stacks, and generates Docker configurations with CI/CD pipelines.

## 🤖 AI Features

- **🧠 Intelligent Repository Analysis**: AI-powered analysis of code structure, dependencies, and architecture patterns
- **📝 Smart File Generation**: LLM-generated Dockerfiles, docker-compose.yml, and GitHub Actions workflows
- **🎯 Context-Aware Solutions**: Tailored configurations based on detected frameworks and project complexity
- **📚 Comprehensive Documentation**: AI-generated pull request descriptions and setup instructions
- **🔍 Multi-Language Support**: Intelligent detection and optimization for various programming languages

## Quick Start

### Prerequisites

1. **OpenAI API Key**: Required for AI-powered analysis and file generation
2. **Python 3.11+**: For running the FastAPI application

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Copy environment file and configure
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Manual Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"

# Run the application
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### POST /analyze
Analyze a GitHub repository and return project overview and technical architecture.

**Request Body:**
```json
{
  "repo_url": "https://github.com/owner/repo",
  "github_token": "your_github_token"
}
```

**Response:**
```json
{
  "project_overview": {
    "name": "repo-name",
    "description": "Project description",
    "purpose": "Application purpose",
    "domain": "Backend/API",
    "complexity_score": 7
  },
  "technical_architecture": {
    "technology_stack": {
      "language": "Python",
      "framework": "FastAPI",
      "database": "PostgreSQL",
      "runtime": "Python",
      "package_manager": "pip",
      "dependencies": ["fastapi", "uvicorn", "pydantic"]
    },
    "system_architecture": {
      "architecture_type": "Monolithic",
      "modules": ["main.py", "models.py"],
      "key_features": ["REST API"],
      "patterns": ["MVC"]
    }
  },
  "analysis_id": "uuid",
  "timestamp": "2024-01-01T00:00:00"
}
```

### POST /dockerize
Start the dockerization process for a previously analyzed repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/owner/repo",
  "github_token": "your_github_token",
  "analysis_id": "uuid-from-analyze-endpoint"
}
```

### GET /status/{task_id}
Get the status of a dockerization task.

**Response:**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "message": "Dockerization completed successfully!",
  "progress": 100,
  "pr_url": "https://github.com/owner/repo/pull/123",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Architecture

```
backend/
├── src/
│   ├── main.py                 # FastAPI application
│   ├── models/                 # Pydantic models
│   │   └── __init__.py
│   ├── services/               # Business logic
│   │   ├── repository_analyzer.py
│   │   ├── dockerization_agent.py
│   │   └── __init__.py
│   └── utils/                  # Utility functions
├── tests/                      # Test files
├── requirements.txt            # Dependencies
├── Dockerfile                  # Container configuration
├── docker-compose.yml          # Multi-service setup
└── README.md                   # Documentation
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Application environment | `development` |
| `APP_PORT` | Application port | `8000` |
| `GITHUB_TOKEN` | GitHub API token | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

## 🛠 Technology Stack

- **Framework**: FastAPI
- **Language**: Python 3.11
- **AI/LLM**: OpenAI GPT-4 via LangChain
- **GitHub Integration**: MCP-Use (Model Context Protocol)
- **Validation**: Pydantic
- **HTTP Client**: httpx
- **Containerization**: Docker
- **Cache**: Redis

## 🧠 AI Architecture

- **LangChain**: Orchestrates AI workflows and prompt management
- **OpenAI GPT-4**: Powers intelligent analysis and file generation
- **MCP-Use**: Provides secure GitHub API access through MCP
- **Structured Outputs**: Pydantic models ensure consistent AI responses

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
python -m pytest tests/
```

### Code Quality

```bash
# Install development dependencies
pip install black flake8 mypy

# Format code
black src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

## Health Check

The application includes a health check endpoint at `/health` for monitoring.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
# 🚀 NestJS AI-Powered DevOps Agent Backend

An intelligent NestJS backend service that uses **OpenAI GPT-4** and **LangChain** to analyze GitHub repositories, detects technology stacks, and generates Docker configurations with CI/CD pipelines.

## 🤖 AI Features

- **🧠 Intelligent Repository Analysis**: AI-powered analysis of code structure, dependencies, and architecture patterns
- **📝 Smart File Generation**: LLM-generated Dockerfiles, docker-compose.yml, and GitHub Actions workflows  
- **🎯 Context-Aware Solutions**: Tailored configurations based on detected frameworks and project complexity
- **📚 Comprehensive Documentation**: AI-generated pull request descriptions and setup instructions
- **🔍 Multi-Language Support**: Intelligent detection and optimization for various programming languages
- **⚡ Background Processing**: Asynchronous task processing with BullMQ and Redis

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **AI/LLM**: OpenAI GPT-4 via LangChain
- **Background Jobs**: BullMQ with Redis
- **GitHub Integration**: MCP-Use (Model Context Protocol)
- **Validation**: class-validator and class-transformer
- **Containerization**: Docker with multi-stage builds

## 🚀 Quick Start

### Prerequisites

1. **OpenAI API Key**: Required for AI-powered analysis
2. **Node.js 20+**: For running the NestJS application
3. **Redis**: For background job processing

### Using Docker (Recommended)

```bash
# Clone and navigate to the project
cd nest-backend

# Copy and configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export REDIS_URL="redis://localhost:6379"

# Start Redis (if not using Docker)
redis-server

# Run in development mode
npm run start:dev
```

## 📡 API Endpoints

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
      "language": "TypeScript",
      "framework": "NestJS",
      "database": "PostgreSQL",
      "runtime": "Node.js",
      "package_manager": "npm",
      "dependencies": ["@nestjs/core", "@nestjs/common", "rxjs"]
    },
    "system_architecture": {
      "architecture_type": "Modular",
      "modules": ["app.module.ts", "user.module.ts"],
      "key_features": ["REST API", "Authentication"],
      "patterns": ["Dependency Injection", "Decorator Pattern"]
    }
  },
  "analysis_id": "uuid",
  "timestamp": "2024-01-01T00:00:00Z"
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

**Response:**
```json
{
  "task_id": "uuid",
  "status": "started"
}
```

### GET /status/{task_id}
Get the status of a dockerization task.

**Response:**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "message": "AI dockerization completed successfully!",
  "progress": 100,
  "pr_url": "https://github.com/owner/repo/pull/123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Other Endpoints

- **GET /** - API information and feature list
- **GET /health** - Health check with AI service status
- **GET /debug/analyses** - List cached analyses (development)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Application port | `8000` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

## 🧪 Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
tsc --noEmit
```

## 📦 Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🐳 Docker

### Build Images

```bash
# Development
docker build --target development -t nest-devops-agent:dev .

# Production
docker build --target production -t nest-devops-agent:prod .
```

### Environment Configuration

Create a `.env` file:
```env
NODE_ENV=development
PORT=8000
OPENAI_API_KEY=your_openai_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🚀 Deployment

### Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   ```bash
   export NODE_ENV=production
   export OPENAI_API_KEY=your_production_key
   export REDIS_URL=your_production_redis_url
   ```

3. **Start the application:**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

```bash
# Build production image
docker build --target production -t nest-devops-agent .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Security

- Environment-based configuration
- Input validation with class-validator
- Secure Docker containers with non-root users
- API rate limiting (configure as needed)

## 📊 Monitoring

- Health check endpoint: `/health`
- Application logs via NestJS logger
- BullMQ job monitoring
- Redis connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License


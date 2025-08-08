import uuid
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

# MCP imports with correct pattern
from mcp_use import MCPAgent, MCPClient

from ..models import AnalysisResponse
from .llm_analyzer import LLMAnalyzer
import dotenv
import os
dotenv.load_dotenv()

class DockerizationAgent:
    def __init__(self, github_token: str, openai_api_key: str, owner: str, repo: str):
        self.github_token = github_token
        self.owner = owner
        self.repo = repo
        self.mcp_client = None
        self.mcp_agent = None
        self.llm_analyzer = LLMAnalyzer(openai_api_key)

    async def initialize_mcp(self):
        """Initialize MCP client using correct pattern"""
        try:
            # Create configuration dictionary for GitHub MCP server
            config = {
                "mcpServers": {
                    "github": {
                        "command": "docker",
                        "args": [
                            "run",
                            "-i",
                            "--rm",
                            "-e",
                            "GITHUB_PERSONAL_ACCESS_TOKEN",
                            "ghcr.io/github/github-mcp-server"
                        ],
                        "env": {
                            "GITHUB_PERSONAL_ACCESS_TOKEN": self.github_token
                        }
                    }
                }
            }
            
            # Create MCPClient from configuration dictionary
            self.mcp_client = MCPClient.from_dict(config)
            
            # Create LLM for the agent (configured via environment, no hardcoded keys)
            llm = ChatOpenAI(
                model="openai/gpt-4o-mini",
                temperature=0.1,
                api_key=os.getenv("OPENROUTER_API_KEY"),
                base_url="https://openrouter.ai/api/v1",
            )
        
            
            # Create agent with the client
            self.mcp_agent = MCPAgent(llm=llm, client=self.mcp_client, max_steps=20)
            
        except Exception as e:
            raise Exception(f"Failed to initialize MCP: {str(e)}")

    async def get_default_branch(self) -> str:
        """Get the default branch of the repository"""
        try:
            query = f"Get the default branch name for the GitHub repository {self.owner}/{self.repo}"
            result = await self.mcp_agent.run(query)
            # Parse result to extract branch name, defaulting to 'main' if unclear
            if 'main' in str(result).lower():
                return 'main'
            elif 'master' in str(result).lower():
                return 'master'
            else:
                return 'main'
        except:
            return 'main'

    async def create_branch(self, branch_name: str = None) -> str:
        """Create a new branch with unique name"""
        try:
            # Generate unique branch name if not provided
            if not branch_name:
                unique_id = str(uuid.uuid4())[:8]
                branch_name = f"feature/dockerize-and-ci-{unique_id}"
            
            # Get default branch
            default_branch = await self.get_default_branch()
            
            # Create branch using MCP agent
            query = f"Create a new branch named '{branch_name}' in the GitHub repository {self.owner}/{self.repo} based on the '{default_branch}' branch"
            result = await self.mcp_agent.run(query)
            
            return branch_name
        except Exception as e:
            raise Exception(f"Failed to create branch: {str(e)}")

    async def create_dockerfile(self, analysis: AnalysisResponse, branch: str) -> str:
        """Generate and create Dockerfile using LLM"""
        
        dockerfile = await self.llm_analyzer.generate_dockerfile(analysis)
        
        # Create file using MCP agent
        query = f"Create or update a file named 'Dockerfile' in the GitHub repository {self.owner}/{self.repo} on branch '{branch}' with the following content:\n\n{dockerfile.content}\n\nUse the commit message: 'feat: Add AI-generated multi-stage Dockerfile with production optimization'"
        
        await self.mcp_agent.run(query)
        
        return f"Dockerfile created: {dockerfile.explanation}"

    async def create_docker_compose(self, analysis: AnalysisResponse, branch: str) -> str:
        """Create docker-compose.yml using LLM"""
        
        compose = await self.llm_analyzer.generate_docker_compose(analysis)
        
        # Create file using MCP agent
        query = f"Create or update a file named 'docker-compose.yml' in the GitHub repository {self.owner}/{self.repo} on branch '{branch}' with the following content:\n\n{compose.content}\n\nUse the commit message: 'feat: Add AI-generated docker-compose.yml with integrated services'"
        
        await self.mcp_agent.run(query)
        
        return f"docker-compose.yml created with services: {', '.join(compose.services)}"

    async def create_github_workflow(self, analysis: AnalysisResponse, branch: str) -> str:
        """Create GitHub Actions workflow using LLM"""
        
        workflow = await self.llm_analyzer.generate_github_workflow(analysis)
        
        # Create workflow file using MCP agent
        query = f"Create or update a file at path '.github/workflows/ci-cd.yml' in the GitHub repository {self.owner}/{self.repo} on branch '{branch}' with the following content:\n\n{workflow.content}\n\nUse the commit message: 'feat: Add AI-generated comprehensive GitHub Actions CI/CD workflow'"
        
        await self.mcp_agent.run(query)
        
        return f"GitHub workflow created with features: {', '.join(workflow.features)}"

    async def create_pull_request(self, branch: str, analysis: AnalysisResponse) -> str:
        """Create pull request with AI-generated description"""
        
        # Use LLM to generate PR description
        pr_prompt = f"""
Create a comprehensive pull request description for dockerization of {analysis.project_overview.name}.

Project Details:
- Language: {analysis.technical_architecture.technology_stack.language}
- Framework: {analysis.technical_architecture.technology_stack.framework}
- Domain: {analysis.project_overview.domain}
- Complexity: {analysis.project_overview.complexity_score}/10

Include:
- Executive summary
- Technical details added
- Setup instructions
- Benefits of containerization
"""
        
        pr_response = await self.llm_analyzer.llm.ainvoke([
            SystemMessage(content="You are a technical writer. Create professional PR descriptions."),
            HumanMessage(content=pr_prompt)
        ])
        
        title = f"🐳 feat: Add AI-powered Docker support and CI/CD pipeline for {analysis.project_overview.name}"
        
        body = f"""## 🚀 AI-Powered Dockerization and CI/CD Implementation

{pr_response.content}

### 📊 Project Analysis
- **Name:** {analysis.project_overview.name}
- **Purpose:** {analysis.project_overview.purpose}
- **Domain:** {analysis.project_overview.domain}
- **Language:** {analysis.technical_architecture.technology_stack.language}
- **Framework:** {analysis.technical_architecture.technology_stack.framework or "N/A"}
- **Complexity:** {analysis.project_overview.complexity_score}/10

### 🤖 AI-Generated Assets
- ✅ **Intelligent Dockerfile** - Multi-stage, security-optimized
- ✅ **Smart docker-compose.yml** - Service orchestration
- ✅ **Advanced CI/CD workflow** - Complete automation pipeline

---
*This PR was automatically generated by AI-powered Repository Dockerization Agent*
"""

        try:
            # Get default branch
            default_branch = await self.get_default_branch()
            
            # Create pull request using MCP agent
            query = f"Create a pull request in the GitHub repository {self.owner}/{self.repo} with title '{title}' from branch '{branch}' to '{default_branch}' with the following description:\n\n{body}"
            
            result = await self.mcp_agent.run(query)
            
            # Extract URL from result (this is a simplified approach)
            result_str = str(result)
            if "github.com" in result_str and "pull" in result_str:
                # Try to extract the PR URL from the result
                import re
                url_match = re.search(r'https://github\.com/[^/]+/[^/]+/pull/\d+', result_str)
                if url_match:
                    return url_match.group(0)
            
            return f"https://github.com/{self.owner}/{self.repo}/pulls"  # Fallback URL
            
        except Exception as e:
            raise Exception(f"Failed to create pull request: {str(e)}")

    async def close(self):
        """Close connections"""
        if self.mcp_client:
            try:
                await self.mcp_client.close()
            except:
                pass

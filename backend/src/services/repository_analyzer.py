from fastapi import HTTPException
from typing import Dict, Any
import re
from langchain_openai import ChatOpenAI
import dotenv
import os
dotenv.load_dotenv()
# MCP imports with correct pattern
from mcp_use import MCPAgent, MCPClient

from ..models import AnalysisResponse
from .llm_analyzer import LLMAnalyzer


class RepositoryAnalyzer:
    def __init__(self, github_token: str, openai_api_key: str):
        self.github_token = github_token
        self.mcp_client = None
        self.mcp_agent = None
        self.llm_analyzer = LLMAnalyzer(openai_api_key)
    
    async def initialize_mcp(self):
        """Initialize MCP client with GitHub server using correct pattern"""
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
            
            # Create LLM for the agent
            llm =  ChatOpenAI(
            model="openrouter/horizon-beta",
            temperature=0.1,
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )
            
            # Create agent with the client
            self.mcp_agent = MCPAgent(llm=llm, client=self.mcp_client, max_steps=10)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize MCP: {str(e)}")

    def parse_repo_url(self, repo_url: str) -> tuple[str, str]:
        """Extract owner and repo from GitHub URL"""
        pattern = r"github\.com/([^/]+)/([^/]+)(?:\.git)?/?$"
        match = re.search(pattern, str(repo_url))
        if not match:
            raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")
        return match.group(1), match.group(2).rstrip('.git')

    async def get_repository_structure(self, owner: str, repo: str) -> Dict[str, Any]:
        """Get comprehensive repository structure using MCP agent"""
        try:
            # Use MCP agent to get repository structure
            structure_query = f"Get the file structure and contents of the GitHub repository {owner}/{repo}. Focus on getting the root directory structure and the contents of important configuration files like package.json, requirements.txt, Cargo.toml, pom.xml, build.gradle, composer.json, go.mod, Pipfile, README.md, README.rst, tsconfig.json, next.config.js, angular.json, vue.config.js, nuxt.config.js."
            
            result = await self.mcp_agent.run(structure_query)
            
            # Parse the result to extract structure and key files
            # For now, return a structured format that the LLM analyzer can work with
            return {
                "structure": str(result),  # The MCP agent result contains the structure
                "key_files": {},  # Will be populated from the agent result
                "repo_name": repo,
                "owner": owner,
                "raw_result": result
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch repository: {str(e)}")

    async def analyze_repository(self, owner: str, repo: str) -> AnalysisResponse:
        """Analyze repository using LLM intelligence"""
        
        # Get repository structure and files
        repo_data = await self.get_repository_structure(owner, repo)
        
        # Use LLM for intelligent analysis
        analysis = await self.llm_analyzer.analyze_repository_intelligence(
            repo_data["structure"], 
            repo_data["key_files"],
            repo_data["repo_name"]
        )
        
        return analysis

    async def close(self):
        """Close connections"""
        if self.mcp_client:
            try:
                await self.mcp_client.close()
            except:
                pass

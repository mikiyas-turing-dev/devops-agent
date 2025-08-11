import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { Octokit } from '@octokit/rest';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
// Using dynamic import for mcp-use due to ES module compatibility
let MCPAgent: any, MCPClient: any;
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { AnalysisResponseDto, KubernetesConfigsDto } from '../common/dto';
import { LlmAnalyzerService } from './llm-analyzer.service';

@Injectable()
export class DockerizationAgentService {
  private mcpClient: any = null;
  private mcpAgent: any = null;

  constructor(private llmAnalyzer: LlmAnalyzerService, private configService: ConfigService) {}

  async initializeMcp(githubToken: string): Promise<void> {
    try {
      // Dynamic import for ES module compatibility
      if (!MCPAgent || !MCPClient) {
        try {
          const mcpModule = await eval('import("mcp-use")');
          MCPAgent = mcpModule.MCPAgent;
          MCPClient = mcpModule.MCPClient;
        } catch (error) {
          throw new Error(`Failed to import mcp-use: ${error.message}`);
        }
      }
      // Create configuration dictionary for GitHub MCP server
      const config = {
        mcpServers: {
          github: {
            command: 'docker',
            args: [
              'run',
              '-i',
              '--rm',
              '-e',
              'GITHUB_PERSONAL_ACCESS_TOKEN',
              'ghcr.io/github/github-mcp-server',
            ],
            env: {
              GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
            },
          },
        },
      };

      // Create MCPClient from configuration dictionary
      this.mcpClient = MCPClient.fromDict(config);
  const modelApiKey = this.configService.get('MODEL_API_KEY');
  const model = this.configService.get<string>('MODEL') || 'openai/gpt-4o-mini';

      // Create LLM for the agent
      const llm = new ChatOpenAI({
        model,
        temperature: 0.1,
  apiKey: modelApiKey,
        configuration: {
  baseURL: this.configService.get<string>('MODEL_BASE_URL') || 'https://openrouter.ai/api/v1',
        },
      });

      // Create agent with the client
      this.mcpAgent = new MCPAgent({ llm, client: this.mcpClient, maxSteps: 20 });
    } catch (error) {
      throw new HttpException(
        `Failed to initialize MCP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    try {
      if (!this.mcpAgent) {
        throw new Error('MCP agent not initialized');
      }

      const query = `Get the default branch name for the GitHub repository ${owner}/${repo}`;
      const result = await this.mcpAgent.run(query);
      
      // Parse result to extract branch name, defaulting to 'main' if unclear
      const resultStr = String(result).toLowerCase();
      if (resultStr.includes('main')) {
        return 'main';
      } else if (resultStr.includes('master')) {
        return 'master';
      } else {
        return 'main';
      }
    } catch (error) {
      return 'main';
    }
  }

  async createBranch(owner: string, repo: string, branchName?: string): Promise<string> {
    try {
      if (!this.mcpAgent) {
        throw new Error('MCP agent not initialized');
      }

      // Generate unique branch name if not provided
      if (!branchName) {
        const uniqueId = uuidv4().substring(0, 8);
        branchName = `feature/dockerize-and-ci-${uniqueId}`;
      }

      // Get default branch
      const defaultBranch = await this.getDefaultBranch(owner, repo);

      // Create branch using MCP agent
      const query = `Create a new branch named '${branchName}' in the GitHub repository ${owner}/${repo} based on the '${defaultBranch}' branch`;
      await this.mcpAgent.run(query);

      return branchName;
    } catch (error) {
      throw new HttpException(
        `Failed to create branch: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createDockerfile(
    owner: string,
    repo: string,
    analysis: AnalysisResponseDto,
    branch: string,
  ): Promise<string> {
    if (!this.mcpAgent) {
      throw new Error('MCP agent not initialized');
    }

    const dockerfile = await this.llmAnalyzer.generateDockerfile(analysis);

    // Create file using MCP agent
    const query = `Create or update a file named 'Dockerfile' in the GitHub repository ${owner}/${repo} on branch '${branch}' with the following content:

${dockerfile.content}

Use the commit message: 'feat: Add AI-generated multi-stage Dockerfile with production optimization'`;

    await this.mcpAgent.run(query);

    return `Dockerfile created: ${dockerfile.explanation}`;
  }

  async createDockerCompose(
    owner: string,
    repo: string,
    analysis: AnalysisResponseDto,
    branch: string,
  ): Promise<string> {
    if (!this.mcpAgent) {
      throw new Error('MCP agent not initialized');
    }

    const compose = await this.llmAnalyzer.generateDockerCompose(analysis);

    // Create file using MCP agent
    const query = `Create or update a file named 'docker-compose.yml' in the GitHub repository ${owner}/${repo} on branch '${branch}' with the following content:

${compose.content}

Use the commit message: 'feat: Add AI-generated docker-compose.yml with integrated services'`;

    await this.mcpAgent.run(query);

    return `docker-compose.yml created with services: ${compose.services.join(', ')}`;
  }

  async createGithubWorkflow(
    owner: string,
    repo: string,
    analysis: AnalysisResponseDto,
    branch: string,
  ): Promise<string> {
    if (!this.mcpAgent) {
      throw new Error('MCP agent not initialized');
    }

    const workflow = await this.llmAnalyzer.generateGithubWorkflow(analysis);

    // Create workflow file using MCP agent
    const query = `Create or update a file at path '.github/workflows/ci-cd.yml' in the GitHub repository ${owner}/${repo} on branch '${branch}' with the following content:

${workflow.content}

Use the commit message: 'feat: Add AI-generated comprehensive GitHub Actions CI/CD workflow'`;

    await this.mcpAgent.run(query);

    return `GitHub workflow created with features: ${workflow.features.join(', ')}`;
  }

  async createKubernetesConfigs(
    owner: string,
    repo: string,
    analysis: AnalysisResponseDto,
    branch: string,
  ): Promise<string> {
    if (!this.mcpAgent) {
      throw new Error('MCP agent not initialized');
    }

    const k8s: KubernetesConfigsDto = await this.llmAnalyzer.generateKubernetesConfigs(analysis);

    // Ensure base directory path and commit each file
    for (const item of k8s.items || []) {
      const normalizedPath = item.path.startsWith('k8s/') ? item.path : `k8s/${item.path}`;
      const query = `Create or update a file at path '${normalizedPath}' in the GitHub repository ${owner}/${repo} on branch '${branch}' with the following content:

${item.content}

Use the commit message: 'feat: Add AI-generated Kubernetes manifest ${normalizedPath}'`;
      await this.mcpAgent.run(query);
    }

    return `Kubernetes configs created: ${k8s.items?.map(i => i.path).join(', ') || 'none'}`;
  }

  async createPullRequest(
    owner: string,
    repo: string,
    branch: string,
    analysis: AnalysisResponseDto,
    githubToken: string,
  ): Promise<string> {
    if (!this.mcpAgent) {
      throw new Error('MCP agent not initialized');
    }

    // Use LLM to generate PR description
  const modelApiKey = this.configService.get('MODEL_API_KEY');
  const model = this.configService.get<string>('MODEL') || 'openai/gpt-4o-mini';
    const llm = new ChatOpenAI({
      model,
      temperature: 0.1,
  apiKey: modelApiKey,
      configuration: {
  baseURL: this.configService.get<string>('MODEL_BASE_URL') || 'https://openrouter.ai/api/v1',
      },
    });

    const prPrompt = `
Create a comprehensive pull request description for dockerization of ${analysis.project_overview.name}.

Project Details:
- Language: ${analysis.technical_architecture.technology_stack.language}
- Framework: ${analysis.technical_architecture.technology_stack.framework}
- Domain: ${analysis.project_overview.domain}
- Complexity: ${analysis.project_overview.complexity_score}/10

Include:
- Executive summary
- Technical details added
- Setup instructions
- Benefits of containerization`;

    const prResponse = await llm.invoke([
      new SystemMessage('You are a technical writer. Create professional PR descriptions.'),
      new HumanMessage(prPrompt),
    ]);

    const title = `🐳 feat: Add AI-powered Docker support and CI/CD pipeline for ${analysis.project_overview.name}`;

    const body = `## 🚀 AI-Powered Dockerization, CI/CD, and Kubernetes Manifests

${prResponse.content}

### 📊 Project Analysis
- **Name:** ${analysis.project_overview.name}
- **Purpose:** ${analysis.project_overview.purpose}
- **Domain:** ${analysis.project_overview.domain}
- **Language:** ${analysis.technical_architecture.technology_stack.language}
- **Framework:** ${analysis.technical_architecture.technology_stack.framework || 'N/A'}
- **Complexity:** ${analysis.project_overview.complexity_score}/10

### 🤖 AI-Generated Assets
- ✅ **Intelligent Dockerfile** — Multi-stage, security-optimized
- ✅ **Smart docker-compose.yml** — Service orchestration
- ✅ **Advanced CI/CD workflow** — Complete automation pipeline
- ✅ **Kubernetes manifests** — Namespace, Deployment, Service, optional Ingress, and config scaffolding

---
*This PR was automatically generated by AI-powered Repository Dockerization Agent*`;

    try {
      // Prefer Octokit for reliable PR creation
      const octokit = new Octokit({ auth: githubToken });

      // Determine default branch using API (fallback to 'main')
      let defaultBranch = 'main';
      try {
        const repoInfo = await octokit.repos.get({ owner, repo });
        defaultBranch = repoInfo.data.default_branch || 'main';
      } catch {
        // ignore and use fallback 'main'
      }

      const pr = await octokit.pulls.create({
        owner,
        repo,
        head: branch,
        base: defaultBranch,
        title,
        body,
      });

      return pr.data.html_url || `https://github.com/${owner}/${repo}/pulls`;
    } catch (primaryError) {
      // Fallback to MCP-based PR creation if Octokit fails
      try {
        const defaultBranch = await this.getDefaultBranch(owner, repo);
        const query = `Create a pull request in the GitHub repository ${owner}/${repo} with title '${title}' from branch '${branch}' to '${defaultBranch}' with the following description:\n\n${body}`;
        const result = await this.mcpAgent.run(query);
        const resultStr = String(result);
        const urlMatch = resultStr.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/);
        if (urlMatch) {
          return urlMatch[0];
        }
        return `https://github.com/${owner}/${repo}/pulls`;
      } catch (fallbackError) {
        const message = primaryError instanceof Error ? primaryError.message : String(primaryError);
        throw new HttpException(
          `Failed to create pull request via API and MCP: ${message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async close(): Promise<void> {
    if (this.mcpClient) {
      try {
        // MCPClient cleanup if needed
        this.mcpClient = null;
        this.mcpAgent = null;
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }
}

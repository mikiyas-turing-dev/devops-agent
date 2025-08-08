import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
// Using dynamic import for mcp-use due to ES module compatibility
let MCPAgent: any, MCPClient: any;

import { AnalysisResponseDto } from '../common/dto';
import { LlmAnalyzerService } from './llm-analyzer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RepositoryAnalyzerService {
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

      const openrouterApiKey = this.configService.get('OPENROUTER_API_KEY');

      const llm = new ChatOpenAI({
        model: 'openai/gpt-4o-mini',
        temperature: 0.1,
        apiKey: openrouterApiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
        },
      });


      // Create agent with the client
      this.mcpAgent = new MCPAgent({ llm, client: this.mcpClient, maxSteps: 10 });
    } catch (error) {
      throw new HttpException(
        `Failed to initialize MCP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
    const pattern = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?\/?$/;
    const match = repoUrl.match(pattern);
    if (!match) {
      throw new HttpException('Invalid GitHub repository URL', HttpStatus.BAD_REQUEST);
    }
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }

  async getRepositoryStructure(owner: string, repo: string): Promise<any> {
    try {
      if (!this.mcpAgent) {
        throw new Error('MCP agent not initialized');
      }

      // Use MCP agent to get repository structure
      const structureQuery = `Get the file structure and contents of the GitHub repository ${owner}/${repo}. Focus on getting the root directory structure and the contents of important configuration files like package.json, requirements.txt, Cargo.toml, pom.xml, build.gradle, composer.json, go.mod, Pipfile, README.md, README.rst, tsconfig.json, next.config.js, angular.json, vue.config.js, nuxt.config.js.`;

      const result = await this.mcpAgent.run(structureQuery);

      // Parse the result to extract structure and key files
      return {
        structure: String(result), // The MCP agent result contains the structure
        key_files: {}, // Will be populated from the agent result
        repo_name: repo,
        owner: owner,
        raw_result: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch repository: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeRepository(owner: string, repo: string): Promise<AnalysisResponseDto> {
    // Get repository structure and files
    const repoData = await this.getRepositoryStructure(owner, repo);

    // Use LLM for intelligent analysis
    const analysis = await this.llmAnalyzer.analyzeRepositoryIntelligence(
      repoData.structure,
      repoData.key_files,
      repoData.repo_name,
    );

    return analysis;
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

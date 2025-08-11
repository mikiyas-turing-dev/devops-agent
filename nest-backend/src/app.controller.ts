import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getRoot() {
    return {
      name: "AI-Powered Repository Dockerization Agent",
      version: "2.0.0",
      description: "Automatically analyze and dockerize GitHub repositories using AI",
      features: [
        "LangChain + OpenRouter powered analysis",
        "Intelligent file generation",
        "Smart CI/CD pipeline creation",
        "Scalable architecture detection"
      ],
      endpoints: {
        analyze: "POST /analyze - AI repository analysis",
        dockerize: "POST /dockerize - AI dockerization process",
        status: "GET /status/{task_id} - Task status"
      }
    };
  }

  @Get('health')
  async healthCheck() {
  const openaiConfigured = !!this.configService.get('MODEL_API_KEY');
    return {
      status: 'healthy',
      ai_configured: openaiConfigured,
      timestamp: new Date(),
    };
  }
}

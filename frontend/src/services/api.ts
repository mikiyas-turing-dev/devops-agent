import axios from 'axios';
import { RepositoryRequest, AnalysisResponse, DockerizationStatus, DockerizeRequest, AnalysisStatus } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async analyzeRepository(request: RepositoryRequest): Promise<AnalysisResponse> {
    const response = await api.post<AnalysisResponse>('/analyze', request);
    return response.data;
  },

  async startDockerization(request: DockerizeRequest): Promise<{ task_id: string; status: string }> {
    const params = new URLSearchParams({
      repo_url: request.repo_url,
      github_token: request.github_token,
      analysis_id: request.analysis_id,
    });
    
    const response = await api.post<{ task_id: string; status: string }>('/dockerize', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async getDockerizationStatus(taskId: string): Promise<DockerizationStatus> {
    const response = await api.get<DockerizationStatus>(`/status/${taskId}`);
    return response.data;
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  },

  async getAnalysisStatus(taskId: string): Promise<AnalysisStatus> {
    const response = await api.get<AnalysisStatus>(`/analysis/status/${taskId}`);
    return response.data;
  },

  async getAnalysisResult(taskId: string): Promise<AnalysisResponse> {
    const response = await api.get<AnalysisResponse>(`/analysis/result/${taskId}`);
    return response.data;
  },
};

export default apiService;
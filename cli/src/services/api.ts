
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import chalk from 'chalk';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.get('baseUrl'),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use((config: any) => {
      const token = this.config.get('token');
      if (token) {
        config.data = { ...config.data, token };
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          console.error(chalk.red('Authentication failed. Please check your token.'));
          process.exit(1);
        }
        return Promise.reject(error);
      }
    );
  }

  private get config() {
    return config;
  }

  async validateToken(token: string): Promise<APIResponse> {
    try {
      const response = await this.client.post('/validate-personal-token', {
        token,
        requiredPermissions: ['cli:execute']
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async callAgent(agentId: number, task: string, sessionId?: string, context?: any): Promise<APIResponse> {
    try {
      const token = config.get('token');
      
      // Map agent IDs to their respective endpoints
      const agentEndpoints: { [key: number]: string } = {
        9: '/build-optimizer-agent',
        11: '/cloud-ops-agent',
        13: '/project-analyzer-agent'
      };

      const endpoint = agentEndpoints[agentId];
      if (!endpoint) {
        return { success: false, error: `Unknown agent ID: ${agentId}` };
      }

      const payload: any = {
        task,
        token,
        session_id: sessionId
      };

      // Add context for BuildOptimizer
      if (agentId === 9 && context) {
        payload.context = context;
      }

      const response = await this.client.post(endpoint, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async callArchMaster(message: string, sessionId?: string): Promise<APIResponse> {
    try {
      const token = config.get('token');
      const llmMode = config.get('defaultLLM') === 'custom' ? 'custom' : 'codexi';
      
      const response = await this.client.post('/archmaster-agent', {
        message,
        token,
        llm_mode: llmMode,
        session_id: sessionId
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
}

export const api = new APIService();

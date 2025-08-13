
import axios, { AxiosInstance, AxiosResponse } from 'axios';
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
    this.client.interceptors.request.use((config) => {
      const token = this.config.get('token');
      if (token) {
        config.data = { ...config.data, token };
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
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

  async callArchMaster(message: string, sessionId?: string): Promise<APIResponse> {
    try {
      const token = config.get('token');
      const response = await this.client.post('/archmaster-agent', {
        message,
        token,
        llm_mode: 'codexi',
        session_id: sessionId
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async callAgent(agentId: number, task: string, context?: string): Promise<APIResponse> {
    try {
      const token = config.get('token');
      const agentEndpoints: Record<number, string> = {
        1: 'code-architect-agent',
        2: 'frontend-master-agent',
        3: 'backend-forge-agent',
        4: 'debug-wizard-agent',
        5: 'doc-crafter-agent',
        6: 'test-sentinel-agent',
        7: 'config-master-agent',
        8: 'data-designer-agent',
        9: 'security-guard-agent',
        10: 'api-connector-agent',
        11: 'cloud-ops-agent',
        12: 'performance-optimizer-agent',
        13: 'project-analyzer-agent',
        14: 'resource-manager-agent',
        15: 'monitoring-agent',
        16: 'migration-specialist-agent',
        17: 'custom-agent-builder',
        18: 'simulation-engine-agent',
        19: 'validation-core'
      };

      const endpoint = agentEndpoints[agentId];
      if (!endpoint) {
        return { success: false, error: `Invalid agent ID: ${agentId}` };
      }

      const response = await this.client.post(`/${endpoint}`, {
        task,
        token,
        context,
        llm_mode: 'codexi'
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async getAgentRegistry(): Promise<APIResponse> {
    try {
      const token = config.get('token');
      const response = await this.client.post('/get-agent-registry', { token });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
}

export const api = new APIService();

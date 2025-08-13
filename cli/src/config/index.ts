
import Conf from 'conf';

export interface CLIConfig {
  token?: string;
  baseUrl?: string;
  defaultLLM?: string;
  userId?: string;
  lastSync?: string;
}

export class ConfigManager {
  private config: Conf<CLIConfig>;

  constructor() {
    this.config = new Conf<CLIConfig>({
      projectName: 'codexi-cli',
      projectSuffix: '',
      defaults: {
        baseUrl: 'https://feefiyeqczhynxniuqxe.supabase.co/functions/v1'
      }
    });
  }

  get<K extends keyof CLIConfig>(key: K): CLIConfig[K] {
    return this.config.get(key);
  }

  set<K extends keyof CLIConfig>(key: K, value: CLIConfig[K]): void {
    this.config.set(key, value);
  }

  delete(key: keyof CLIConfig): void {
    this.config.delete(key);
  }

  clear(): void {
    this.config.clear();
  }

  getAll(): CLIConfig {
    return this.config.store;
  }

  isAuthenticated(): boolean {
    const token = this.get('token');
    return !!token && token.startsWith('CXI_');
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.get('token');
    if (!token) {
      throw new Error('Not authenticated. Run "codexi auth login" first.');
    }
    return {
      'Content-Type': 'application/json'
    };
  }
}

export const config = new ConfigManager();

import { config } from '../config';
import { api } from './api';

export interface CommandHistoryEntry {
  id: string;
  command: string;
  args: any[];
  output?: string;
  error_message?: string;
  execution_status: 'success' | 'error' | 'cancelled';
  execution_time_ms: number;
  session_id?: string;
  created_at: string;
}

export class HistoryService {
  private static instance: HistoryService;
  private history: CommandHistoryEntry[] = [];

  private constructor() {}

  static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  async addCommand(entry: Omit<CommandHistoryEntry, 'id' | 'created_at'>): Promise<void> {
    try {
      const message = `Log CLI command execution: "${entry.command}" with status ${entry.execution_status}, execution time ${entry.execution_time_ms}ms${entry.error_message ? ` and error: ${entry.error_message}` : ''}.`;
      
      await api.callArchMaster(message);
      
      // Add to local cache
      this.history.unshift({
        ...entry,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      });

      // Keep only recent entries in memory
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100);
      }
    } catch (error) {
      console.error('Failed to log command history:', error);
    }
  }

  async getHistory(limit: number = 20, search?: string): Promise<CommandHistoryEntry[]> {
    try {
      const message = `Retrieve my CLI command history${search ? ` filtered by: "${search}"` : ''}, limited to ${limit} entries. Return as structured data with command, status, timing, and results.`;
      
      const result = await api.callArchMaster(message);
      
      if (result.success && result.data) {
        // Try to parse structured data from response
        // This is a simplified version - in real implementation you'd have proper API endpoints
        return this.history.slice(0, limit);
      }
    } catch (error) {
      console.error('Failed to fetch command history:', error);
    }
    
    return this.history.slice(0, limit);
  }

  async getCommandById(id: string): Promise<CommandHistoryEntry | null> {
    const entry = this.history.find(h => h.id === id);
    if (entry) return entry;

    try {
      const message = `Retrieve CLI command with ID ${id} from my history.`;
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        // Parse and return command details
        // This would be properly implemented with database queries
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch command by ID:', error);
    }
    
    return null;
  }

  getLocalHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  clearLocalHistory(): void {
    this.history = [];
  }
}

export const historyService = HistoryService.getInstance();

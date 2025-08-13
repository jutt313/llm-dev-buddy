import { config } from '../config';
import { api } from './api';

export interface CLISession {
  id: string;
  session_name?: string;
  status: 'active' | 'paused' | 'closed';
  last_command?: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export class SessionService {
  private static instance: SessionService;
  private currentSession: CLISession | null = null;
  private sessions: CLISession[] = [];

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async createSession(name?: string): Promise<CLISession> {
    try {
      const message = `Create a new CLI session${name ? ` named "${name}"` : ''} for managing conversation context and command history.`;
      
      const result = await api.callArchMaster(message);
      
      const newSession: CLISession = {
        id: result.data?.session_id || Date.now().toString(),
        session_name: name,
        status: 'active',
        context: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.currentSession = newSession;
      this.sessions.unshift(newSession);
      
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  async resumeSession(sessionId: string): Promise<CLISession | null> {
    try {
      const message = `Resume CLI session with ID ${sessionId}. Restore context and continue conversation.`;
      
      const result = await api.callArchMaster(message, sessionId);
      
      if (result.success) {
        const session = this.sessions.find(s => s.id === sessionId) || {
          id: sessionId,
          status: 'active' as const,
          context: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.currentSession = session;
        return session;
      }
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
    
    return null;
  }

  async listSessions(): Promise<CLISession[]> {
    try {
      const message = "List all my CLI sessions with their status, names, and last activity.";
      
      const result = await api.callArchMaster(message);
      
      if (result.success) {
        // In a real implementation, this would parse the structured response
        return this.sessions;
      }
    } catch (error) {
      console.error('Failed to list sessions:', error);
    }
    
    return this.sessions;
  }

  async updateSessionContext(sessionId: string, context: Record<string, any>): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      session.updated_at = new Date().toISOString();
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'closed';
      session.updated_at = new Date().toISOString();
    }

    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
  }

  getCurrentSession(): CLISession | null {
    return this.currentSession;
  }

  async clearSessions(): Promise<void> {
    try {
      const message = "Clear all my CLI session history but keep the current active session.";
      await api.callArchMaster(message);
      
      // Keep only current session
      if (this.currentSession) {
        this.sessions = [this.currentSession];
      } else {
        this.sessions = [];
      }
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }
}

export const sessionService = SessionService.getInstance();

import { DeviceIdentity } from './deviceIdentity';

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  isActive: boolean;
}

export interface SessionConfig {
  tokenLifetime: number; // milliseconds
  renewThreshold: number; // renew when this much time is left
  maxSessions: number; // max concurrent sessions per user
}

const DEFAULT_CONFIG: SessionConfig = {
  tokenLifetime: 30 * 24 * 60 * 60 * 1000, // 30 days
  renewThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSessions: 5
};

export class SessionManager {
  private currentSession: Session | null = null;
  private config: SessionConfig = DEFAULT_CONFIG;
  private renewalTimer: NodeJS.Timeout | null = null;
  private listeners: ((session: Session | null) => void)[] = [];

  /**
   * Create new session for user
   */
  async createSession(userId: string, deviceId: string): Promise<Session> {
    const token = this.generateToken();
    const now = Date.now();

    const session: Session = {
      id: this.generateSessionId(),
      userId,
      deviceId,
      token,
      createdAt: now,
      expiresAt: now + this.config.tokenLifetime,
      lastActivity: now,
      isActive: true
    };

    this.currentSession = session;
    this.startRenewalTimer();
    this.notifyListeners(session);

    return session;
  }

  /**
   * Load existing session
   */
  loadSession(session: Session): boolean {
    // Verify session is not expired
    if (this.isExpired(session)) {
      console.log('Session expired');
      return false;
    }

    this.currentSession = session;
    this.startRenewalTimer();
    this.notifyListeners(session);

    return true;
  }

  /**
   * Renew current session
   */
  async renewSession(): Promise<Session | null> {
    if (!this.currentSession) {
      return null;
    }

    const now = Date.now();
    
    // Generate new token
    const newToken = this.generateToken();
    
    this.currentSession = {
      ...this.currentSession,
      token: newToken,
      expiresAt: now + this.config.tokenLifetime,
      lastActivity: now
    };

    this.notifyListeners(this.currentSession);
    
    return this.currentSession;
  }

  /**
   * Update session activity
   */
  updateActivity() {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
      
      // Check if renewal is needed
      if (this.shouldRenew()) {
        this.renewSession();
      }
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.stopRenewalTimer();
      
      // Notify server to invalidate token
      await this.invalidateToken(this.currentSession.token);
      
      this.currentSession = null;
      this.notifyListeners(null);
    }
  }

  /**
   * Check if session is valid
   */
  isValid(): boolean {
    if (!this.currentSession) {
      return false;
    }

    return (
      this.currentSession.isActive &&
      !this.isExpired(this.currentSession)
    );
  }

  /**
   * Check if session is expired
   */
  private isExpired(session: Session): boolean {
    return Date.now() >= session.expiresAt;
  }

  /**
   * Check if session should be renewed
   */
  private shouldRenew(): boolean {
    if (!this.currentSession) {
      return false;
    }

    const timeRemaining = this.currentSession.expiresAt - Date.now();
    return timeRemaining < this.config.renewThreshold;
  }

  /**
   * Start automatic renewal timer
   */
  private startRenewalTimer() {
    this.stopRenewalTimer();
    
    // Check every hour if renewal is needed
    this.renewalTimer = setInterval(() => {
      if (this.shouldRenew()) {
        this.renewSession();
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Stop renewal timer
   */
  private stopRenewalTimer() {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
    }
  }

  /**
   * Generate session token
   */
  private generateToken(): string {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    
    return `${timestamp}.${random1}.${random2}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Invalidate token on server
   */
  private async invalidateToken(token: string): Promise<void> {
    // Would make API call to server to invalidate token
    console.log('Invalidating token:', token);
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Get session token
   */
  getToken(): string | null {
    return this.currentSession?.token || null;
  }

  /**
   * Get session user ID
   */
  getUserId(): string | null {
    return this.currentSession?.userId || null;
  }

  /**
   * Get time until expiration
   */
  getTimeUntilExpiration(): number {
    if (!this.currentSession) {
      return 0;
    }
    return Math.max(0, this.currentSession.expiresAt - Date.now());
  }

  /**
   * Get session age
   */
  getSessionAge(): number {
    if (!this.currentSession) {
      return 0;
    }
    return Date.now() - this.currentSession.createdAt;
  }

  /**
   * Get time since last activity
   */
  getTimeSinceActivity(): number {
    if (!this.currentSession) {
      return 0;
    }
    return Date.now() - this.currentSession.lastActivity;
  }

  /**
   * Update session configuration
   */
  updateConfig(config: Partial<SessionConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Listen for session changes
   */
  onSessionChange(callback: (session: Session | null) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(session: Session | null) {
    this.listeners.forEach(listener => listener(session));
  }

  /**
   * Cleanup on app shutdown
   */
  cleanup() {
    this.stopRenewalTimer();
  }
}

export default new SessionManager();

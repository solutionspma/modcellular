import SignalAggregator, { AggregatedConnection, SignalSource } from '../core/aggregation/signalAggregator';
import Router, { Packet } from '../core/routing/router';
import deviceIdentity from '../core/identity/deviceIdentity';
import sessionManager from '../core/identity/sessionManager';

export interface ModCellularConfig {
  serverUrl: string;
  apiKey?: string;
  enableMesh?: boolean;
  enableDTN?: boolean;
  enableRelay?: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  primarySource: SignalSource | null;
  backupSources: SignalSource[];
  bandwidth: number;
  latency: number;
  reliability: number;
}

export interface MessageOptions {
  priority?: 'high' | 'normal' | 'low';
  requiresAck?: boolean;
  maxRetries?: number;
}

export type ConnectionChangeCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (from: string, message: string) => void;

class ModCellularSDK {
  private config: ModCellularConfig | null = null;
  private aggregator: SignalAggregator | null = null;
  private router: Router | null = null;
  private initialized: boolean = false;
  private connectionListeners: ConnectionChangeCallback[] = [];
  private messageListeners: MessageReceivedCallback[] = [];

  /**
   * Initialize Mod Cellular SDK
   */
  async initialize(config: ModCellularConfig): Promise<void> {
    if (this.initialized) {
      console.warn('ModCellular SDK already initialized');
      return;
    }

    this.config = config;

    // Initialize device identity
    await deviceIdentity.initialize();
    const deviceId = deviceIdentity.getDeviceId();

    if (!deviceId) {
      throw new Error('Failed to initialize device identity');
    }

    // Initialize aggregator
    this.aggregator = new SignalAggregator(deviceId);
    await this.aggregator.initialize();

    // Initialize router
    this.router = new Router();

    // Listen for connection changes
    this.aggregator.onConnectionChange((connection) => {
      this.notifyConnectionListeners(connection);
    });

    this.initialized = true;
    console.log('Mod Cellular SDK initialized');
  }

  /**
   * Send message to user
   */
  async sendMessage(
    userId: string,
    message: string,
    options?: MessageOptions
  ): Promise<boolean> {
    this.ensureInitialized();

    const connection = this.aggregator!.getCurrentConnection();
    if (!connection) {
      throw new Error('No connection available');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const packet: Packet = {
      id: this.generatePacketId(),
      destination: userId,
      data,
      priority: options?.priority || 'normal',
      ttl: options?.maxRetries || 5,
      timestamp: Date.now(),
      requiresAck: options?.requiresAck ?? false
    };

    return await this.router!.routePacket(packet, connection);
  }

  /**
   * Start audio/video call
   */
  async startCall(
    userId: string,
    type: 'audio' | 'video' = 'audio'
  ): Promise<string> {
    this.ensureInitialized();

    // This would integrate with WebRTC for actual call
    // For now, return call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Starting ${type} call to ${userId}: ${callId}`);
    
    return callId;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    this.ensureInitialized();

    const connection = this.aggregator!.getCurrentConnection();
    
    if (!connection) {
      return {
        isConnected: false,
        primarySource: null,
        backupSources: [],
        bandwidth: 0,
        latency: 999,
        reliability: 0
      };
    }

    return {
      isConnected: true,
      primarySource: connection.primarySource,
      backupSources: connection.backupSources,
      bandwidth: connection.totalBandwidth,
      latency: connection.effectiveLatency,
      reliability: connection.reliability
    };
  }

  /**
   * Get available signal sources
   */
  getAvailableSources(): SignalSource[] {
    this.ensureInitialized();
    return this.aggregator!.getAvailableSources();
  }

  /**
   * Enable/disable mesh relay
   */
  setRelayEnabled(enabled: boolean): void {
    this.ensureInitialized();
    // Would update mesh relay settings
    console.log(`Mesh relay ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get device identity
   */
  getDeviceId(): string | null {
    return deviceIdentity.getDeviceId();
  }

  /**
   * Listen for connection changes
   */
  onConnectionChange(callback: ConnectionChangeCallback): () => void {
    this.connectionListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Listen for incoming messages
   */
  onMessageReceived(callback: MessageReceivedCallback): () => void {
    this.messageListeners.push(callback);
    
    return () => {
      this.messageListeners = this.messageListeners.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Shutdown SDK
   */
  shutdown(): void {
    if (!this.initialized) return;

    this.aggregator?.shutdown();
    sessionManager.cleanup();
    
    this.initialized = false;
    console.log('Mod Cellular SDK shutdown');
  }

  // Private methods

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('ModCellular SDK not initialized. Call initialize() first.');
    }
  }

  private notifyConnectionListeners(connection: AggregatedConnection): void {
    const status: ConnectionStatus = {
      isConnected: true,
      primarySource: connection.primarySource,
      backupSources: connection.backupSources,
      bandwidth: connection.totalBandwidth,
      latency: connection.effectiveLatency,
      reliability: connection.reliability
    };

    this.connectionListeners.forEach(listener => listener(status));
  }

  private generatePacketId(): string {
    return `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
const ModCellular = new ModCellularSDK();
export default ModCellular;

// Export types
export type { ModCellularConfig, ConnectionStatus, MessageOptions };
export { SignalSource, AggregatedConnection };

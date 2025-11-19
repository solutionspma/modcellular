import { MeshPeer } from '../scanners/meshScanner';

export interface MeshMessage {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  payload: Uint8Array;
  hops: string[]; // Device IDs of relay nodes
  maxHops: number;
  timestamp: number;
  ttl: number; // Time to live in seconds
}

export interface RelayNode {
  deviceId: string;
  peer: MeshPeer;
  messagesRelayed: number;
  bandwidth: number;
  isReliable: boolean;
}

export class MeshRelay {
  private deviceId: string;
  private relayEnabled: boolean = true;
  private messageCache: Map<string, MeshMessage> = new Map();
  private relayNodes: Map<string, RelayNode> = new Map();
  private listeners: ((message: MeshMessage) => void)[] = [];
  private maxMessageAge = 300000; // 5 minutes

  constructor(deviceId: string) {
    this.deviceId = deviceId;
    this.startCacheCleanup();
  }

  /**
   * Relay a message through the mesh network
   */
  async relayMessage(message: MeshMessage, peers: MeshPeer[]): Promise<boolean> {
    // Check if message already processed (prevent loops)
    if (this.hasProcessed(message.id)) {
      return false;
    }

    // Check if message expired
    if (this.isExpired(message)) {
      return false;
    }

    // Check if max hops reached
    if (message.hops.length >= message.maxHops) {
      console.log(`Message ${message.id} reached max hops`);
      return false;
    }

    // Add this device to hop chain
    message.hops.push(this.deviceId);

    // Cache message to prevent re-processing
    this.cacheMessage(message);

    // Check if this device is the target
    if (message.targetDeviceId === this.deviceId) {
      this.deliverMessage(message);
      return true;
    }

    // Find next relay node
    const nextRelay = this.selectNextRelay(message, peers);
    if (!nextRelay) {
      console.log(`No relay available for message ${message.id}`);
      return false;
    }

    // Forward message to next relay
    try {
      await this.forwardMessage(message, nextRelay);
      this.recordRelay(nextRelay.deviceId);
      return true;
    } catch (error) {
      console.error('Message relay failed:', error);
      return false;
    }
  }

  /**
   * Select best next relay node
   */
  private selectNextRelay(
    message: MeshMessage,
    peers: MeshPeer[]
  ): MeshPeer | null {
    // Filter out peers already in hop chain (prevent loops)
    const availablePeers = peers.filter(peer => 
      !message.hops.includes(peer.deviceId) &&
      peer.isDirectConnection &&
      peer.relayCapable
    );

    if (availablePeers.length === 0) return null;

    // Score peers based on:
    // 1. Signal strength
    // 2. Number of hops to target (if known)
    // 3. Relay reliability
    const scoredPeers = availablePeers.map(peer => {
      let score = peer.rssi; // Base on signal strength
      
      const relayNode = this.relayNodes.get(peer.deviceId);
      if (relayNode) {
        score += relayNode.isReliable ? 20 : 0;
        score += Math.min(relayNode.messagesRelayed, 50); // Reward experience
      }

      return { peer, score };
    });

    // Select highest scoring peer
    scoredPeers.sort((a, b) => b.score - a.score);
    return scoredPeers[0].peer;
  }

  /**
   * Forward message to next relay node
   */
  private async forwardMessage(
    message: MeshMessage,
    relay: MeshPeer
  ): Promise<void> {
    // This would send via Bluetooth/BLE to the relay peer
    // Implementation depends on BLE characteristic writes
    console.log(`Forwarding message ${message.id} to ${relay.name}`);
    
    // Simulate transmission delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Deliver message to local application
   */
  private deliverMessage(message: MeshMessage) {
    console.log(`Message ${message.id} delivered to ${this.deviceId}`);
    this.notifyListeners(message);
  }

  /**
   * Check if message already processed
   */
  private hasProcessed(messageId: string): boolean {
    return this.messageCache.has(messageId);
  }

  /**
   * Cache message to prevent re-processing
   */
  private cacheMessage(message: MeshMessage) {
    this.messageCache.set(message.id, message);
  }

  /**
   * Check if message has expired
   */
  private isExpired(message: MeshMessage): boolean {
    const age = Date.now() - message.timestamp;
    return age > message.ttl * 1000;
  }

  /**
   * Record successful relay
   */
  private recordRelay(deviceId: string) {
    const node = this.relayNodes.get(deviceId);
    if (node) {
      node.messagesRelayed++;
      node.isReliable = node.messagesRelayed > 5;
    }
  }

  /**
   * Update relay nodes from mesh peers
   */
  updateRelayNodes(peers: MeshPeer[]) {
    peers.forEach(peer => {
      if (!this.relayNodes.has(peer.deviceId)) {
        this.relayNodes.set(peer.deviceId, {
          deviceId: peer.deviceId,
          peer,
          messagesRelayed: 0,
          bandwidth: peer.bandwidth || 500,
          isReliable: false
        });
      } else {
        // Update peer info
        const node = this.relayNodes.get(peer.deviceId)!;
        node.peer = peer;
      }
    });

    // Remove stale nodes
    const peerIds = new Set(peers.map(p => p.deviceId));
    for (const deviceId of this.relayNodes.keys()) {
      if (!peerIds.has(deviceId)) {
        this.relayNodes.delete(deviceId);
      }
    }
  }

  /**
   * Enable/disable relay functionality
   */
  setRelayEnabled(enabled: boolean) {
    this.relayEnabled = enabled;
  }

  isRelayEnabled(): boolean {
    return this.relayEnabled;
  }

  /**
   * Get relay statistics
   */
  getRelayStats() {
    const totalRelayed = Array.from(this.relayNodes.values())
      .reduce((sum, node) => sum + node.messagesRelayed, 0);
    
    return {
      totalRelayed,
      activeRelays: this.relayNodes.size,
      cacheSize: this.messageCache.size
    };
  }

  /**
   * Clean up old messages from cache
   */
  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [id, message] of this.messageCache.entries()) {
        if (now - message.timestamp > this.maxMessageAge) {
          this.messageCache.delete(id);
        }
      }
    }, 60000); // Clean every minute
  }

  onMessageReceived(callback: (message: MeshMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(message: MeshMessage) {
    this.listeners.forEach(listener => listener(message));
  }

  cleanup() {
    this.messageCache.clear();
    this.relayNodes.clear();
  }
}

export default MeshRelay;

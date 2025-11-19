// Delay-Tolerant Networking (DTN) Layer
// Store-and-forward messaging for disconnected environments

export interface DTNMessage {
  id: string;
  source: string;
  destination: string;
  payload: Uint8Array;
  priority: number; // 0-10, higher = more important
  created: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  requiresAck: boolean;
  ackReceived: boolean;
  metadata?: Record<string, any>;
}

export interface DTNBundle {
  messages: DTNMessage[];
  totalSize: number;
  priority: number;
}

export interface StorageStats {
  messageCount: number;
  totalBytes: number;
  oldestMessage: number;
  newestMessage: number;
}

const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50 MB
const DEFAULT_MESSAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_RETRY_ATTEMPTS = 10;

export class DelayTolerantLayer {
  private messageStore: Map<string, DTNMessage> = new Map();
  private pendingAcks: Set<string> = new Set();
  private deliveredMessages: Set<string> = new Set();
  private listeners: ((message: DTNMessage) => void)[] = [];
  private currentStorageSize: number = 0;

  /**
   * Store message for later delivery
   */
  storeMessage(
    source: string,
    destination: string,
    payload: Uint8Array,
    options?: {
      priority?: number;
      ttl?: number;
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    }
  ): string {
    const message: DTNMessage = {
      id: this.generateMessageId(),
      source,
      destination,
      payload,
      priority: options?.priority ?? 5,
      created: Date.now(),
      expiresAt: Date.now() + (options?.ttl ?? DEFAULT_MESSAGE_TTL),
      attempts: 0,
      maxAttempts: MAX_RETRY_ATTEMPTS,
      requiresAck: options?.requiresAck ?? false,
      ackReceived: false,
      metadata: options?.metadata
    };

    // Check storage limits
    if (!this.hasStorageSpace(payload.length)) {
      this.evictOldMessages(payload.length);
    }

    this.messageStore.set(message.id, message);
    this.currentStorageSize += payload.length;

    if (message.requiresAck) {
      this.pendingAcks.add(message.id);
    }

    return message.id;
  }

  /**
   * Retrieve messages ready for transmission
   */
  getMessagesForTransmission(maxCount: number = 10): DTNMessage[] {
    const now = Date.now();
    
    return Array.from(this.messageStore.values())
      .filter(msg => 
        !msg.ackReceived &&
        msg.attempts < msg.maxAttempts &&
        msg.expiresAt > now
      )
      .sort((a, b) => {
        // Sort by priority (descending), then by age (ascending)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.created - b.created;
      })
      .slice(0, maxCount);
  }

  /**
   * Create bundle of messages for opportunistic transmission
   */
  createBundle(maxSize: number): DTNBundle {
    const messages = this.getMessagesForTransmission();
    const bundle: DTNBundle = {
      messages: [],
      totalSize: 0,
      priority: 0
    };

    for (const message of messages) {
      if (bundle.totalSize + message.payload.length <= maxSize) {
        bundle.messages.push(message);
        bundle.totalSize += message.payload.length;
        bundle.priority = Math.max(bundle.priority, message.priority);
      }

      if (bundle.totalSize >= maxSize * 0.9) break; // 90% full
    }

    return bundle;
  }

  /**
   * Record transmission attempt
   */
  recordAttempt(messageId: string, success: boolean) {
    const message = this.messageStore.get(messageId);
    if (!message) return;

    message.attempts++;

    if (success) {
      if (!message.requiresAck) {
        // If no ACK required, consider it delivered
        this.markDelivered(messageId);
      }
    } else if (message.attempts >= message.maxAttempts) {
      // Max attempts reached, give up
      console.warn(`Message ${messageId} failed after ${message.attempts} attempts`);
      this.removeMessage(messageId);
    }
  }

  /**
   * Receive acknowledgment for message
   */
  receiveAck(messageId: string) {
    const message = this.messageStore.get(messageId);
    if (message) {
      message.ackReceived = true;
      this.pendingAcks.delete(messageId);
      this.markDelivered(messageId);
    }
  }

  /**
   * Receive incoming DTN message
   */
  receiveMessage(message: DTNMessage) {
    // Check if already delivered
    if (this.deliveredMessages.has(message.id)) {
      return;
    }

    // Store and notify
    this.deliveredMessages.add(message.id);
    this.notifyListeners(message);

    // Send ACK if required
    if (message.requiresAck) {
      this.sendAck(message.id, message.source);
    }
  }

  private sendAck(messageId: string, destination: string) {
    // Send ACK back to source
    // This would be implemented by higher layer
    console.log(`Sending ACK for ${messageId} to ${destination}`);
  }

  private markDelivered(messageId: string) {
    this.deliveredMessages.add(messageId);
    this.removeMessage(messageId);
  }

  private removeMessage(messageId: string) {
    const message = this.messageStore.get(messageId);
    if (message) {
      this.currentStorageSize -= message.payload.length;
      this.messageStore.delete(messageId);
      this.pendingAcks.delete(messageId);
    }
  }

  /**
   * Clean up expired messages
   */
  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, message] of this.messageStore.entries()) {
      if (message.expiresAt <= now) {
        this.removeMessage(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Evict old low-priority messages to make space
   */
  private evictOldMessages(requiredSpace: number) {
    const messages = Array.from(this.messageStore.values())
      .filter(msg => !this.pendingAcks.has(msg.id)) // Don't evict pending ACKs
      .sort((a, b) => {
        // Evict low priority first, then oldest
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.created - b.created;
      });

    let freedSpace = 0;
    for (const message of messages) {
      this.removeMessage(message.id);
      freedSpace += message.payload.length;
      
      if (freedSpace >= requiredSpace) break;
    }
  }

  private hasStorageSpace(size: number): boolean {
    return this.currentStorageSize + size <= MAX_STORAGE_SIZE;
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    const messages = Array.from(this.messageStore.values());
    
    return {
      messageCount: messages.length,
      totalBytes: this.currentStorageSize,
      oldestMessage: messages.length > 0 
        ? Math.min(...messages.map(m => m.created))
        : 0,
      newestMessage: messages.length > 0
        ? Math.max(...messages.map(m => m.created))
        : 0
    };
  }

  /**
   * Get message by ID
   */
  getMessage(id: string): DTNMessage | undefined {
    return this.messageStore.get(id);
  }

  /**
   * Get all stored messages
   */
  getAllMessages(): DTNMessage[] {
    return Array.from(this.messageStore.values());
  }

  /**
   * Get pending acknowledgments
   */
  getPendingAcks(): string[] {
    return Array.from(this.pendingAcks);
  }

  private generateMessageId(): string {
    return `dtn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  onMessageReceived(callback: (message: DTNMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(message: DTNMessage) {
    this.listeners.forEach(listener => listener(message));
  }

  /**
   * Clear all stored messages (use with caution)
   */
  clearAll() {
    this.messageStore.clear();
    this.pendingAcks.clear();
    this.currentStorageSize = 0;
  }
}

export default DelayTolerantLayer;

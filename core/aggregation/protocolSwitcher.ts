import { SignalSource, SignalType } from './signalAggregator';

export type Protocol = 'tcp' | 'udp' | 'webrtc' | 'websocket' | 'mesh' | 'dtn';

export interface ProtocolConfig {
  protocol: Protocol;
  reliability: 'guaranteed' | 'best-effort';
  ordered: boolean;
  maxRetries: number;
  timeout: number;
}

export interface DataTransmission {
  data: Uint8Array;
  priority: 'high' | 'normal' | 'low';
  requiresAck: boolean;
  maxLatency?: number;
}

export class ProtocolSwitcher {
  private currentProtocol: Protocol = 'tcp';
  private protocolConfigs: Map<Protocol, ProtocolConfig> = new Map();

  constructor() {
    this.initializeProtocols();
  }

  private initializeProtocols() {
    // TCP - Reliable, ordered
    this.protocolConfigs.set('tcp', {
      protocol: 'tcp',
      reliability: 'guaranteed',
      ordered: true,
      maxRetries: 5,
      timeout: 30000
    });

    // UDP - Fast, unreliable
    this.protocolConfigs.set('udp', {
      protocol: 'udp',
      reliability: 'best-effort',
      ordered: false,
      maxRetries: 0,
      timeout: 5000
    });

    // WebRTC - P2P real-time
    this.protocolConfigs.set('webrtc', {
      protocol: 'webrtc',
      reliability: 'best-effort',
      ordered: false,
      maxRetries: 1,
      timeout: 3000
    });

    // WebSocket - Real-time bidirectional
    this.protocolConfigs.set('websocket', {
      protocol: 'websocket',
      reliability: 'guaranteed',
      ordered: true,
      maxRetries: 3,
      timeout: 15000
    });

    // Mesh - Hop-based routing
    this.protocolConfigs.set('mesh', {
      protocol: 'mesh',
      reliability: 'best-effort',
      ordered: false,
      maxRetries: 3,
      timeout: 20000
    });

    // DTN - Delay-tolerant
    this.protocolConfigs.set('dtn', {
      protocol: 'dtn',
      reliability: 'guaranteed',
      ordered: false,
      maxRetries: 10,
      timeout: 300000 // 5 minutes
    });
  }

  /**
   * Select optimal protocol based on signal characteristics and data requirements
   */
  selectProtocol(
    source: SignalSource,
    transmission: DataTransmission
  ): Protocol {
    // High priority, real-time data
    if (transmission.priority === 'high' && transmission.maxLatency && transmission.maxLatency < 500) {
      if (source.type === 'mesh') return 'webrtc';
      return 'udp';
    }

    // Mesh network
    if (source.type === 'mesh') {
      return source.strength > 60 ? 'webrtc' : 'mesh';
    }

    // Weak signal - use DTN
    if (source.strength < 30) {
      return 'dtn';
    }

    // Satellite - optimize for latency
    if (source.type === 'satellite') {
      return transmission.requiresAck ? 'tcp' : 'udp';
    }

    // WiFi/Cellular - use WebSocket for real-time
    if (source.type === 'wifi' || source.type === 'cellular') {
      return transmission.priority === 'high' ? 'websocket' : 'tcp';
    }

    // Bluetooth - limited bandwidth
    if (source.type === 'bluetooth') {
      return 'mesh';
    }

    return 'tcp'; // Default
  }

  /**
   * Switch protocol dynamically based on changing conditions
   */
  shouldSwitchProtocol(
    currentSource: SignalSource,
    newSource: SignalSource,
    transmission: DataTransmission
  ): boolean {
    const currentProtocol = this.selectProtocol(currentSource, transmission);
    const newProtocol = this.selectProtocol(newSource, transmission);

    // Switch if:
    // 1. Protocol would change
    // 2. New source is significantly better
    // 3. Current source is degrading

    if (currentProtocol !== newProtocol) return true;
    if (newSource.strength > currentSource.strength + 20) return true;
    if (currentSource.strength < 30) return true;

    return false;
  }

  /**
   * Get protocol configuration
   */
  getProtocolConfig(protocol: Protocol): ProtocolConfig | undefined {
    return this.protocolConfigs.get(protocol);
  }

  /**
   * Determine if protocol supports feature
   */
  supportsFeature(protocol: Protocol, feature: 'reliability' | 'ordering' | 'low-latency'): boolean {
    const config = this.protocolConfigs.get(protocol);
    if (!config) return false;

    switch (feature) {
      case 'reliability':
        return config.reliability === 'guaranteed';
      case 'ordering':
        return config.ordered;
      case 'low-latency':
        return protocol === 'udp' || protocol === 'webrtc';
      default:
        return false;
    }
  }

  /**
   * Get recommended protocol for signal type
   */
  getRecommendedProtocol(signalType: SignalType): Protocol {
    switch (signalType) {
      case 'wifi':
        return 'websocket';
      case 'cellular':
        return 'tcp';
      case 'bluetooth':
        return 'mesh';
      case 'mesh':
        return 'mesh';
      case 'satellite':
        return 'udp';
      default:
        return 'tcp';
    }
  }

  /**
   * Estimate data transfer time
   */
  estimateTransferTime(
    dataSize: number,
    source: SignalSource,
    protocol: Protocol
  ): number {
    const config = this.protocolConfigs.get(protocol);
    if (!config) return -1;

    // Base transfer time = data size / bandwidth
    const baseTime = (dataSize * 8) / (source.bandwidth * 1000); // Convert to seconds

    // Add protocol overhead
    let overhead = 1.0;
    if (protocol === 'tcp') overhead = 1.3; // TCP overhead
    if (protocol === 'webrtc') overhead = 1.1;
    if (protocol === 'mesh') overhead = 1.5 + (source.latency / 1000);
    if (protocol === 'dtn') overhead = 2.0;

    // Add latency
    const totalTime = (baseTime * overhead) + (source.latency / 1000);

    return Math.round(totalTime * 1000); // Return in ms
  }

  getCurrentProtocol(): Protocol {
    return this.currentProtocol;
  }

  setCurrentProtocol(protocol: Protocol) {
    if (this.protocolConfigs.has(protocol)) {
      this.currentProtocol = protocol;
    }
  }
}

export default ProtocolSwitcher;

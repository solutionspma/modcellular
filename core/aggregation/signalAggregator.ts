import wifiScanner, { WiFiNetwork } from '../scanners/wifiScanner';
import bluetoothScanner, { BluetoothDevice } from '../scanners/bluetoothScanner';
import satelliteScanner, { SatelliteSignal } from '../scanners/satelliteScanner';
import MeshScanner, { MeshPeer } from '../scanners/meshScanner';

export type SignalType = 'wifi' | 'bluetooth' | 'mesh' | 'cellular' | 'satellite';

export interface SignalSource {
  type: SignalType;
  id: string;
  name: string;
  strength: number; // 0-100
  bandwidth: number; // kbps estimated
  latency: number; // ms
  isActive: boolean;
  cost: number; // cost per MB
  reliability: number; // 0-100
  metadata?: any;
}

export interface AggregatedConnection {
  primarySource: SignalSource;
  backupSources: SignalSource[];
  totalBandwidth: number;
  effectiveLatency: number;
  reliability: number;
  canSplitPackets: boolean;
}

export class SignalAggregator {
  private sources: Map<string, SignalSource> = new Map();
  private meshScanner: MeshScanner | null = null;
  private listeners: ((connection: AggregatedConnection) => void)[] = [];
  private currentConnection: AggregatedConnection | null = null;

  constructor(deviceId: string) {
    this.meshScanner = new MeshScanner(deviceId);
  }

  async initialize() {
    // Initialize all scanners
    await bluetoothScanner.initialize();
    
    // Start continuous scanning
    wifiScanner.startContinuousScanning(5000);
    satelliteScanner.startContinuousScanning(30000);
    
    if (this.meshScanner) {
      await this.meshScanner.startMeshDiscovery();
    }

    // Listen for signal changes
    this.setupListeners();
    
    // Initial aggregation
    await this.aggregate();
  }

  private setupListeners() {
    wifiScanner.onScanResult((networks) => {
      this.updateWiFiSources(networks);
      this.aggregate();
    });

    bluetoothScanner.onDeviceDiscovered((devices) => {
      this.updateBluetoothSources(devices);
      this.aggregate();
    });

    satelliteScanner.onSignalChange((signal) => {
      this.updateSatelliteSource(signal);
      this.aggregate();
    });

    if (this.meshScanner) {
      this.meshScanner.onPeersUpdated((peers) => {
        this.updateMeshSources(peers);
        this.aggregate();
      });
    }
  }

  private updateWiFiSources(networks: WiFiNetwork[]) {
    // Remove old WiFi sources
    for (const [id, source] of this.sources.entries()) {
      if (source.type === 'wifi') {
        this.sources.delete(id);
      }
    }

    // Add current WiFi networks
    networks.forEach(network => {
      const source: SignalSource = {
        type: 'wifi',
        id: `wifi-${network.bssid}`,
        name: network.ssid,
        strength: this.rssiToPercent(network.strength),
        bandwidth: this.estimateWiFiBandwidth(network),
        latency: 20, // Typical WiFi latency
        isActive: network.isConnected,
        cost: 0, // Free
        reliability: network.isConnected ? 90 : 70,
        metadata: network
      };
      this.sources.set(source.id, source);
    });
  }

  private updateBluetoothSources(devices: BluetoothDevice[]) {
    // BT devices are primarily for mesh, not direct internet
    // Keep for completeness
    devices.forEach(device => {
      if (!device.isModCellular) {
        const source: SignalSource = {
          type: 'bluetooth',
          id: `bt-${device.id}`,
          name: device.name || 'BT Device',
          strength: this.rssiToPercent(device.rssi),
          bandwidth: 100, // Low BT bandwidth
          latency: 100,
          isActive: false,
          cost: 0,
          reliability: 50,
          metadata: device
        };
        this.sources.set(source.id, source);
      }
    });
  }

  private updateMeshSources(peers: MeshPeer[]) {
    // Remove old mesh sources
    for (const [id, source] of this.sources.entries()) {
      if (source.type === 'mesh') {
        this.sources.delete(id);
      }
    }

    // Add mesh peers
    peers.forEach(peer => {
      const source: SignalSource = {
        type: 'mesh',
        id: `mesh-${peer.id}`,
        name: peer.name,
        strength: this.rssiToPercent(peer.rssi),
        bandwidth: peer.bandwidth || 500,
        latency: 50 + (peer.hops * 20), // Increase latency per hop
        isActive: peer.isDirectConnection,
        cost: 0,
        reliability: peer.relayCapable ? 80 : 60,
        metadata: peer
      };
      this.sources.set(source.id, source);
    });
  }

  private updateSatelliteSource(signal: SatelliteSignal | null) {
    // Remove old satellite source
    for (const [id, source] of this.sources.entries()) {
      if (source.type === 'satellite') {
        this.sources.delete(id);
      }
    }

    if (signal && signal.isAvailable) {
      const source: SignalSource = {
        type: 'satellite',
        id: 'satellite-primary',
        name: signal.provider,
        strength: signal.strength,
        bandwidth: signal.bandwidth,
        latency: signal.latency,
        isActive: true,
        cost: this.getSatelliteCost(signal.cost),
        reliability: 95, // Satellites are very reliable
        metadata: signal
      };
      this.sources.set(source.id, source);
    }
  }

  private async aggregate(): Promise<AggregatedConnection> {
    const activeSources = Array.from(this.sources.values())
      .filter(s => s.strength > 20) // Minimum viable strength
      .sort((a, b) => this.scoreSource(b) - this.scoreSource(a));

    if (activeSources.length === 0) {
      const emptyConnection: AggregatedConnection = {
        primarySource: this.getOfflineSource(),
        backupSources: [],
        totalBandwidth: 0,
        effectiveLatency: 999,
        reliability: 0,
        canSplitPackets: false
      };
      this.currentConnection = emptyConnection;
      this.notifyListeners(emptyConnection);
      return emptyConnection;
    }

    const primary = activeSources[0];
    const backups = activeSources.slice(1, 4); // Keep top 3 backups

    const connection: AggregatedConnection = {
      primarySource: primary,
      backupSources: backups,
      totalBandwidth: this.calculateTotalBandwidth([primary, ...backups]),
      effectiveLatency: primary.latency,
      reliability: this.calculateReliability([primary, ...backups]),
      canSplitPackets: activeSources.length > 1
    };

    this.currentConnection = connection;
    this.notifyListeners(connection);
    return connection;
  }

  private scoreSource(source: SignalSource): number {
    // Scoring formula:
    // - Prefer free over paid
    // - Prefer higher bandwidth
    // - Prefer lower latency
    // - Prefer higher reliability
    // - Prefer stronger signal
    
    let score = 0;
    
    score += source.strength * 2;
    score += (source.bandwidth / 1000) * 10;
    score += (100 - source.latency) * 0.5;
    score += source.reliability;
    score -= source.cost * 100; // Heavily penalize cost
    
    if (source.isActive) score += 50;
    
    return score;
  }

  private calculateTotalBandwidth(sources: SignalSource[]): number {
    // Can combine bandwidth from multiple sources when splitting packets
    return sources.reduce((total, s) => total + s.bandwidth, 0);
  }

  private calculateReliability(sources: SignalSource[]): number {
    if (sources.length === 0) return 0;
    
    // Having backups increases overall reliability
    const primary = sources[0];
    const backupBonus = (sources.length - 1) * 5;
    
    return Math.min(100, primary.reliability + backupBonus);
  }

  private rssiToPercent(rssi: number): number {
    // Convert RSSI (-100 to -30) to percentage (0 to 100)
    return Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
  }

  private estimateWiFiBandwidth(network: WiFiNetwork): number {
    // Estimate based on frequency and signal strength
    const baseRate = network.frequency > 5000 ? 50000 : 25000; // kbps
    const strengthFactor = this.rssiToPercent(network.strength) / 100;
    return Math.round(baseRate * strengthFactor);
  }

  private getSatelliteCost(costType?: string): number {
    const costs: Record<string, number> = {
      'free': 0,
      'metered': 1.5,
      'subscription': 0.01
    };
    return costs[costType || 'metered'] || 1.5;
  }

  private getOfflineSource(): SignalSource {
    return {
      type: 'mesh',
      id: 'offline',
      name: 'Offline Mode',
      strength: 0,
      bandwidth: 0,
      latency: 999,
      isActive: false,
      cost: 0,
      reliability: 0
    };
  }

  getBestSource(): SignalSource | null {
    return this.currentConnection?.primarySource || null;
  }

  getCurrentConnection(): AggregatedConnection | null {
    return this.currentConnection;
  }

  getAvailableSources(): SignalSource[] {
    return Array.from(this.sources.values());
  }

  onConnectionChange(callback: (connection: AggregatedConnection) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(connection: AggregatedConnection) {
    this.listeners.forEach(listener => listener(connection));
  }

  shutdown() {
    wifiScanner.stopContinuousScanning();
    satelliteScanner.stopContinuousScanning();
    bluetoothScanner.stopScan();
    if (this.meshScanner) {
      this.meshScanner.stopMeshDiscovery();
    }
  }
}

export default SignalAggregator;

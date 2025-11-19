import bluetoothScanner, { BluetoothDevice } from './bluetoothScanner';

export interface MeshPeer {
  id: string;
  deviceId: string;
  name: string;
  rssi: number;
  lastSeen: Date;
  hops: number; // Distance from this device
  isDirectConnection: boolean;
  relayCapable: boolean;
  bandwidth?: number; // Estimated available bandwidth in kbps
}

export interface MeshBeacon {
  deviceId: string;
  username?: string;
  timestamp: number;
  batteryLevel?: number;
  availableBandwidth?: number;
  activeConnections: number;
  relayEnabled: boolean;
}

export class MeshScanner {
  private peers: Map<string, MeshPeer> = new Map();
  private listeners: ((peers: MeshPeer[]) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private ownDeviceId: string;

  constructor(deviceId: string) {
    this.ownDeviceId = deviceId;
  }

  async startMeshDiscovery() {
    // Start BLE scanning for Mod Cellular devices
    bluetoothScanner.onDeviceDiscovered((devices) => {
      this.processBLEDevices(devices);
    });

    await bluetoothScanner.startScan();
    
    // Start broadcasting own beacon
    this.startBeaconBroadcast();
    
    // Clean up stale peers periodically
    this.startPeerMaintenance();
  }

  stopMeshDiscovery() {
    bluetoothScanner.stopScan();
    this.stopBeaconBroadcast();
    this.stopPeerMaintenance();
  }

  private processBLEDevices(devices: BluetoothDevice[]) {
    const now = new Date();
    
    devices
      .filter(d => d.isModCellular)
      .forEach(device => {
        const peer: MeshPeer = {
          id: device.id,
          deviceId: device.id,
          name: device.name || 'Unknown Device',
          rssi: device.rssi,
          lastSeen: now,
          hops: 1, // Direct connection
          isDirectConnection: true,
          relayCapable: true, // Assume capable until proven otherwise
        };

        this.peers.set(device.id, peer);
      });

    this.notifyListeners();
  }

  // Broadcast this device's presence to nearby Mod Cellular devices
  private async startBeaconBroadcast() {
    await bluetoothScanner.startAdvertising();
    
    // Send periodic heartbeat via BLE characteristics
    this.heartbeatInterval = setInterval(() => {
      this.broadcastBeacon();
    }, 5000);
  }

  private stopBeaconBroadcast() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private broadcastBeacon() {
    const beacon: MeshBeacon = {
      deviceId: this.ownDeviceId,
      timestamp: Date.now(),
      activeConnections: this.peers.size,
      relayEnabled: true,
    };

    // Broadcast via BLE characteristic write
    // This would be implemented in native modules
    console.log('Broadcasting mesh beacon:', beacon);
  }

  // Remove peers that haven't been seen in 30 seconds
  private startPeerMaintenance() {
    setInterval(() => {
      const now = Date.now();
      const staleThreshold = 30000; // 30 seconds

      for (const [id, peer] of this.peers.entries()) {
        if (now - peer.lastSeen.getTime() > staleThreshold) {
          this.peers.delete(id);
        }
      }

      this.notifyListeners();
    }, 10000); // Check every 10 seconds
  }

  private stopPeerMaintenance() {
    // Maintenance runs on interval, would need separate tracking
  }

  getPeers(): MeshPeer[] {
    return Array.from(this.peers.values())
      .sort((a, b) => b.rssi - a.rssi);
  }

  getActivePeers(): MeshPeer[] {
    return this.getPeers().filter(p => p.isDirectConnection);
  }

  getBestRelay(): MeshPeer | null {
    const relays = this.getPeers()
      .filter(p => p.relayCapable && p.isDirectConnection)
      .sort((a, b) => {
        // Prioritize: fewer hops, stronger signal, more bandwidth
        if (a.hops !== b.hops) return a.hops - b.hops;
        if (a.rssi !== b.rssi) return b.rssi - a.rssi;
        return (b.bandwidth || 0) - (a.bandwidth || 0);
      });

    return relays[0] || null;
  }

  onPeersUpdated(callback: (peers: MeshPeer[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const peers = this.getPeers();
    this.listeners.forEach(listener => listener(peers));
  }

  // Check if mesh network is available
  isMeshAvailable(): boolean {
    return this.peers.size > 0;
  }

  // Get mesh network health score (0-100)
  getMeshHealthScore(): number {
    if (this.peers.size === 0) return 0;
    
    const avgRSSI = Array.from(this.peers.values())
      .reduce((sum, p) => sum + p.rssi, 0) / this.peers.size;
    
    // Convert RSSI (-100 to -30) to score (0 to 100)
    const score = Math.max(0, Math.min(100, ((avgRSSI + 100) / 70) * 100));
    
    return Math.round(score);
  }
}

export default MeshScanner;

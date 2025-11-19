import { NativeModules, Platform } from 'react-native';

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number; // dBm
  frequency: number; // MHz
  isSecure: boolean;
  isConnected: boolean;
  capabilities?: string[];
}

export class WiFiScanner {
  private scanInterval: NodeJS.Timeout | null = null;
  private listeners: ((networks: WiFiNetwork[]) => void)[] = [];

  async scanNetworks(): Promise<WiFiNetwork[]> {
    try {
      if (Platform.OS === 'ios') {
        // iOS restrictions: can only get current network
        const current = await NativeModules.WiFiManager?.getCurrentNetwork();
        return current ? [current] : [];
      } else if (Platform.OS === 'android') {
        // Android: full scanning capability
        const networks = await NativeModules.WiFiManager?.scanNetworks();
        return this.parseAndRankNetworks(networks || []);
      }
      return [];
    } catch (error) {
      console.error('WiFi scan failed:', error);
      return [];
    }
  }

  async getCurrentNetwork(): Promise<WiFiNetwork | null> {
    try {
      return await NativeModules.WiFiManager?.getCurrentNetwork() || null;
    } catch (error) {
      console.error('Failed to get current network:', error);
      return null;
    }
  }

  startContinuousScanning(intervalMs: number = 5000) {
    this.stopContinuousScanning();
    
    this.scanInterval = setInterval(async () => {
      const networks = await this.scanNetworks();
      this.notifyListeners(networks);
    }, intervalMs);
  }

  stopContinuousScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  onScanResult(callback: (networks: WiFiNetwork[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(networks: WiFiNetwork[]) {
    this.listeners.forEach(listener => listener(networks));
  }

  private parseAndRankNetworks(networks: any[]): WiFiNetwork[] {
    return networks
      .map(net => ({
        ssid: net.SSID || net.ssid,
        bssid: net.BSSID || net.bssid,
        strength: net.level || net.strength || -100,
        frequency: net.frequency || 2400,
        isSecure: net.capabilities?.includes('WPA') || false,
        isConnected: net.isConnected || false,
        capabilities: net.capabilities || []
      }))
      .sort((a, b) => b.strength - a.strength);
  }

  // Find open networks for opportunistic connection
  findOpenNetworks(networks: WiFiNetwork[]): WiFiNetwork[] {
    return networks.filter(net => !net.isSecure);
  }

  // Get best available network
  getBestNetwork(networks: WiFiNetwork[]): WiFiNetwork | null {
    if (networks.length === 0) return null;
    return networks[0]; // Already sorted by strength
  }
}

export default new WiFiScanner();

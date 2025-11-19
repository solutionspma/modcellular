import wifiScanner from '../scanners/wifiScanner';
import bluetoothScanner from '../scanners/bluetoothScanner';
import satelliteScanner from '../scanners/satelliteScanner';
import MeshScanner from '../scanners/meshScanner';
import { scoreLink } from './linkScore';

export interface AggregatedLink {
  type: 'wifi' | 'bluetooth' | 'mesh' | 'satellite' | 'rogue';
  id: string;
  name: string;
  strength: number;
  latency: number;
  bandwidth: number;
  open: boolean;
  score: number;
  metadata?: any;
}

let meshScanner: MeshScanner | null = null;

export async function aggregateSignals(deviceId: string): Promise<AggregatedLink[]> {
  const links: AggregatedLink[] = [];

  // WiFi networks
  const wifiNetworks = await wifiScanner.scanNetworks();
  wifiNetworks.forEach(network => {
    links.push({
      type: 'wifi',
      id: `wifi-${network.bssid}`,
      name: network.ssid,
      strength: network.strength,
      latency: 20,
      bandwidth: 50000,
      open: !network.isSecure,
      score: 0,
      metadata: network
    });
  });

  // Bluetooth/Mesh peers
  if (!meshScanner) {
    meshScanner = new MeshScanner(deviceId);
    await meshScanner.startMeshDiscovery();
  }
  
  const meshPeers = meshScanner.getPeers();
  meshPeers.forEach(peer => {
    links.push({
      type: 'mesh',
      id: `mesh-${peer.deviceId}`,
      name: peer.name,
      strength: peer.rssi,
      latency: 50 + (peer.hops * 20),
      bandwidth: peer.bandwidth || 500,
      open: true,
      score: 0,
      metadata: peer
    });
  });

  // Satellite
  const satellite = satelliteScanner.getCurrentSignal();
  if (satellite && satellite.isAvailable) {
    links.push({
      type: 'satellite',
      id: 'satellite-primary',
      name: satellite.provider,
      strength: satellite.strength,
      latency: satellite.latency,
      bandwidth: satellite.bandwidth,
      open: true,
      score: 0,
      metadata: satellite
    });
  }

  // Score all links
  links.forEach(link => {
    link.score = scoreLink(link);
  });

  // Sort by score
  const sorted = links.sort((a, b) => b.score - a.score);

  // Store best link globally
  if (typeof global !== 'undefined') {
    (global as any).bestLink = sorted[0] || null;
  }

  return sorted;
}

export async function getBestLink(deviceId: string): Promise<AggregatedLink | null> {
  const links = await aggregateSignals(deviceId);
  return links[0] || null;
}

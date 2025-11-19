import { BleManager, Device } from 'react-native-ble-plx';

export interface MeshNode {
  id: string;
  name: string;
  rssi: number;
  lastSeen: number;
  isActive: boolean;
}

const manager = new BleManager();
const discoveredNodes = new Map<string, MeshNode>();

export function startGroupMeshRelay(
  callback: (node: MeshNode) => void
): void {
  console.log('Starting group mesh relay scanner...');

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error('Mesh scan error:', error);
      return;
    }

    if (!device || !device.name) return;

    // Filter for Mod Cellular devices
    if (device.name.includes('MODCELL') || device.name.includes('ModCell')) {
      const node: MeshNode = {
        id: device.id,
        name: device.name,
        rssi: device.rssi || -100,
        lastSeen: Date.now(),
        isActive: true
      };

      discoveredNodes.set(device.id, node);
      callback(node);
    }
  });
}

export function stopGroupMeshRelay(): void {
  manager.stopDeviceScan();
  console.log('Stopped group mesh relay scanner');
}

export function getActiveNodes(): MeshNode[] {
  const now = Date.now();
  const nodes: MeshNode[] = [];

  discoveredNodes.forEach(node => {
    // Mark as inactive if not seen in 30 seconds
    if (now - node.lastSeen > 30000) {
      node.isActive = false;
    }
    nodes.push(node);
  });

  return nodes;
}

export function getActiveNodeCount(): number {
  return getActiveNodes().filter(n => n.isActive).length;
}

export function clearMeshNodes(): void {
  discoveredNodes.clear();
}

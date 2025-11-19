import { BleManager, Device } from 'react-native-ble-plx';

const manager = new BleManager();
const MOD_CELLULAR_SERVICE_UUID = '0000FE00-0000-1000-8000-00805F9B34FB';

let isBeaconing = false;
let discoveredPeers: Device[] = [];

export async function startMeshBeacon(deviceId: string) {
  if (isBeaconing) {
    console.log('Mesh beacon already active');
    return;
  }

  try {
    // Start scanning for nearby Mod Cellular devices
    manager.startDeviceScan(
      [MOD_CELLULAR_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Mesh scan error:', error);
          return;
        }

        if (device && device.serviceUUIDs?.includes(MOD_CELLULAR_SERVICE_UUID)) {
          console.log('Discovered Mod Cellular peer:', device.name);
          
          const exists = discoveredPeers.find(p => p.id === device.id);
          if (!exists) {
            discoveredPeers.push(device);
          }
        }
      }
    );

    isBeaconing = true;
    console.log('Mesh beacon started');

    // Broadcast own presence (would require native BLE peripheral implementation)
    // This is a placeholder for actual BLE advertising
    broadcastPresence(deviceId);

  } catch (error) {
    console.error('Failed to start mesh beacon:', error);
  }
}

function broadcastPresence(deviceId: string) {
  // In production, this would use BLE peripheral mode to advertise
  // the device's presence to nearby Mod Cellular nodes
  console.log('Broadcasting mesh presence:', deviceId);
}

export function stopMeshBeacon() {
  if (!isBeaconing) return;

  manager.stopDeviceScan();
  isBeaconing = false;
  console.log('Mesh beacon stopped');
}

export function getDiscoveredPeers(): Device[] {
  return discoveredPeers;
}

export function getMeshStatus() {
  return {
    active: isBeaconing,
    peersFound: discoveredPeers.length,
    peers: discoveredPeers.map(p => ({
      id: p.id,
      name: p.name,
      rssi: p.rssi
    }))
  };
}

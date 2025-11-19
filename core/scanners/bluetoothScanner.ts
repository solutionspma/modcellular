import { BleManager, Device, State } from 'react-native-ble-plx';

export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number;
  isModCellular: boolean;
  serviceUUIDs?: string[];
  manufacturerData?: string;
}

const MOD_CELLULAR_SERVICE_UUID = '0000FE00-0000-1000-8000-00805F9B34FB';
const MOD_CELLULAR_CHARACTERISTIC_UUID = '0000FE01-0000-1000-8000-00805F9B34FB';

export class BluetoothScanner {
  private manager: BleManager;
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private listeners: ((devices: BluetoothDevice[]) => void)[] = [];

  constructor() {
    this.manager = new BleManager();
  }

  async initialize(): Promise<boolean> {
    try {
      const state = await this.manager.state();
      if (state !== State.PoweredOn) {
        console.warn('Bluetooth is not powered on:', state);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Bluetooth initialization failed:', error);
      return false;
    }
  }

  async startScan(durationMs?: number) {
    if (this.isScanning) {
      console.warn('Scan already in progress');
      return;
    }

    const initialized = await this.initialize();
    if (!initialized) {
      return;
    }

    this.isScanning = true;
    this.discoveredDevices.clear();

    this.manager.startDeviceScan(
      null, // Scan for all services
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('BLE scan error:', error);
          this.stopScan();
          return;
        }

        if (device) {
          this.handleDiscoveredDevice(device);
        }
      }
    );

    if (durationMs) {
      setTimeout(() => this.stopScan(), durationMs);
    }
  }

  stopScan() {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      this.notifyListeners();
    }
  }

  private handleDiscoveredDevice(device: Device) {
    const btDevice: BluetoothDevice = {
      id: device.id,
      name: device.name,
      rssi: device.rssi || -100,
      isModCellular: this.isModCellularDevice(device),
      serviceUUIDs: device.serviceUUIDs || [],
      manufacturerData: device.manufacturerData || undefined
    };

    this.discoveredDevices.set(device.id, btDevice);
    this.notifyListeners();
  }

  private isModCellularDevice(device: Device): boolean {
    return device.serviceUUIDs?.includes(MOD_CELLULAR_SERVICE_UUID) || false;
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values())
      .sort((a, b) => b.rssi - a.rssi);
  }

  getModCellularDevices(): BluetoothDevice[] {
    return this.getDiscoveredDevices().filter(d => d.isModCellular);
  }

  onDeviceDiscovered(callback: (devices: BluetoothDevice[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const devices = this.getDiscoveredDevices();
    this.listeners.forEach(listener => listener(devices));
  }

  // Connect to a Mod Cellular peer device
  async connectToPeer(deviceId: string): Promise<boolean> {
    try {
      const device = await this.manager.connectToDevice(deviceId, {
        timeout: 10000
      });
      
      await device.discoverAllServicesAndCharacteristics();
      
      // Ready for mesh communication
      return true;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      return false;
    }
  }

  // Start advertising this device as a Mod Cellular node
  async startAdvertising(): Promise<void> {
    // This would require native module implementation
    // Platform-specific: iOS uses CBPeripheralManager, Android uses BluetoothLeAdvertiser
    console.log('Starting BLE advertising as Mod Cellular node');
  }

  destroy() {
    this.stopScan();
    this.manager.destroy();
  }
}

export default new BluetoothScanner();

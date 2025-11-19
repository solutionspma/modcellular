import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface DeviceIdentity {
  deviceId: string;
  fingerprint: string;
  publicKey: Uint8Array;
  createdAt: number;
  platform: string;
  model?: string;
}

export class DeviceIdentityManager {
  private identity: DeviceIdentity | null = null;
  private readonly storageKey = 'mod_cellular_device_identity';

  /**
   * Initialize or load device identity
   */
  async initialize(): Promise<DeviceIdentity> {
    // Try to load existing identity
    const stored = await this.loadIdentity();
    if (stored) {
      this.identity = stored;
      return stored;
    }

    // Generate new identity
    this.identity = await this.generateIdentity();
    await this.saveIdentity(this.identity);
    
    return this.identity;
  }

  /**
   * Generate new device identity
   */
  private async generateIdentity(): Promise<DeviceIdentity> {
    const deviceId = this.generateDeviceId();
    const publicKey = await this.generatePublicKey();
    const fingerprint = this.generateFingerprint(deviceId, publicKey);

    return {
      deviceId,
      fingerprint,
      publicKey,
      createdAt: Date.now(),
      platform: Platform.OS,
      model: this.getDeviceModel()
    };
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const platform = Platform.OS.substring(0, 3);
    
    return `${platform}-${timestamp}-${random}`;
  }

  /**
   * Generate device public key (placeholder)
   */
  private async generatePublicKey(): Promise<Uint8Array> {
    // In production, this would use the E2EEncryption module
    // to generate a proper cryptographic key pair
    
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
    return key;
  }

  /**
   * Generate device fingerprint
   */
  private generateFingerprint(deviceId: string, publicKey: Uint8Array): string {
    // Create hash of device ID + public key
    let hash = 0;
    const combined = deviceId + this.arrayToHex(publicKey);
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  }

  /**
   * Get device model/name
   */
  private getDeviceModel(): string {
    // Would use react-native-device-info in production
    return Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
  }

  /**
   * Save identity to secure storage
   */
  private async saveIdentity(identity: DeviceIdentity): Promise<void> {
    try {
      const json = JSON.stringify({
        ...identity,
        publicKey: this.arrayToBase64(identity.publicKey)
      });

      // Use FileSystem for persistent storage
      const path = `${FileSystem.documentDirectory}${this.storageKey}.json`;
      await FileSystem.writeAsStringAsync(path, json);
    } catch (error) {
      console.error('Failed to save device identity:', error);
    }
  }

  /**
   * Load identity from storage
   */
  private async loadIdentity(): Promise<DeviceIdentity | null> {
    try {
      const path = `${FileSystem.documentDirectory}${this.storageKey}.json`;
      const info = await FileSystem.getInfoAsync(path);
      
      if (!info.exists) {
        return null;
      }

      const json = await FileSystem.readAsStringAsync(path);
      const data = JSON.parse(json);

      return {
        ...data,
        publicKey: this.base64ToArray(data.publicKey)
      };
    } catch (error) {
      console.error('Failed to load device identity:', error);
      return null;
    }
  }

  /**
   * Get current device identity
   */
  getIdentity(): DeviceIdentity | null {
    return this.identity;
  }

  /**
   * Get device ID
   */
  getDeviceId(): string | null {
    return this.identity?.deviceId || null;
  }

  /**
   * Get device fingerprint
   */
  getFingerprint(): string | null {
    return this.identity?.fingerprint || null;
  }

  /**
   * Get public key
   */
  getPublicKey(): Uint8Array | null {
    return this.identity?.publicKey || null;
  }

  /**
   * Verify another device's identity
   */
  verifyDevice(
    deviceId: string,
    fingerprint: string,
    publicKey: Uint8Array
  ): boolean {
    const computedFingerprint = this.generateFingerprint(deviceId, publicKey);
    return computedFingerprint === fingerprint;
  }

  /**
   * Reset device identity (use with caution)
   */
  async reset(): Promise<DeviceIdentity> {
    this.identity = null;
    
    try {
      const path = `${FileSystem.documentDirectory}${this.storageKey}.json`;
      await FileSystem.deleteAsync(path);
    } catch (error) {
      console.error('Failed to delete identity:', error);
    }

    return await this.initialize();
  }

  // Utility functions

  private arrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private arrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  private base64ToArray(base64: string): Uint8Array {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }
}

export default new DeviceIdentityManager();

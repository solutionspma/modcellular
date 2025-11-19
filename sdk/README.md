# Mod Cellular SDK

Official SDK for integrating Mod Cellular into any application.

## Installation

```bash
npm install modcellular-sdk
```

## Quick Start

```typescript
import ModCellular from 'modcellular-sdk';

// Initialize
await ModCellular.initialize({
  serverUrl: 'https://your-server.com',
  enableMesh: true,
  enableDTN: true,
  enableRelay: false
});

// Listen for connection changes
ModCellular.onConnectionChange((status) => {
  console.log('Connection status:', status);
  console.log('Primary source:', status.primarySource?.name);
  console.log('Bandwidth:', status.bandwidth, 'kbps');
});

// Send message
await ModCellular.sendMessage('user-123', 'Hello from Mod Cellular!');

// Start call
const callId = await ModCellular.startCall('user-456', 'video');

// Get connection status
const status = ModCellular.getConnectionStatus();
console.log('Connected:', status.isConnected);
console.log('Sources:', status.backupSources.length);
```

## Features

### Automatic Signal Aggregation
ModCellular automatically scans and aggregates all available signals:
- WiFi networks
- Bluetooth mesh
- Cellular data
- Satellite (opportunistic)

### Offline Support
Messages are queued using Delay-Tolerant Networking (DTN) when offline and sent when connectivity is restored.

### Mesh Networking
Connect and communicate through nearby devices when no direct internet is available.

### End-to-End Encryption
All messages and calls are encrypted using modern cryptography.

## API Reference

### `initialize(config: ModCellularConfig)`
Initialize the SDK with configuration.

### `sendMessage(userId: string, message: string, options?: MessageOptions)`
Send a message to a user.

### `startCall(userId: string, type?: 'audio' | 'video')`
Start an audio or video call.

### `getConnectionStatus(): ConnectionStatus`
Get current connection status.

### `onConnectionChange(callback: ConnectionChangeCallback)`
Listen for connection status changes.

### `onMessageReceived(callback: MessageReceivedCallback)`
Listen for incoming messages.

### `setRelayEnabled(enabled: boolean)`
Enable or disable acting as a mesh relay node.

### `shutdown()`
Shutdown the SDK and cleanup resources.

## Types

```typescript
interface ModCellularConfig {
  serverUrl: string;
  apiKey?: string;
  enableMesh?: boolean;
  enableDTN?: boolean;
  enableRelay?: boolean;
}

interface ConnectionStatus {
  isConnected: boolean;
  primarySource: SignalSource | null;
  backupSources: SignalSource[];
  bandwidth: number;
  latency: number;
  reliability: number;
}

interface MessageOptions {
  priority?: 'high' | 'normal' | 'low';
  requiresAck?: boolean;
  maxRetries?: number;
}
```

## License

MIT

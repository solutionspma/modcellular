import { AggregatedLink } from './signalAggregatorEngine';

export type Protocol = 'WebSocket' | 'MeshRelay' | 'LowBandwidth' | 'DTN' | 'Satellite';

export function pickProtocol(link: AggregatedLink | null): Protocol {
  if (!link) return 'DTN';

  switch (link.type) {
    case 'wifi':
      return link.bandwidth > 1000 ? 'WebSocket' : 'LowBandwidth';
    
    case 'satellite':
      return 'Satellite';
    
    case 'mesh':
      return 'MeshRelay';
    
    case 'bluetooth':
      return 'MeshRelay';
    
    case 'rogue':
      return 'LowBandwidth';
    
    default:
      return 'DTN';
  }
}

export function getProtocolConfig(protocol: Protocol) {
  const configs = {
    WebSocket: {
      maxPacketSize: 65536,
      retries: 3,
      timeout: 30000,
      useCompression: true
    },
    MeshRelay: {
      maxPacketSize: 512,
      retries: 5,
      timeout: 60000,
      useCompression: false
    },
    LowBandwidth: {
      maxPacketSize: 256,
      retries: 10,
      timeout: 120000,
      useCompression: true
    },
    DTN: {
      maxPacketSize: 1024,
      retries: 999,
      timeout: 604800000, // 7 days
      useCompression: true
    },
    Satellite: {
      maxPacketSize: 512,
      retries: 3,
      timeout: 45000,
      useCompression: true
    }
  };

  return configs[protocol];
}

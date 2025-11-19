import { AggregatedLink } from '../aggregation/signalAggregatorEngine';

export type BandwidthQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'minimal';

export function shapeAudioBandwidth(link: AggregatedLink | null): number {
  if (!link) return 0.1; // 10% quality for DTN

  switch (link.type) {
    case 'wifi':
      return link.bandwidth > 5000 ? 1.0 : 0.8;
    
    case 'satellite':
      return 0.7;
    
    case 'mesh':
      return 0.6;
    
    case 'bluetooth':
      return 0.5;
    
    case 'rogue':
      return 0.3;
    
    default:
      return 0.15;
  }
}

export function getBandwidthQuality(multiplier: number): BandwidthQuality {
  if (multiplier >= 0.9) return 'excellent';
  if (multiplier >= 0.7) return 'good';
  if (multiplier >= 0.5) return 'moderate';
  if (multiplier >= 0.3) return 'poor';
  return 'minimal';
}

export function calculateBitrate(link: AggregatedLink | null, baseBitrate: number = 48000): number {
  const multiplier = shapeAudioBandwidth(link);
  return Math.floor(baseBitrate * multiplier);
}

export function selectCodec(link: AggregatedLink | null): 'opus' | 'pcm' | 'gsm' {
  const quality = shapeAudioBandwidth(link);
  
  if (quality >= 0.8) return 'opus'; // High quality
  if (quality >= 0.4) return 'pcm';  // Medium quality
  return 'gsm'; // Low bandwidth mode
}

export interface BandwidthProfile {
  bitrate: number;
  codec: 'opus' | 'pcm' | 'gsm';
  quality: BandwidthQuality;
  packetSize: number;
  bufferSize: number;
}

export function createBandwidthProfile(link: AggregatedLink | null): BandwidthProfile {
  const multiplier = shapeAudioBandwidth(link);
  const quality = getBandwidthQuality(multiplier);
  const codec = selectCodec(link);
  
  let packetSize = 1024;
  let bufferSize = 4096;
  
  if (multiplier < 0.5) {
    packetSize = 512;
    bufferSize = 2048;
  }
  
  if (multiplier < 0.3) {
    packetSize = 256;
    bufferSize = 1024;
  }
  
  return {
    bitrate: calculateBitrate(link),
    codec,
    quality,
    packetSize,
    bufferSize
  };
}

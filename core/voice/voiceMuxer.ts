import { encodeVOMP, VOMPPacket } from './vompEncoder';
import { AggregatedLink } from '../aggregation/signalAggregatorEngine';

export interface MuxedVoicePacket {
  packet: VOMPPacket;
  route: string;
  size: number;
  priority: number;
  link: AggregatedLink | null;
}

export function muxVoiceStream(
  samples: ArrayBuffer[],
  link: AggregatedLink | null
): MuxedVoicePacket[] {
  return samples.map(sample => {
    const packet = encodeVOMP(sample);
    
    return {
      packet,
      route: link?.type || 'dtn',
      size: packet.payload.length,
      priority: 10, // Voice always high priority
      link
    };
  });
}

export function splitVoiceAcrossLinks(
  samples: ArrayBuffer[],
  links: AggregatedLink[]
): MuxedVoicePacket[] {
  if (links.length === 0) {
    return muxVoiceStream(samples, null);
  }

  const muxed: MuxedVoicePacket[] = [];
  let linkIndex = 0;

  for (const sample of samples) {
    const currentLink = links[linkIndex % links.length];
    const packet = encodeVOMP(sample);

    muxed.push({
      packet,
      route: currentLink.type,
      size: packet.payload.length,
      priority: 10,
      link: currentLink
    });

    linkIndex++;
  }

  return muxed;
}

export function calculateVoiceBandwidth(packets: MuxedVoicePacket[]): number {
  const totalBytes = packets.reduce((sum, p) => sum + p.size, 0);
  return totalBytes * 8; // bits
}

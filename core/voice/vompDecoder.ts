import { Buffer } from 'buffer';
import { VOMPPacket } from './vompEncoder';

export interface DecodedAudio {
  buffer: ArrayBuffer;
  timestamp: number;
  sequence: number;
}

export function decodeVOMP(packet: VOMPPacket): DecodedAudio {
  const buffer = Buffer.from(packet.payload, 'base64');
  
  return {
    buffer: buffer.buffer,
    timestamp: packet.ts,
    sequence: packet.seq
  };
}

export function decodeVOMPStream(packets: VOMPPacket[]): DecodedAudio[] {
  // Sort by sequence to handle out-of-order delivery
  const sorted = [...packets].sort((a, b) => a.seq - b.seq);
  
  return sorted.map(packet => decodeVOMP(packet));
}

export function reassembleAudioStream(decodedChunks: DecodedAudio[]): ArrayBuffer {
  const totalSize = decodedChunks.reduce((sum, chunk) => sum + chunk.buffer.byteLength, 0);
  const combined = new Uint8Array(totalSize);
  
  let offset = 0;
  for (const chunk of decodedChunks) {
    combined.set(new Uint8Array(chunk.buffer), offset);
    offset += chunk.buffer.byteLength;
  }
  
  return combined.buffer;
}

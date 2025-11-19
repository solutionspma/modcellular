import { Buffer } from 'buffer';

export interface VOMPPacket {
  ts: number;
  payload: string;
  seq: number;
  codec: 'opus' | 'pcm';
  bitrate: number;
}

let sequenceCounter = 0;

export function encodeVOMP(
  rawAudio: ArrayBuffer,
  codec: 'opus' | 'pcm' = 'opus',
  bitrate: number = 16000
): VOMPPacket {
  // Convert raw audio to base64 for transport
  const buffer = Buffer.from(rawAudio);
  const compressed = buffer.toString('base64');

  return {
    ts: Date.now(),
    payload: compressed,
    seq: sequenceCounter++,
    codec,
    bitrate
  };
}

export function encodeVOMPStream(
  audioSamples: ArrayBuffer[],
  codec: 'opus' | 'pcm' = 'opus'
): VOMPPacket[] {
  return audioSamples.map(sample => encodeVOMP(sample, codec));
}

export function resetSequence(): void {
  sequenceCounter = 0;
}

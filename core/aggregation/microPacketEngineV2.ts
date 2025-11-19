export interface MicroPacket {
  id: number;
  total: number;
  chunk: string;
  checksum: string;
}

const PACKET_SIZE = 250; // bytes

export function splitIntoMicroPackets(data: string): MicroPacket[] {
  const packets: MicroPacket[] = [];
  const totalPackets = Math.ceil(data.length / PACKET_SIZE);

  for (let i = 0; i < data.length; i += PACKET_SIZE) {
    const chunk = data.substring(i, i + PACKET_SIZE);
    
    packets.push({
      id: Math.floor(i / PACKET_SIZE),
      total: totalPackets,
      chunk,
      checksum: simpleChecksum(chunk)
    });
  }

  return packets;
}

export function reassemblePackets(packets: MicroPacket[]): string {
  // Sort by ID
  packets.sort((a, b) => a.id - b.id);

  // Verify checksums
  for (const packet of packets) {
    const computed = simpleChecksum(packet.chunk);
    if (computed !== packet.checksum) {
      throw new Error(`Checksum mismatch for packet ${packet.id}`);
    }
  }

  // Reassemble
  return packets.map(p => p.chunk).join('');
}

function simpleChecksum(data: string): string {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data.charCodeAt(i)) & 0xffffffff;
  }
  return sum.toString(16);
}

export function estimatePacketCount(dataSize: number): number {
  return Math.ceil(dataSize / PACKET_SIZE);
}

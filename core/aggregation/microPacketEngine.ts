import { SignalSource } from './signalAggregator';

export interface MicroPacket {
  id: string;
  sequenceNumber: number;
  totalPackets: number;
  data: Uint8Array;
  sourceId: string;
  timestamp: number;
  checksum: string;
}

export interface ReassembledData {
  id: string;
  data: Uint8Array;
  receivedAt: number;
  sourcesUsed: string[];
}

const MICRO_PACKET_SIZE = 512; // bytes - small enough to work on weak signals
const REASSEMBLY_TIMEOUT = 30000; // 30 seconds

export class MicroPacketEngine {
  private sendQueue: Map<string, MicroPacket[]> = new Map();
  private receiveBuffers: Map<string, Map<number, MicroPacket>> = new Map();
  private reassemblyTimers: Map<string, NodeJS.Timeout> = new Map();
  private listeners: ((data: ReassembledData) => void)[] = [];

  /**
   * Split large data into micro-packets for transmission over weak signals
   */
  splitData(
    data: Uint8Array,
    sources: SignalSource[]
  ): Map<string, MicroPacket[]> {
    const packetId = this.generatePacketId();
    const totalPackets = Math.ceil(data.length / MICRO_PACKET_SIZE);
    const distribution = new Map<string, MicroPacket[]>();

    // Distribute packets across sources based on bandwidth
    const totalBandwidth = sources.reduce((sum, s) => sum + s.bandwidth, 0);
    
    let packetIndex = 0;
    for (const source of sources) {
      const sourceRatio = source.bandwidth / totalBandwidth;
      const packetsForSource = Math.ceil(totalPackets * sourceRatio);
      const packets: MicroPacket[] = [];

      for (let i = 0; i < packetsForSource && packetIndex < totalPackets; i++) {
        const start = packetIndex * MICRO_PACKET_SIZE;
        const end = Math.min(start + MICRO_PACKET_SIZE, data.length);
        const packetData = data.slice(start, end);

        const microPacket: MicroPacket = {
          id: packetId,
          sequenceNumber: packetIndex,
          totalPackets,
          data: packetData,
          sourceId: source.id,
          timestamp: Date.now(),
          checksum: this.calculateChecksum(packetData)
        };

        packets.push(microPacket);
        packetIndex++;
      }

      if (packets.length > 0) {
        distribution.set(source.id, packets);
      }
    }

    this.sendQueue.set(packetId, this.flattenPackets(distribution));
    return distribution;
  }

  /**
   * Receive and buffer micro-packet for reassembly
   */
  receivePacket(packet: MicroPacket): boolean {
    const { id, sequenceNumber, totalPackets } = packet;

    // Verify checksum
    if (!this.verifyChecksum(packet)) {
      console.warn(`Checksum failed for packet ${id}:${sequenceNumber}`);
      return false;
    }

    // Get or create buffer for this data stream
    if (!this.receiveBuffers.has(id)) {
      this.receiveBuffers.set(id, new Map());
      this.startReassemblyTimer(id);
    }

    const buffer = this.receiveBuffers.get(id)!;
    buffer.set(sequenceNumber, packet);

    // Check if we have all packets
    if (buffer.size === totalPackets) {
      this.reassembleData(id);
      return true;
    }

    return false;
  }

  private reassembleData(id: string) {
    const buffer = this.receiveBuffers.get(id);
    if (!buffer) return;

    // Sort packets by sequence number
    const sortedPackets = Array.from(buffer.values())
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Combine data
    const totalSize = sortedPackets.reduce((sum, p) => sum + p.data.length, 0);
    const combined = new Uint8Array(totalSize);
    
    let offset = 0;
    for (const packet of sortedPackets) {
      combined.set(packet.data, offset);
      offset += packet.data.length;
    }

    // Track which sources were used
    const sourcesUsed = Array.from(new Set(sortedPackets.map(p => p.sourceId)));

    const reassembled: ReassembledData = {
      id,
      data: combined,
      receivedAt: Date.now(),
      sourcesUsed
    };

    // Cleanup
    this.receiveBuffers.delete(id);
    this.clearReassemblyTimer(id);

    // Notify listeners
    this.notifyListeners(reassembled);
  }

  private startReassemblyTimer(id: string) {
    const timer = setTimeout(() => {
      console.warn(`Reassembly timeout for ${id}`);
      this.receiveBuffers.delete(id);
      this.reassemblyTimers.delete(id);
    }, REASSEMBLY_TIMEOUT);

    this.reassemblyTimers.set(id, timer);
  }

  private clearReassemblyTimer(id: string) {
    const timer = this.reassemblyTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reassemblyTimers.delete(id);
    }
  }

  private flattenPackets(distribution: Map<string, MicroPacket[]>): MicroPacket[] {
    const allPackets: MicroPacket[] = [];
    for (const packets of distribution.values()) {
      allPackets.push(...packets);
    }
    return allPackets.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  private generatePacketId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(data: Uint8Array): string {
    // Simple checksum - in production use proper hashing (CRC32, SHA256, etc.)
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = (sum + data[i]) & 0xffffffff;
    }
    return sum.toString(16);
  }

  private verifyChecksum(packet: MicroPacket): boolean {
    const calculated = this.calculateChecksum(packet.data);
    return calculated === packet.checksum;
  }

  getReceiveProgress(id: string): number {
    const buffer = this.receiveBuffers.get(id);
    if (!buffer || buffer.size === 0) return 0;

    const firstPacket = Array.from(buffer.values())[0];
    return (buffer.size / firstPacket.totalPackets) * 100;
  }

  onDataReassembled(callback: (data: ReassembledData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(data: ReassembledData) {
    this.listeners.forEach(listener => listener(data));
  }

  cleanup() {
    this.receiveBuffers.clear();
    this.reassemblyTimers.forEach(timer => clearTimeout(timer));
    this.reassemblyTimers.clear();
  }
}

export default MicroPacketEngine;

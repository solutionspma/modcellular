import { SignalSource, AggregatedConnection } from '../aggregation/signalAggregator';
import { MicroPacket } from '../aggregation/microPacketEngine';

export interface Route {
  id: string;
  destination: string;
  hops: SignalSource[];
  totalLatency: number;
  reliability: number;
  cost: number;
}

export interface Packet {
  id: string;
  destination: string;
  data: Uint8Array;
  priority: 'high' | 'normal' | 'low';
  ttl: number; // Time to live (hops)
  timestamp: number;
  requiresAck: boolean;
}

export class Router {
  private routingTable: Map<string, Route> = new Map();
  private packetQueue: Packet[] = [];
  private failedAttempts: Map<string, number> = new Map();

  /**
   * Route packet to destination using best available path
   */
  async routePacket(
    packet: Packet,
    connection: AggregatedConnection
  ): Promise<boolean> {
    // 1. Check if we have a direct connection
    if (this.canSendDirect(connection)) {
      return await this.sendDirect(packet, connection.primarySource);
    }

    // 2. Check if signal is weak - split into micro packets
    if (this.shouldSplitPacket(connection, packet)) {
      return await this.sendViaMicroPackets(packet, connection);
    }

    // 3. Check if mesh routing is available
    if (this.isMeshAvailable(connection)) {
      return await this.sendViaMesh(packet, connection);
    }

    // 4. Fall back to delay-tolerant networking (DTN)
    return await this.queueForDTN(packet);
  }

  private canSendDirect(connection: AggregatedConnection): boolean {
    const primary = connection.primarySource;
    return (
      primary.isActive &&
      primary.strength > 40 &&
      primary.type !== 'mesh'
    );
  }

  private shouldSplitPacket(
    connection: AggregatedConnection,
    packet: Packet
  ): boolean {
    // Split if:
    // - Multiple sources available
    // - Primary source is weak
    // - Packet is large
    return (
      connection.canSplitPackets &&
      connection.primarySource.strength < 60 &&
      packet.data.length > 1024
    );
  }

  private isMeshAvailable(connection: AggregatedConnection): boolean {
    return connection.backupSources.some(s => s.type === 'mesh' && s.isActive);
  }

  private async sendDirect(
    packet: Packet,
    source: SignalSource
  ): Promise<boolean> {
    try {
      // Direct transmission via primary source
      // This would integrate with actual network stack
      console.log(`Sending packet ${packet.id} via ${source.name}`);
      
      // Simulate transmission
      await this.transmit(packet, source);
      
      return true;
    } catch (error) {
      console.error('Direct send failed:', error);
      this.recordFailure(packet.id);
      return false;
    }
  }

  private async sendViaMicroPackets(
    packet: Packet,
    connection: AggregatedConnection
  ): Promise<boolean> {
    try {
      // Split and distribute across multiple sources
      // Integrate with MicroPacketEngine
      console.log(`Splitting packet ${packet.id} across ${connection.backupSources.length + 1} sources`);
      
      // This would use MicroPacketEngine.splitData()
      // and send each micro-packet via appropriate source
      
      return true;
    } catch (error) {
      console.error('Micro-packet send failed:', error);
      return false;
    }
  }

  private async sendViaMesh(
    packet: Packet,
    connection: AggregatedConnection
  ): Promise<boolean> {
    try {
      const meshSource = connection.backupSources.find(s => s.type === 'mesh');
      if (!meshSource) return false;

      console.log(`Routing packet ${packet.id} via mesh network`);
      
      // Find route through mesh
      const route = await this.findMeshRoute(packet.destination, meshSource);
      if (!route) return false;

      // Send via mesh relay
      await this.transmitViaMesh(packet, route);
      
      return true;
    } catch (error) {
      console.error('Mesh routing failed:', error);
      return false;
    }
  }

  private async queueForDTN(packet: Packet): Promise<boolean> {
    console.log(`Queueing packet ${packet.id} for DTN delivery`);
    
    // Add to DTN queue for later delivery
    this.packetQueue.push(packet);
    
    // Queue is processed when connectivity improves
    return true;
  }

  private async findMeshRoute(
    destination: string,
    meshSource: SignalSource
  ): Promise<Route | null> {
    // Check routing table first
    const cachedRoute = this.routingTable.get(destination);
    if (cachedRoute && this.isRouteValid(cachedRoute)) {
      return cachedRoute;
    }

    // Discover new route via mesh protocol
    // This would use mesh peer discovery and hop counting
    
    return null; // No route found
  }

  private isRouteValid(route: Route): boolean {
    // Check if all hops are still available
    return route.hops.every(hop => hop.isActive && hop.strength > 30);
  }

  private async transmit(packet: Packet, source: SignalSource): Promise<void> {
    // Actual network transmission would happen here
    // Integration with socket/fetch/WebRTC depending on source type
    
    return new Promise((resolve) => {
      setTimeout(resolve, source.latency);
    });
  }

  private async transmitViaMesh(packet: Packet, route: Route): Promise<void> {
    // Hop-by-hop transmission through mesh network
    for (const hop of route.hops) {
      await this.transmit(packet, hop);
    }
  }

  private recordFailure(packetId: string) {
    const failures = this.failedAttempts.get(packetId) || 0;
    this.failedAttempts.set(packetId, failures + 1);
  }

  getFailureCount(packetId: string): number {
    return this.failedAttempts.get(packetId) || 0;
  }

  /**
   * Process queued packets when connectivity improves
   */
  async processQueue(connection: AggregatedConnection): Promise<number> {
    let sent = 0;
    const remainingQueue: Packet[] = [];

    for (const packet of this.packetQueue) {
      // Check if packet has expired (TTL)
      if (packet.ttl <= 0) {
        console.log(`Packet ${packet.id} expired`);
        continue;
      }

      // Attempt to send
      const success = await this.routePacket(packet, connection);
      if (success) {
        sent++;
      } else {
        packet.ttl--;
        remainingQueue.push(packet);
      }
    }

    this.packetQueue = remainingQueue;
    return sent;
  }

  getQueueSize(): number {
    return this.packetQueue.length;
  }

  clearQueue() {
    this.packetQueue = [];
  }

  updateRoutingTable(destination: string, route: Route) {
    this.routingTable.set(destination, route);
  }

  getRoute(destination: string): Route | undefined {
    return this.routingTable.get(destination);
  }
}

export default Router;

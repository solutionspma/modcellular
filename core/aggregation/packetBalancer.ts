import { SignalSource, AggregatedConnection } from './signalAggregator';

export interface LoadBalancingStrategy {
  name: string;
  selectSource: (sources: SignalSource[], packetSize: number) => SignalSource | null;
}

export interface PacketDistribution {
  sourceId: string;
  percentage: number;
  estimatedThroughput: number; // kbps
}

export class PacketBalancer {
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private currentStrategy: string = 'adaptive';
  private packetsSent: Map<string, number> = new Map();
  private bytesTransferred: Map<string, number> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Round Robin - Distribute evenly
    this.strategies.set('round-robin', {
      name: 'Round Robin',
      selectSource: (sources: SignalSource[]) => {
        const activeSources = sources.filter(s => s.isActive && s.strength > 30);
        if (activeSources.length === 0) return null;
        
        // Find source with least packets sent
        const sortedByCounts = activeSources.sort((a, b) => {
          const aCount = this.packetsSent.get(a.id) || 0;
          const bCount = this.packetsSent.get(b.id) || 0;
          return aCount - bCount;
        });
        
        return sortedByCounts[0];
      }
    });

    // Weighted - Based on bandwidth
    this.strategies.set('weighted', {
      name: 'Weighted by Bandwidth',
      selectSource: (sources: SignalSource[]) => {
        const activeSources = sources.filter(s => s.isActive && s.strength > 30);
        if (activeSources.length === 0) return null;
        
        // Probability based on bandwidth
        const totalBandwidth = activeSources.reduce((sum, s) => sum + s.bandwidth, 0);
        const random = Math.random() * totalBandwidth;
        
        let accumulated = 0;
        for (const source of activeSources) {
          accumulated += source.bandwidth;
          if (random <= accumulated) {
            return source;
          }
        }
        
        return activeSources[0];
      }
    });

    // Lowest Latency - For real-time data
    this.strategies.set('low-latency', {
      name: 'Lowest Latency',
      selectSource: (sources: SignalSource[]) => {
        const activeSources = sources.filter(s => s.isActive && s.strength > 30);
        if (activeSources.length === 0) return null;
        
        return activeSources.sort((a, b) => a.latency - b.latency)[0];
      }
    });

    // Cost Optimized - Prefer free sources
    this.strategies.set('cost-optimized', {
      name: 'Cost Optimized',
      selectSource: (sources: SignalSource[]) => {
        const activeSources = sources.filter(s => s.isActive && s.strength > 30);
        if (activeSources.length === 0) return null;
        
        // Sort by cost (ascending), then by bandwidth (descending)
        return activeSources.sort((a, b) => {
          if (a.cost !== b.cost) return a.cost - b.cost;
          return b.bandwidth - a.bandwidth;
        })[0];
      }
    });

    // Adaptive - Smart selection based on packet characteristics
    this.strategies.set('adaptive', {
      name: 'Adaptive',
      selectSource: (sources: SignalSource[], packetSize: number) => {
        const activeSources = sources.filter(s => s.isActive && s.strength > 30);
        if (activeSources.length === 0) return null;
        
        // For small packets (<1KB): prefer low latency
        if (packetSize < 1024) {
          return activeSources.sort((a, b) => a.latency - b.latency)[0];
        }
        
        // For large packets: prefer high bandwidth, consider cost
        return activeSources.sort((a, b) => {
          const aScore = (b.bandwidth / (a.cost + 0.1)) - a.latency;
          const bScore = (a.bandwidth / (b.cost + 0.1)) - b.latency;
          return bScore - aScore;
        })[0];
      }
    });
  }

  selectSourceForPacket(
    connection: AggregatedConnection,
    packetSize: number
  ): SignalSource | null {
    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) return connection.primarySource;

    const allSources = [connection.primarySource, ...connection.backupSources];
    const selected = strategy.selectSource(allSources, packetSize);
    
    if (selected) {
      this.recordPacketSent(selected.id, packetSize);
    }
    
    return selected;
  }

  distributePackets(
    connection: AggregatedConnection,
    totalBytes: number
  ): PacketDistribution[] {
    if (!connection.canSplitPackets) {
      return [{
        sourceId: connection.primarySource.id,
        percentage: 100,
        estimatedThroughput: connection.primarySource.bandwidth
      }];
    }

    const allSources = [connection.primarySource, ...connection.backupSources]
      .filter(s => s.isActive && s.strength > 30);

    if (allSources.length === 0) return [];

    const totalBandwidth = allSources.reduce((sum, s) => sum + s.bandwidth, 0);

    return allSources.map(source => ({
      sourceId: source.id,
      percentage: (source.bandwidth / totalBandwidth) * 100,
      estimatedThroughput: source.bandwidth
    }));
  }

  setStrategy(strategyName: string) {
    if (this.strategies.has(strategyName)) {
      this.currentStrategy = strategyName;
    }
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  getCurrentStrategy(): string {
    return this.currentStrategy;
  }

  private recordPacketSent(sourceId: string, bytes: number) {
    this.packetsSent.set(sourceId, (this.packetsSent.get(sourceId) || 0) + 1);
    this.bytesTransferred.set(sourceId, (this.bytesTransferred.get(sourceId) || 0) + bytes);
  }

  getStats(sourceId: string): { packets: number; bytes: number } {
    return {
      packets: this.packetsSent.get(sourceId) || 0,
      bytes: this.bytesTransferred.get(sourceId) || 0
    };
  }

  getAllStats(): Map<string, { packets: number; bytes: number }> {
    const stats = new Map();
    const allSourceIds = new Set([
      ...this.packetsSent.keys(),
      ...this.bytesTransferred.keys()
    ]);

    allSourceIds.forEach(id => {
      stats.set(id, this.getStats(id));
    });

    return stats;
  }

  resetStats() {
    this.packetsSent.clear();
    this.bytesTransferred.clear();
  }
}

export default PacketBalancer;

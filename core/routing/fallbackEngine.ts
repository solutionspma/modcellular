import { SignalSource } from '../aggregation/signalAggregator';

export interface FallbackChain {
  sources: SignalSource[];
  currentIndex: number;
  failureCount: number;
  lastSwitchTime: number;
}

export interface FallbackStrategy {
  name: string;
  shouldFallback: (source: SignalSource, failureCount: number) => boolean;
  selectNext: (sources: SignalSource[], currentIndex: number) => number;
}

const FALLBACK_COOLDOWN = 5000; // Wait 5s between fallback attempts
const MAX_FAILURES_BEFORE_FALLBACK = 3;

export class FallbackEngine {
  private chains: Map<string, FallbackChain> = new Map();
  private strategies: Map<string, FallbackStrategy> = new Map();
  private currentStrategy: string = 'progressive';
  private listeners: ((oldSource: SignalSource, newSource: SignalSource) => void)[] = [];

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Progressive - Try each source in order
    this.strategies.set('progressive', {
      name: 'Progressive',
      shouldFallback: (source: SignalSource, failureCount: number) => {
        return (
          !source.isActive ||
          source.strength < 20 ||
          failureCount >= MAX_FAILURES_BEFORE_FALLBACK
        );
      },
      selectNext: (sources: SignalSource[], currentIndex: number) => {
        return (currentIndex + 1) % sources.length;
      }
    });

    // Quality-based - Always use best available
    this.strategies.set('quality', {
      name: 'Quality Based',
      shouldFallback: (source: SignalSource) => {
        return !source.isActive || source.strength < 30;
      },
      selectNext: (sources: SignalSource[]) => {
        const activeSources = sources
          .map((s, i) => ({ source: s, index: i }))
          .filter(({ source }) => source.isActive && source.strength > 30)
          .sort((a, b) => b.source.strength - a.source.strength);
        
        return activeSources[0]?.index ?? 0;
      }
    });

    // Cost-optimized - Prefer free sources
    this.strategies.set('cost', {
      name: 'Cost Optimized',
      shouldFallback: (source: SignalSource, failureCount: number) => {
        return (
          !source.isActive ||
          source.strength < 25 ||
          failureCount >= MAX_FAILURES_BEFORE_FALLBACK
        );
      },
      selectNext: (sources: SignalSource[]) => {
        const activeSources = sources
          .map((s, i) => ({ source: s, index: i }))
          .filter(({ source }) => source.isActive && source.strength > 25)
          .sort((a, b) => {
            // Sort by cost (ascending), then strength (descending)
            if (a.source.cost !== b.source.cost) {
              return a.source.cost - b.source.cost;
            }
            return b.source.strength - a.source.strength;
          });
        
        return activeSources[0]?.index ?? 0;
      }
    });

    // Latency-optimized - For real-time applications
    this.strategies.set('latency', {
      name: 'Latency Optimized',
      shouldFallback: (source: SignalSource) => {
        return !source.isActive || source.latency > 200;
      },
      selectNext: (sources: SignalSource[]) => {
        const activeSources = sources
          .map((s, i) => ({ source: s, index: i }))
          .filter(({ source }) => source.isActive && source.strength > 30)
          .sort((a, b) => a.source.latency - b.source.latency);
        
        return activeSources[0]?.index ?? 0;
      }
    });
  }

  /**
   * Initialize fallback chain for a connection
   */
  initializeChain(chainId: string, sources: SignalSource[]) {
    this.chains.set(chainId, {
      sources: sources.filter(s => s.strength > 20),
      currentIndex: 0,
      failureCount: 0,
      lastSwitchTime: 0
    });
  }

  /**
   * Check if should fallback to next source
   */
  shouldFallback(chainId: string): boolean {
    const chain = this.chains.get(chainId);
    if (!chain || chain.sources.length <= 1) return false;

    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) return false;

    const currentSource = chain.sources[chain.currentIndex];
    const now = Date.now();

    // Respect cooldown period
    if (now - chain.lastSwitchTime < FALLBACK_COOLDOWN) {
      return false;
    }

    return strategy.shouldFallback(currentSource, chain.failureCount);
  }

  /**
   * Execute fallback to next available source
   */
  fallback(chainId: string): SignalSource | null {
    const chain = this.chains.get(chainId);
    if (!chain) return null;

    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) return null;

    const oldSource = chain.sources[chain.currentIndex];
    const newIndex = strategy.selectNext(chain.sources, chain.currentIndex);
    
    if (newIndex === chain.currentIndex) {
      // No better source available
      return null;
    }

    const newSource = chain.sources[newIndex];

    // Update chain state
    chain.currentIndex = newIndex;
    chain.failureCount = 0;
    chain.lastSwitchTime = Date.now();

    // Notify listeners
    this.notifyListeners(oldSource, newSource);

    console.log(`Fallback: ${oldSource.name} → ${newSource.name}`);
    return newSource;
  }

  /**
   * Record failure for current source
   */
  recordFailure(chainId: string) {
    const chain = this.chains.get(chainId);
    if (chain) {
      chain.failureCount++;
    }
  }

  /**
   * Reset failure count (on successful transmission)
   */
  resetFailures(chainId: string) {
    const chain = this.chains.get(chainId);
    if (chain) {
      chain.failureCount = 0;
    }
  }

  /**
   * Update sources in chain (when new scan results arrive)
   */
  updateChain(chainId: string, sources: SignalSource[]) {
    const chain = this.chains.get(chainId);
    if (!chain) {
      this.initializeChain(chainId, sources);
      return;
    }

    const currentSource = chain.sources[chain.currentIndex];
    chain.sources = sources.filter(s => s.strength > 20);

    // Try to keep same source if still available
    const newIndex = chain.sources.findIndex(s => s.id === currentSource.id);
    chain.currentIndex = newIndex >= 0 ? newIndex : 0;
  }

  /**
   * Get current active source
   */
  getCurrentSource(chainId: string): SignalSource | null {
    const chain = this.chains.get(chainId);
    if (!chain || chain.sources.length === 0) return null;
    return chain.sources[chain.currentIndex];
  }

  /**
   * Get all available fallback sources
   */
  getAvailableSources(chainId: string): SignalSource[] {
    const chain = this.chains.get(chainId);
    return chain?.sources || [];
  }

  /**
   * Force switch to specific source
   */
  switchToSource(chainId: string, sourceId: string): boolean {
    const chain = this.chains.get(chainId);
    if (!chain) return false;

    const newIndex = chain.sources.findIndex(s => s.id === sourceId);
    if (newIndex < 0) return false;

    const oldSource = chain.sources[chain.currentIndex];
    const newSource = chain.sources[newIndex];

    chain.currentIndex = newIndex;
    chain.failureCount = 0;
    chain.lastSwitchTime = Date.now();

    this.notifyListeners(oldSource, newSource);
    return true;
  }

  setStrategy(strategyName: string) {
    if (this.strategies.has(strategyName)) {
      this.currentStrategy = strategyName;
    }
  }

  getStrategy(): string {
    return this.currentStrategy;
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  onFallback(callback: (oldSource: SignalSource, newSource: SignalSource) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(oldSource: SignalSource, newSource: SignalSource) {
    this.listeners.forEach(listener => listener(oldSource, newSource));
  }

  cleanup(chainId: string) {
    this.chains.delete(chainId);
  }
}

export default FallbackEngine;

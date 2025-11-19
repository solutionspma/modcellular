import { aggregateSignals, getBestLink, AggregatedLink } from '../aggregation/signalAggregatorEngine';
import { pickProtocol, Protocol } from '../aggregation/protocolSwitch';

export interface RouteDecision {
  link: AggregatedLink | null;
  protocol: Protocol;
  confidence: number;
  alternatives: AggregatedLink[];
}

export async function getBestRoute(deviceId: string): Promise<RouteDecision> {
  const links = await aggregateSignals(deviceId);
  const best = links[0] || null;
  const protocol = pickProtocol(best);

  // Calculate confidence based on link quality
  let confidence = 0;
  if (best) {
    confidence = Math.min(100, (best.score / 150) * 100);
  }

  return {
    link: best,
    protocol,
    confidence,
    alternatives: links.slice(1, 4)
  };
}

export async function shouldFallback(
  currentLink: AggregatedLink,
  deviceId: string
): Promise<boolean> {
  const newBest = await getBestLink(deviceId);
  
  if (!newBest) return false;
  
  // Fallback if new link is significantly better
  return newBest.score > currentLink.score * 1.3;
}

export function getRecommendedAction(route: RouteDecision): string {
  if (!route.link) {
    return 'Store messages offline (DTN mode)';
  }

  if (route.confidence > 80) {
    return `Strong connection via ${route.link.name}`;
  }

  if (route.confidence > 50) {
    return `Moderate connection via ${route.link.name}`;
  }

  if (route.confidence > 20) {
    return `Weak connection - using ${route.protocol}`;
  }

  return 'Very weak signal - consider DTN mode';
}

import { AggregatedLink } from '../aggregation/signalAggregatorEngine';

export type RouteQuality = 'high' | 'medium' | 'low';

export interface RouteHistory {
  timestamp: number;
  link: AggregatedLink;
  score: number;
  success: boolean;
  latency: number;
}

const routeHistory: RouteHistory[] = [];
const MAX_HISTORY = 100;

export function recordRouteAttempt(
  link: AggregatedLink,
  success: boolean,
  latency: number
): void {
  routeHistory.push({
    timestamp: Date.now(),
    link,
    score: link.score,
    success,
    latency
  });

  // Keep only last 100 entries
  if (routeHistory.length > MAX_HISTORY) {
    routeHistory.shift();
  }
}

export function predictRoute(history: RouteHistory[] = routeHistory): RouteQuality {
  if (history.length === 0) return 'medium';

  const recentHistory = history.slice(-20); // Last 20 attempts
  const avgScore = recentHistory.reduce((sum, h) => sum + h.score, 0) / recentHistory.length;
  const successRate = recentHistory.filter(h => h.success).length / recentHistory.length;

  // Weighted score
  const weightedScore = (avgScore * 0.6) + (successRate * 100 * 0.4);

  if (weightedScore > 60) return 'high';
  if (weightedScore > 30) return 'medium';
  return 'low';
}

export function getRecommendedProtocol(quality: RouteQuality): string {
  switch (quality) {
    case 'high':
      return 'WebSocket';
    case 'medium':
      return 'MeshRelay';
    case 'low':
      return 'DTN';
  }
}

export function predictNextBestLink(deviceId: string): AggregatedLink | null {
  if (routeHistory.length < 5) return null;

  // Find link type with highest success rate
  const linkTypes = new Map<string, { success: number; total: number; avgScore: number }>();

  routeHistory.forEach(h => {
    const type = h.link.type;
    const current = linkTypes.get(type) || { success: 0, total: 0, avgScore: 0 };
    
    current.total++;
    if (h.success) current.success++;
    current.avgScore = ((current.avgScore * (current.total - 1)) + h.score) / current.total;
    
    linkTypes.set(type, current);
  });

  let bestType: string | null = null;
  let bestScore = 0;

  linkTypes.forEach((stats, type) => {
    const score = (stats.success / stats.total) * stats.avgScore;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  });

  return bestType ? routeHistory.find(h => h.link.type === bestType)?.link || null : null;
}

export function getAverageLatency(linkType?: string): number {
  let relevant = routeHistory;
  
  if (linkType) {
    relevant = routeHistory.filter(h => h.link.type === linkType);
  }

  if (relevant.length === 0) return 0;

  return relevant.reduce((sum, h) => sum + h.latency, 0) / relevant.length;
}

export function getSuccessRate(linkType?: string): number {
  let relevant = routeHistory;
  
  if (linkType) {
    relevant = routeHistory.filter(h => h.link.type === linkType);
  }

  if (relevant.length === 0) return 0;

  return (relevant.filter(h => h.success).length / relevant.length) * 100;
}

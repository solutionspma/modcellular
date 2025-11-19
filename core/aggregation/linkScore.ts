import { AggregatedLink } from './signalAggregatorEngine';

export function scoreLink(link: AggregatedLink | any): number {
  let score = 0;

  // Base score by type
  switch (link.type) {
    case 'wifi':
      score += 60;
      break;
    case 'satellite':
      score += 55;
      break;
    case 'mesh':
      score += 40;
      break;
    case 'bluetooth':
      score += 30;
      break;
    case 'rogue':
      score += 15;
      break;
  }

  // Signal strength factor (0-100 scale)
  score += (link.strength || 0) * 0.8;

  // Latency penalty
  if (link.latency) {
    score -= (link.latency * 0.2);
  }

  // Bandwidth bonus
  if (link.bandwidth) {
    score += Math.min(link.bandwidth / 1000, 50); // Cap at 50 points
  }

  // Open network bonus
  if (link.open) {
    score += 20;
  }

  // Active connection bonus
  if (link.isActive || link.isConnected) {
    score += 30;
  }

  return Math.max(0, score);
}

import { aggregateSignals, AggregatedLink } from '../aggregation/signalAggregatorEngine';

export interface FailoverDecision {
  shouldFailover: boolean;
  currentLink: AggregatedLink | null;
  backupLink: AggregatedLink | null;
  reason: string;
  confidence: number;
}

export async function failoverCheck(
  deviceId: string,
  currentLink: AggregatedLink | null
): Promise<FailoverDecision> {
  const links = await aggregateSignals(deviceId);
  
  const best = links[0] || null;
  const backup = links[1] || null;

  // No current link - use best available
  if (!currentLink) {
    return {
      shouldFailover: true,
      currentLink: null,
      backupLink: best,
      reason: 'No active connection',
      confidence: best ? 90 : 0
    };
  }

  // Current link is failing
  if (currentLink.score < 20) {
    if (backup && backup.score > currentLink.score * 1.5) {
      return {
        shouldFailover: true,
        currentLink,
        backupLink: backup,
        reason: 'Current link failing, better backup available',
        confidence: 85
      };
    }
    
    return {
      shouldFailover: false,
      currentLink,
      backupLink: backup,
      reason: 'Current link weak but no better alternative',
      confidence: 30
    };
  }

  // Better link available
  if (best && best.score > currentLink.score * 1.3) {
    return {
      shouldFailover: true,
      currentLink,
      backupLink: best,
      reason: 'Significantly better link available',
      confidence: 75
    };
  }

  // Current link is good
  return {
    shouldFailover: false,
    currentLink,
    backupLink: backup,
    reason: 'Current link stable',
    confidence: 95
  };
}

export async function executeFailover(
  decision: FailoverDecision,
  onFailover: (newLink: AggregatedLink) => void
): Promise<boolean> {
  if (!decision.shouldFailover || !decision.backupLink) {
    return false;
  }

  console.log(`Executing failover: ${decision.reason}`);
  
  // Update global best link
  if (typeof global !== 'undefined') {
    (global as any).bestLink = decision.backupLink;
  }

  onFailover(decision.backupLink);
  return true;
}

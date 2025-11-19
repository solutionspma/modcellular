import { getWalletAddress } from './wallet';

export interface RelayReward {
  nodeAddress: string;
  weight: number;
  timestamp: number;
  packetSize: number;
  relayType: 'mesh' | 'dtn' | 'fallback' | 'micro-packet';
}

export interface ReputationMetrics {
  packetsHandled: number;
  bytesRelayed: number;
  uptime: number;
  meshQuality: number;
  reliabilityScore: number;
  totalRewards: number;
}

// Global relay rewards queue
if (typeof global !== 'undefined') {
  (global as any).relayRewards = (global as any).relayRewards || [];
  (global as any).reputationMetrics = (global as any).reputationMetrics || {
    packetsHandled: 0,
    bytesRelayed: 0,
    uptime: 0,
    meshQuality: 100,
    reliabilityScore: 100,
    totalRewards: 0
  };
}

export async function rewardRelay(
  nodeAddress: string,
  weight: number,
  packetSize: number = 0,
  relayType: 'mesh' | 'dtn' | 'fallback' | 'micro-packet' = 'mesh'
): Promise<void> {
  const reward: RelayReward = {
    nodeAddress,
    weight,
    timestamp: Date.now(),
    packetSize,
    relayType
  };

  if (typeof global !== 'undefined') {
    const rewards = (global as any).relayRewards || [];
    rewards.push(reward);
    (global as any).relayRewards = rewards;

    // Update reputation metrics
    const metrics = (global as any).reputationMetrics;
    metrics.packetsHandled++;
    metrics.bytesRelayed += packetSize;
    metrics.totalRewards += weight;
    
    console.log(`Relay reward queued: ${weight} MODX for ${relayType} relay`);
  }
}

export function getRelayRewards(): RelayReward[] {
  if (typeof global !== 'undefined') {
    return (global as any).relayRewards || [];
  }
  return [];
}

export function getReputationMetrics(): ReputationMetrics {
  if (typeof global !== 'undefined') {
    return (global as any).reputationMetrics || {
      packetsHandled: 0,
      bytesRelayed: 0,
      uptime: 0,
      meshQuality: 100,
      reliabilityScore: 100,
      totalRewards: 0
    };
  }
  
  return {
    packetsHandled: 0,
    bytesRelayed: 0,
    uptime: 0,
    meshQuality: 100,
    reliabilityScore: 100,
    totalRewards: 0
  };
}

export function calculateReputationScore(): number {
  const metrics = getReputationMetrics();
  
  let score = 0;
  
  // Packets handled (max 30 points)
  score += Math.min(30, metrics.packetsHandled / 100);
  
  // Bytes relayed (max 30 points)
  score += Math.min(30, metrics.bytesRelayed / 1000000); // 1MB = 1 point
  
  // Mesh quality (max 20 points)
  score += (metrics.meshQuality / 100) * 20;
  
  // Reliability (max 20 points)
  score += (metrics.reliabilityScore / 100) * 20;
  
  return Math.min(100, Math.round(score));
}

export async function rewardSelfRelay(
  weight: number,
  packetSize: number,
  relayType: 'mesh' | 'dtn' | 'fallback' | 'micro-packet'
): Promise<void> {
  const address = await getWalletAddress();
  await rewardRelay(address, weight, packetSize, relayType);
}

export function clearRewards(): void {
  if (typeof global !== 'undefined') {
    (global as any).relayRewards = [];
  }
}

export function getTotalEarnings(): number {
  const rewards = getRelayRewards();
  return rewards.reduce((sum, r) => sum + r.weight, 0);
}

export function getEarningsByType(type: string): number {
  const rewards = getRelayRewards();
  return rewards
    .filter(r => r.relayType === type)
    .reduce((sum, r) => sum + r.weight, 0);
}

import { getReputationMetrics, calculateReputationScore } from './rewardsEngine';
import { getWalletAddress } from './wallet';

export interface DePINMetrics {
  deviceId: string;
  walletAddress: string;
  reputationScore: number;
  packetsRelayed: number;
  bytesContributed: number;
  uptimeHours: number;
  meshContribution: number;
  totalEarnings: number;
  rank: number;
  joinDate: number;
}

export interface NetworkStats {
  totalDevices: number;
  totalPacketsRelayed: number;
  totalBytesTransferred: number;
  activeNodes: number;
  networkCapacity: number;
}

let deviceMetrics: DePINMetrics | null = null;
let startTime: number = Date.now();

export async function initDePINMetrics(deviceId: string): Promise<DePINMetrics> {
  const walletAddress = await getWalletAddress();
  const repMetrics = getReputationMetrics();

  deviceMetrics = {
    deviceId,
    walletAddress,
    reputationScore: calculateReputationScore(),
    packetsRelayed: repMetrics.packetsHandled,
    bytesContributed: repMetrics.bytesRelayed,
    uptimeHours: 0,
    meshContribution: repMetrics.meshQuality,
    totalEarnings: repMetrics.totalRewards,
    rank: 0,
    joinDate: Date.now()
  };

  return deviceMetrics;
}

export function updateDePINMetrics(): DePINMetrics | null {
  if (!deviceMetrics) return null;

  const repMetrics = getReputationMetrics();
  const uptimeMs = Date.now() - startTime;

  deviceMetrics.reputationScore = calculateReputationScore();
  deviceMetrics.packetsRelayed = repMetrics.packetsHandled;
  deviceMetrics.bytesContributed = repMetrics.bytesRelayed;
  deviceMetrics.uptimeHours = uptimeMs / (1000 * 60 * 60);
  deviceMetrics.meshContribution = repMetrics.meshQuality;
  deviceMetrics.totalEarnings = repMetrics.totalRewards;

  return deviceMetrics;
}

export function getDePINMetrics(): DePINMetrics | null {
  return deviceMetrics;
}

export function calculateNetworkValue(): number {
  if (!deviceMetrics) return 0;

  // Network value formula:
  // (packets * 0.01) + (bytes / 1MB * 0.1) + (uptime * 0.5) + (reputation * 0.2)
  const packetValue = deviceMetrics.packetsRelayed * 0.01;
  const byteValue = (deviceMetrics.bytesContributed / 1000000) * 0.1;
  const uptimeValue = deviceMetrics.uptimeHours * 0.5;
  const reputationValue = deviceMetrics.reputationScore * 0.2;

  return packetValue + byteValue + uptimeValue + reputationValue;
}

export function estimateMonthlyEarnings(): number {
  if (!deviceMetrics) return 0;

  const hourlyRate = deviceMetrics.totalEarnings / Math.max(1, deviceMetrics.uptimeHours);
  return hourlyRate * 24 * 30; // 30 days
}

export function getContributionBreakdown(): {
  relay: number;
  mesh: number;
  dtn: number;
  fallback: number;
} {
  const repMetrics = getReputationMetrics();
  
  return {
    relay: repMetrics.packetsHandled * 0.4,
    mesh: repMetrics.packetsHandled * 0.3,
    dtn: repMetrics.packetsHandled * 0.2,
    fallback: repMetrics.packetsHandled * 0.1
  };
}

export function getNetworkImpact(): string {
  if (!deviceMetrics) return 'Unknown';

  const score = deviceMetrics.reputationScore;
  
  if (score >= 90) return 'Critical Infrastructure';
  if (score >= 75) return 'Major Contributor';
  if (score >= 50) return 'Active Node';
  if (score >= 25) return 'Participant';
  return 'New Device';
}

export async function exportDePINReport(): Promise<string> {
  const metrics = updateDePINMetrics();
  if (!metrics) return 'No metrics available';

  const breakdown = getContributionBreakdown();
  const impact = getNetworkImpact();
  const monthlyEstimate = estimateMonthlyEarnings();

  return `
MOD CELLULAR DEPIN REPORT
=========================

Device ID: ${metrics.deviceId}
Wallet: ${metrics.walletAddress}

REPUTATION: ${metrics.reputationScore}/100
Network Impact: ${impact}

CONTRIBUTIONS:
- Packets Relayed: ${metrics.packetsRelayed.toLocaleString()}
- Data Contributed: ${(metrics.bytesContributed / 1000000).toFixed(2)} MB
- Uptime: ${metrics.uptimeHours.toFixed(1)} hours
- Mesh Quality: ${metrics.meshContribution}%

BREAKDOWN:
- Relay: ${breakdown.relay.toFixed(0)} packets
- Mesh: ${breakdown.mesh.toFixed(0)} packets
- DTN: ${breakdown.dtn.toFixed(0)} packets
- Fallback: ${breakdown.fallback.toFixed(0)} packets

EARNINGS:
- Total: ${metrics.totalEarnings.toFixed(4)} MODX
- Est. Monthly: ${monthlyEstimate.toFixed(4)} MODX
- Network Value: ${calculateNetworkValue().toFixed(2)} MODX

Join Date: ${new Date(metrics.joinDate).toLocaleDateString()}
`;
}

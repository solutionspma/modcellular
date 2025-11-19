import { sniffSatellite, isSatelliteAvailable } from './satSniffer';

export interface SatellitePacket {
  id: string;
  data: any;
  timestamp: number;
  priority: number;
}

export async function satelliteFallback(packet: SatellitePacket): Promise<boolean> {
  const available = await isSatelliteAvailable();
  
  if (!available) {
    console.log('Satellite not available for fallback');
    return false;
  }

  const sat = await sniffSatellite();
  
  if (!sat || sat.strength < 20) {
    return false;
  }

  // Placeholder: Future Starlink/Iridium relay logic
  console.log(`Satellite fallback ready: ${sat.provider} @ ${sat.strength} strength`);
  
  // Store for satellite transmission queue
  return true;
}

export async function queueForSatellite(data: any, priority: number = 5): Promise<void> {
  const packet: SatellitePacket = {
    id: `sat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    data,
    timestamp: Date.now(),
    priority
  };

  // Future: Queue in persistent storage for sat transmission
  console.log('Queued for satellite transmission:', packet.id);
}

export async function estimateSatelliteLatency(): Promise<number> {
  const sat = await sniffSatellite();
  
  if (!sat || !sat.open) {
    return 999999; // Effectively infinite
  }

  // GPS/GLONASS metadata transmission: ~500-2000ms
  // Future Starlink: ~20-40ms
  return sat.strength > 50 ? 500 : 2000;
}

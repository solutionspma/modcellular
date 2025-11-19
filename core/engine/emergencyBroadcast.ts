import { storeForLater } from '../routing/dtnEngine';

export interface EmergencyMessage {
  type: 'EMERGENCY';
  text: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
  priority: number;
  sender: string;
}

export async function emergencyBroadcast(
  msg: string,
  sender: string,
  location?: { latitude: number; longitude: number; accuracy: number }
): Promise<void> {
  const emergency: EmergencyMessage = {
    type: 'EMERGENCY',
    text: msg,
    location,
    timestamp: Date.now(),
    priority: 999, // Maximum priority
    sender
  };

  // Store in DTN with maximum priority
  await storeForLater(JSON.stringify(emergency), 'EMERGENCY_BROADCAST', 999);

  console.log('🚨 EMERGENCY BROADCAST QUEUED:', msg);
}

export async function sendSOSBeacon(
  sender: string,
  location?: { latitude: number; longitude: number; accuracy: number }
): Promise<void> {
  await emergencyBroadcast('SOS - Emergency assistance needed', sender, location);
}

export function isEmergencyMessage(msg: any): msg is EmergencyMessage {
  return msg && msg.type === 'EMERGENCY' && msg.priority === 999;
}

export function parseEmergencyMessage(data: string): EmergencyMessage | null {
  try {
    const parsed = JSON.parse(data);
    return isEmergencyMessage(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

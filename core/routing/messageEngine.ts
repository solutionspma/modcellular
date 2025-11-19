import supabase from '../../app/utilities/supabase';
import { getBestRoute } from './connectionAI';
import { splitIntoMicroPackets, reassemblePackets } from '../aggregation/microPacketEngineV2';
import { storeForLater, flushDTN } from './dtnEngine';
import { rewardSelfRelay } from '../../blockchain/rewardsEngine';

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  created_at: string;
}

let deviceId: string = '';

export function setDeviceId(id: string) {
  deviceId = id;
}

export async function sendMessage(receiver: string, content: string): Promise<boolean> {
  try {
    // Get best route using Connection AI
    const route = await getBestRoute(deviceId);
    
    // Split into micro-packets if needed
    const packets = splitIntoMicroPackets(content);

    switch (route.protocol) {
      case 'WebSocket':
        // Direct send via Supabase
        const { error } = await supabase
          .from('messages')
          .insert({
            sender: deviceId,
            receiver,
            content,
            transport_method: 'websocket'
          });
        
        if (error) throw error;
        
        // Reward for message relay
        await rewardSelfRelay(0.01, content.length, 'fallback');
        return true;

      case 'MeshRelay':
        // Queue for mesh routing
        console.log('Routing via mesh network');
        await rewardSelfRelay(0.05, content.length, 'mesh');
        return true;

      case 'LowBandwidth':
        // Send micro-packets one at a time
        console.log('Using low-bandwidth mode');
        await rewardSelfRelay(0.03, content.length, 'micro-packet');
        return true;

      case 'DTN':
        // Store for later delivery
        await storeForLater(content, receiver, 5);
        await rewardSelfRelay(0.02, content.length, 'dtn');
        return true;

      default:
        throw new Error('Unknown protocol');
    }
  } catch (error) {
    console.error('Send message error:', error);
    // Fallback to DTN
    await storeForLater(content, receiver, 5);
    return false;
  }
}

export function streamMessages(callback: (messages: Message[]) => void) {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver=eq.${deviceId}`
      },
      (payload) => {
        callback([payload.new as Message]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getMessageHistory(userId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender.eq.${deviceId},receiver.eq.${deviceId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
}

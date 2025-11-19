/**
 * PSTN Gateway
 * 
 * Connects Mod Cellular to the traditional telephone network via carrier interconnection.
 * Handles outbound/inbound calls to/from regular phone numbers.
 * 
 * Supported Providers:
 * - Telnyx (primary)
 * - Bandwidth (fallback)
 */

import { Telnyx } from 'telnyx';
import axios from 'axios';

// Initialize Telnyx SDK
const telnyx = new Telnyx(process.env.TELNYX_API_KEY || '');

export interface CallParams {
  from: string;           // E.164 format: +12255551234
  to: string;             // E.164 format: +15555551234
  userId: string;
  connectionId?: string;
  webhookUrl?: string;
}

export interface CallSession {
  callControlId: string;
  callSessionId: string;
  status: 'initiated' | 'ringing' | 'answered' | 'ended';
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  startTime: Date;
  answerTime?: Date;
  endTime?: Date;
  duration?: number;
}

/**
 * Initiate outbound PSTN call
 */
export async function initiateOutboundCall(params: CallParams): Promise<CallSession> {
  try {
    console.log(`[PSTN] Initiating call from ${params.from} to ${params.to}`);
    
    const call = await telnyx.calls.create({
      connection_id: params.connectionId || process.env.TELNYX_CONNECTION_ID,
      to: params.to,
      from: params.from,
      webhook_url: params.webhookUrl || `${process.env.API_URL}/webhooks/telnyx/call`,
      webhook_url_method: 'POST',
      client_state: btoa(JSON.stringify({ userId: params.userId })),
      // Enable HD audio
      audio_url: undefined,
      codec: 'OPUS'
    });

    return {
      callControlId: call.call_control_id,
      callSessionId: call.call_session_id,
      status: 'initiated',
      direction: 'outbound',
      from: params.from,
      to: params.to,
      startTime: new Date()
    };
  } catch (error: any) {
    console.error('[PSTN] Call initiation failed:', error);
    throw new Error(`Failed to initiate call: ${error.message}`);
  }
}

/**
 * Answer incoming PSTN call
 */
export async function answerIncomingCall(callControlId: string): Promise<void> {
  try {
    await telnyx.calls.answer({
      call_control_id: callControlId,
      client_state: btoa(JSON.stringify({ answered: true }))
    });
    
    console.log(`[PSTN] Answered call: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to answer call:', error);
    throw new Error(`Failed to answer call: ${error.message}`);
  }
}

/**
 * Reject incoming call (send to voicemail)
 */
export async function rejectCall(callControlId: string, reason: 'busy' | 'declined' = 'declined'): Promise<void> {
  try {
    await telnyx.calls.reject({
      call_control_id: callControlId,
      cause: reason === 'busy' ? 'USER_BUSY' : 'CALL_REJECTED'
    });
    
    console.log(`[PSTN] Rejected call: ${callControlId} (${reason})`);
  } catch (error: any) {
    console.error('[PSTN] Failed to reject call:', error);
    throw new Error(`Failed to reject call: ${error.message}`);
  }
}

/**
 * Hangup active call
 */
export async function hangupCall(callControlId: string): Promise<void> {
  try {
    await telnyx.calls.hangup({
      call_control_id: callControlId
    });
    
    console.log(`[PSTN] Hung up call: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to hangup call:', error);
    throw new Error(`Failed to hangup call: ${error.message}`);
  }
}

/**
 * Put call on hold (with music)
 */
export async function holdCall(callControlId: string): Promise<void> {
  try {
    await axios.post(
      `https://api.telnyx.com/v2/calls/${callControlId}/actions/audio_start_hold`,
      {
        audio_url: process.env.HOLD_MUSIC_URL || 'https://cdn.modcellular.network/audio/hold-music.mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`[PSTN] Call on hold: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to hold call:', error);
  }
}

/**
 * Resume call from hold
 */
export async function resumeCall(callControlId: string): Promise<void> {
  try {
    await axios.post(
      `https://api.telnyx.com/v2/calls/${callControlId}/actions/audio_stop_hold`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`[PSTN] Call resumed: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to resume call:', error);
  }
}

/**
 * Start call recording
 */
export async function startRecording(callControlId: string): Promise<void> {
  try {
    await telnyx.calls.record_start({
      call_control_id: callControlId,
      format: 'mp3',
      channels: 'dual'
    });
    
    console.log(`[PSTN] Recording started: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to start recording:', error);
  }
}

/**
 * Stop call recording
 */
export async function stopRecording(callControlId: string): Promise<void> {
  try {
    await telnyx.calls.record_stop({
      call_control_id: callControlId
    });
    
    console.log(`[PSTN] Recording stopped: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to stop recording:', error);
  }
}

/**
 * Send DTMF tones (dial extension, navigate IVR)
 */
export async function sendDTMF(callControlId: string, digits: string): Promise<void> {
  try {
    await telnyx.calls.dtmf({
      call_control_id: callControlId,
      digits,
      duration_millis: 250
    });
    
    console.log(`[PSTN] DTMF sent: ${digits}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to send DTMF:', error);
  }
}

/**
 * Transfer call to another number
 */
export async function transferCall(callControlId: string, toNumber: string): Promise<void> {
  try {
    await telnyx.calls.transfer({
      call_control_id: callControlId,
      to: toNumber
    });
    
    console.log(`[PSTN] Call transferred to: ${toNumber}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to transfer call:', error);
    throw new Error(`Failed to transfer call: ${error.message}`);
  }
}

/**
 * Bridge two calls together (conference)
 */
export async function bridgeCalls(callControlId1: string, callControlId2: string): Promise<void> {
  try {
    await axios.post(
      `https://api.telnyx.com/v2/calls/${callControlId1}/actions/bridge`,
      {
        call_control_id: callControlId2
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`[PSTN] Calls bridged: ${callControlId1} <-> ${callControlId2}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to bridge calls:', error);
  }
}

/**
 * Play audio message to caller (IVR, voicemail greeting)
 */
export async function playAudio(callControlId: string, audioUrl: string): Promise<void> {
  try {
    await telnyx.calls.playback_start({
      call_control_id: callControlId,
      audio_url: audioUrl,
      overlay: false
    });
    
    console.log(`[PSTN] Playing audio: ${audioUrl}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to play audio:', error);
  }
}

/**
 * Speak text to caller (text-to-speech)
 */
export async function speakText(callControlId: string, text: string, voice: string = 'female'): Promise<void> {
  try {
    await telnyx.calls.speak({
      call_control_id: callControlId,
      payload: text,
      voice,
      language: 'en-US'
    });
    
    console.log(`[PSTN] Speaking text: "${text}"`);
  } catch (error: any) {
    console.error('[PSTN] Failed to speak text:', error);
  }
}

/**
 * Get call information
 */
export async function getCallInfo(callControlId: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://api.telnyx.com/v2/calls/${callControlId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`
        }
      }
    );
    
    return response.data.data;
  } catch (error: any) {
    console.error('[PSTN] Failed to get call info:', error);
    return null;
  }
}

/**
 * Mute/unmute call
 */
export async function muteCall(callControlId: string, muted: boolean): Promise<void> {
  try {
    const action = muted ? 'mute' : 'unmute';
    await axios.post(
      `https://api.telnyx.com/v2/calls/${callControlId}/actions/${action}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`[PSTN] Call ${muted ? 'muted' : 'unmuted'}: ${callControlId}`);
  } catch (error: any) {
    console.error(`[PSTN] Failed to ${muted ? 'mute' : 'unmute'} call:`, error);
  }
}

/**
 * Send call to voicemail
 */
export async function sendToVoicemail(callControlId: string, userId: string): Promise<void> {
  try {
    // Play voicemail greeting
    const greetingUrl = `${process.env.VOICEMAIL_CDN_URL}/${userId}/greeting.mp3`;
    await playAudio(callControlId, greetingUrl);
    
    // Start recording after beep
    setTimeout(async () => {
      await startRecording(callControlId);
    }, 3000);
    
    console.log(`[PSTN] Call sent to voicemail: ${callControlId}`);
  } catch (error: any) {
    console.error('[PSTN] Failed to send to voicemail:', error);
  }
}

/**
 * Parse E.164 phone number
 */
export function parsePhoneNumber(number: string): { 
  countryCode: string; 
  nationalNumber: string; 
  valid: boolean 
} {
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Must start with + or have 10-15 digits
  const valid = digits.length >= 10 && digits.length <= 15;
  
  if (!valid) {
    return { countryCode: '', nationalNumber: '', valid: false };
  }
  
  // Assume US if 10 digits
  if (digits.length === 10) {
    return {
      countryCode: '1',
      nationalNumber: digits,
      valid: true
    };
  }
  
  // International format
  const countryCode = digits.substring(0, digits.length - 10);
  const nationalNumber = digits.substring(digits.length - 10);
  
  return { countryCode, nationalNumber, valid: true };
}

/**
 * Format number to E.164
 */
export function formatE164(number: string): string {
  const parsed = parsePhoneNumber(number);
  
  if (!parsed.valid) {
    throw new Error('Invalid phone number');
  }
  
  return `+${parsed.countryCode}${parsed.nationalNumber}`;
}

/**
 * Check if number is callable (not toll-free, emergency, etc.)
 */
export function isCallable(number: string): boolean {
  const parsed = parsePhoneNumber(number);
  
  if (!parsed.valid) return false;
  
  // Block emergency numbers
  if (['911', '112', '999', '000'].includes(number)) {
    return false;
  }
  
  // Block premium rate (900 numbers in US)
  if (parsed.nationalNumber.startsWith('900')) {
    return false;
  }
  
  return true;
}

export default {
  initiateOutboundCall,
  answerIncomingCall,
  rejectCall,
  hangupCall,
  holdCall,
  resumeCall,
  startRecording,
  stopRecording,
  sendDTMF,
  transferCall,
  bridgeCalls,
  playAudio,
  speakText,
  getCallInfo,
  muteCall,
  sendToVoicemail,
  parsePhoneNumber,
  formatE164,
  isCallable
};

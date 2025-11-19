/**
 * SIP/WebRTC Client
 * 
 * Handles real-time voice communication using SIP over WebRTC.
 * Provides the audio connection between app and PSTN gateway.
 */

import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';

export interface SIPConfig {
  domain: string;
  username: string;
  password: string;
  displayName?: string;
  stunServers?: string[];
  turnServers?: Array<{
    urls: string;
    username?: string;
    credential?: string;
  }>;
}

export interface SIPSession {
  sessionId: string;
  direction: 'inbound' | 'outbound';
  remoteNumber: string;
  localNumber: string;
  status: 'connecting' | 'ringing' | 'established' | 'ended';
  peerConnection: RTCPeerConnection;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

export class SIPClient {
  private config: SIPConfig;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private sessions: Map<string, SIPSession> = new Map();
  private registered: boolean = false;

  constructor(config: SIPConfig) {
    this.config = config;
  }

  /**
   * Register SIP client with server
   */
  async register(): Promise<void> {
    try {
      console.log('[SIP] Registering with domain:', this.config.domain);
      
      // In production, this would connect to SIP server via WebSocket
      // For now, we simulate registration
      this.registered = true;
      
      console.log('[SIP] Registration successful');
    } catch (error: any) {
      console.error('[SIP] Registration failed:', error);
      throw new Error(`SIP registration failed: ${error.message}`);
    }
  }

  /**
   * Unregister from SIP server
   */
  async unregister(): Promise<void> {
    this.registered = false;
    console.log('[SIP] Unregistered');
  }

  /**
   * Create peer connection with ICE servers
   */
  private createPeerConnection(): RTCPeerConnection {
    const configuration = {
      iceServers: [
        // Default STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Custom STUN servers
        ...(this.config.stunServers?.map(url => ({ urls: url })) || []),
        // TURN servers (for NAT traversal)
        ...(this.config.turnServers || [])
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(configuration);

    // ICE candidate gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[SIP] ICE candidate:', event.candidate);
        // In production, send to signaling server
      }
    };

    // ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('[SIP] ICE connection state:', pc.iceConnectionState);
    };

    // Remote stream received
    pc.ontrack = (event) => {
      console.log('[SIP] Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
      }
    };

    return pc;
  }

  /**
   * Get user media (microphone access)
   */
  private async getUserMedia(): Promise<MediaStream> {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,  // HD audio
          channelCount: 1
        },
        video: false
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      console.log('[SIP] Got user media:', stream.getTracks().length, 'tracks');
      
      return stream;
    } catch (error: any) {
      console.error('[SIP] Failed to get user media:', error);
      throw new Error(`Microphone access denied: ${error.message}`);
    }
  }

  /**
   * Initiate outbound call
   */
  async makeCall(params: {
    from: string;
    to: string;
    sessionId: string;
  }): Promise<SIPSession> {
    if (!this.registered) {
      throw new Error('SIP client not registered');
    }

    try {
      console.log(`[SIP] Making call from ${params.from} to ${params.to}`);

      // Create peer connection
      this.peerConnection = this.createPeerConnection();

      // Get local media stream
      this.localStream = await this.getUserMedia();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });

      await this.peerConnection.setLocalDescription(offer);

      // In production, send offer to SIP server via WebSocket
      console.log('[SIP] SDP offer created:', offer.sdp?.substring(0, 100));

      const session: SIPSession = {
        sessionId: params.sessionId,
        direction: 'outbound',
        remoteNumber: params.to,
        localNumber: params.from,
        status: 'connecting',
        peerConnection: this.peerConnection,
        localStream: this.localStream
      };

      this.sessions.set(params.sessionId, session);

      return session;
    } catch (error: any) {
      console.error('[SIP] Failed to make call:', error);
      throw new Error(`Failed to make call: ${error.message}`);
    }
  }

  /**
   * Answer incoming call
   */
  async answerCall(sessionId: string, sdpOffer: string): Promise<SIPSession> {
    if (!this.registered) {
      throw new Error('SIP client not registered');
    }

    try {
      console.log('[SIP] Answering call:', sessionId);

      // Create peer connection
      this.peerConnection = this.createPeerConnection();

      // Get local media stream
      this.localStream = await this.getUserMedia();

      // Add local stream
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Set remote description (offer from caller)
      const remoteDesc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdpOffer
      });
      await this.peerConnection.setRemoteDescription(remoteDesc);

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // In production, send answer to SIP server
      console.log('[SIP] SDP answer created:', answer.sdp?.substring(0, 100));

      const session: SIPSession = {
        sessionId,
        direction: 'inbound',
        remoteNumber: 'unknown',  // Would come from signaling
        localNumber: this.config.username,
        status: 'established',
        peerConnection: this.peerConnection,
        localStream: this.localStream
      };

      this.sessions.set(sessionId, session);

      return session;
    } catch (error: any) {
      console.error('[SIP] Failed to answer call:', error);
      throw new Error(`Failed to answer call: ${error.message}`);
    }
  }

  /**
   * End call
   */
  async endCall(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.warn('[SIP] Session not found:', sessionId);
      return;
    }

    try {
      console.log('[SIP] Ending call:', sessionId);

      // Stop local tracks
      session.localStream?.getTracks().forEach(track => track.stop());

      // Close peer connection
      session.peerConnection.close();

      // Remove session
      this.sessions.delete(sessionId);

      console.log('[SIP] Call ended successfully');
    } catch (error: any) {
      console.error('[SIP] Error ending call:', error);
    }
  }

  /**
   * Mute/unmute microphone
   */
  setMuted(sessionId: string, muted: boolean): void {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.localStream) {
      console.warn('[SIP] Session or local stream not found');
      return;
    }

    session.localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });

    console.log(`[SIP] Microphone ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Enable/disable speaker
   */
  setSpeakerEnabled(enabled: boolean): void {
    // Platform-specific implementation
    console.log(`[SIP] Speaker ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Send DTMF tone
   */
  async sendDTMF(sessionId: string, tone: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Get audio sender
    const senders = session.peerConnection.getSenders();
    const audioSender = senders.find(sender => sender.track?.kind === 'audio');

    if (!audioSender) {
      throw new Error('Audio sender not found');
    }

    try {
      // Send DTMF via RTP
      const dtmfSender = audioSender.dtmf;
      if (dtmfSender) {
        await dtmfSender.insertDTMF(tone, 250, 50);
        console.log('[SIP] DTMF sent:', tone);
      }
    } catch (error: any) {
      console.error('[SIP] Failed to send DTMF:', error);
    }
  }

  /**
   * Get session statistics (audio quality, latency, packet loss)
   */
  async getSessionStats(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    try {
      const stats = await session.peerConnection.getStats();
      const report: any = {};

      stats.forEach((stat: any) => {
        if (stat.type === 'inbound-rtp' && stat.mediaType === 'audio') {
          report.inbound = {
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost,
            jitter: stat.jitter,
            bytesReceived: stat.bytesReceived
          };
        }
        
        if (stat.type === 'outbound-rtp' && stat.mediaType === 'audio') {
          report.outbound = {
            packetsSent: stat.packetsSent,
            bytesSent: stat.bytesSent
          };
        }

        if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          report.connection = {
            currentRoundTripTime: stat.currentRoundTripTime,
            availableOutgoingBitrate: stat.availableOutgoingBitrate
          };
        }
      });

      return report;
    } catch (error: any) {
      console.error('[SIP] Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): SIPSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Check if registered
   */
  isRegistered(): boolean {
    return this.registered;
  }

  /**
   * Cleanup all sessions
   */
  async cleanup(): Promise<void> {
    console.log('[SIP] Cleaning up all sessions');

    for (const sessionId of this.sessions.keys()) {
      await this.endCall(sessionId);
    }

    await this.unregister();
  }
}

/**
 * Create SIP client instance
 */
export function createSIPClient(userId: string): SIPClient {
  const config: SIPConfig = {
    domain: process.env.SIP_DOMAIN || 'sip.modcellular.network',
    username: userId,
    password: process.env.SIP_PASSWORD || '',
    displayName: userId,
    stunServers: [
      'stun:stun.modcellular.network:3478'
    ],
    turnServers: [
      {
        urls: 'turn:turn.modcellular.network:3478',
        username: 'moduser',
        credential: process.env.TURN_PASSWORD || ''
      }
    ]
  };

  return new SIPClient(config);
}

export default SIPClient;

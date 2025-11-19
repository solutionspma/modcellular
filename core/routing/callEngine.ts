import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let peerConnection: RTCPeerConnection | null = null;
let localStream: any = null;

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function initCallEngine(serverUrl: string, deviceId: string) {
  socket = io(serverUrl);

  socket.on('connect', () => {
    console.log('Connected to signaling server');
    socket?.emit('auth', { userId: deviceId, deviceId });
  });

  socket.on('call:incoming', handleIncomingCall);
  socket.on('call:answered', handleCallAnswered);
  socket.on('call:ice-candidate', handleIceCandidate);
  socket.on('call:ended', handleCallEnded);
}

async function setupPeerConnection() {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && socket) {
      socket.emit('call:ice-candidate', {
        candidate: event.candidate
      });
    }
  };

  peerConnection.ontrack = (event) => {
    // Handle remote stream
    console.log('Remote track received:', event);
  };

  // Get local media stream
  try {
    localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    localStream.getTracks().forEach((track: any) => {
      peerConnection?.addTrack(track, localStream);
    });
  } catch (error) {
    console.error('Failed to get local media:', error);
  }
}

export async function startCall(calleeId: string, callType: 'audio' | 'video' = 'audio') {
  try {
    await setupPeerConnection();

    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);

    socket?.emit('call:offer', {
      calleeId,
      offer: offer.sdp,
      callType
    });

    return true;
  } catch (error) {
    console.error('Start call error:', error);
    return false;
  }
}

async function handleIncomingCall(data: any) {
  try {
    await setupPeerConnection();

    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: data.offer
    });

    await peerConnection!.setRemoteDescription(offer);

    const answer = await peerConnection!.createAnswer();
    await peerConnection!.setLocalDescription(answer);

    socket?.emit('call:answer', {
      callId: data.callId,
      answer: answer.sdp
    });
  } catch (error) {
    console.error('Handle incoming call error:', error);
  }
}

async function handleCallAnswered(data: any) {
  try {
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: data.answer
    });

    await peerConnection?.setRemoteDescription(answer);
  } catch (error) {
    console.error('Handle call answered error:', error);
  }
}

async function handleIceCandidate(data: any) {
  try {
    const candidate = new RTCIceCandidate(data.candidate);
    await peerConnection?.addIceCandidate(candidate);
  } catch (error) {
    console.error('Handle ICE candidate error:', error);
  }
}

function handleCallEnded(data: any) {
  endCall();
}

export function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track: any) => track.stop());
    localStream = null;
  }

  socket?.emit('call:end', {});
}

export function toggleMute(muted: boolean) {
  if (localStream) {
    localStream.getAudioTracks().forEach((track: any) => {
      track.enabled = !muted;
    });
  }
}

export function toggleVideo(enabled: boolean) {
  if (localStream) {
    localStream.getVideoTracks().forEach((track: any) => {
      track.enabled = enabled;
    });
  }
}

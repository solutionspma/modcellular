import { TelnyxRTC } from '@telnyx/webrtc';

export const createTelnyxClient = (loginToken) => {
  const client = new TelnyxRTC({
    login_token: loginToken,
    ringtoneFile: null,
    ringbackFile: null
  });
  
  return client;
};

export const makeCall = (client, destination) => {
  return client.newCall({
    destinationNumber: destination,
    callerNumber: '+12255551234', // Will be user's assigned number
    audio: true,
    video: false
  });
};

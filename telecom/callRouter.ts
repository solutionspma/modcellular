/**
 * Call Router
 * 
 * Intelligent routing engine for inbound/outbound calls.
 * Determines optimal path: PSTN, VoIP, mesh, or hybrid.
 */

import { initiateOutboundCall } from './pstnGateway';
import { createSIPClient } from './sipClient';

export interface CallRoute {
  method: 'pstn' | 'voip' | 'mesh' | 'hybrid';
  priority: number;
  cost: number;
  latency: number;
  quality: 'hd' | 'standard' | 'low';
}

export interface RoutingDecision {
  selectedRoute: CallRoute;
  fallbackRoutes: CallRoute[];
  reason: string;
}

export interface CallContext {
  userId: string;
  fromNumber: string;
  toNumber: string;
  subscriptionTier: 'free' | 'premium' | 'business' | 'enterprise';
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
}

/**
 * Determine optimal route for outbound call
 */
export async function routeOutboundCall(context: CallContext): Promise<RoutingDecision> {
  console.log('[ROUTER] Determining route for call:', context.fromNumber, '->', context.toNumber);

  const availableRoutes = await evaluateRoutes(context);
  
  // Sort by priority (highest first)
  availableRoutes.sort((a, b) => b.priority - a.priority);

  const selectedRoute = availableRoutes[0];
  const fallbackRoutes = availableRoutes.slice(1);

  let reason = '';
  
  switch (selectedRoute.method) {
    case 'pstn':
      reason = 'Traditional cellular network - highest reliability';
      break;
    case 'voip':
      reason = 'VoIP over WiFi/data - zero cost, HD audio';
      break;
    case 'mesh':
      reason = 'Mesh relay - earn MODX tokens';
      break;
    case 'hybrid':
      reason = 'Hybrid routing - optimized for quality + cost';
      break;
  }

  console.log('[ROUTER] Selected route:', selectedRoute.method, '-', reason);

  return {
    selectedRoute,
    fallbackRoutes,
    reason
  };
}

/**
 * Evaluate all possible routes
 */
async function evaluateRoutes(context: CallContext): Promise<CallRoute[]> {
  const routes: CallRoute[] = [];

  // PSTN Route (always available)
  routes.push({
    method: 'pstn',
    priority: calculatePSTNPriority(context),
    cost: calculatePSTNCost(context),
    latency: 100,  // ~100ms typical
    quality: 'standard'
  });

  // VoIP Route (if WiFi/data available)
  const hasInternet = await checkInternetConnection();
  if (hasInternet) {
    routes.push({
      method: 'voip',
      priority: calculateVoIPPriority(context),
      cost: 0,  // Free over internet
      latency: 50,  // ~50ms typical
      quality: 'hd'
    });
  }

  // Mesh Route (if recipient on Mod Cellular)
  const recipientOnMesh = await checkRecipientOnMesh(context.toNumber);
  if (recipientOnMesh) {
    routes.push({
      method: 'mesh',
      priority: calculateMeshPriority(context),
      cost: 0,  // Free + earn MODX
      latency: 30,  // ~30ms typical (local)
      quality: 'hd'
    });
  }

  // Hybrid Route (combination of above)
  if (hasInternet && context.subscriptionTier !== 'free') {
    routes.push({
      method: 'hybrid',
      priority: calculateHybridPriority(context),
      cost: calculateHybridCost(context),
      latency: 60,
      quality: 'hd'
    });
  }

  return routes;
}

/**
 * Calculate PSTN priority based on context
 */
function calculatePSTNPriority(context: CallContext): number {
  let priority = 50;  // Base priority

  // Low battery? Use PSTN (less processing)
  if (context.batteryLevel && context.batteryLevel < 20) {
    priority += 30;
  }

  // Poor network? PSTN might be more reliable
  if (context.networkQuality === 'poor') {
    priority += 20;
  }

  // Free tier users get lower PSTN priority (encourage VoIP)
  if (context.subscriptionTier === 'free') {
    priority -= 20;
  }

  return priority;
}

/**
 * Calculate VoIP priority
 */
function calculateVoIPPriority(context: CallContext): number {
  let priority = 70;  // Base priority (VoIP preferred)

  // Excellent network? VoIP is great
  if (context.networkQuality === 'excellent') {
    priority += 20;
  }

  // Premium users get HD VoIP
  if (context.subscriptionTier === 'premium' || context.subscriptionTier === 'business') {
    priority += 10;
  }

  // Low battery? VoIP uses more power
  if (context.batteryLevel && context.batteryLevel < 20) {
    priority -= 30;
  }

  return priority;
}

/**
 * Calculate mesh priority
 */
function calculateMeshPriority(context: CallContext): number {
  let priority = 90;  // Highest priority (free + earn MODX)

  // Both users on Mod Cellular = perfect mesh call
  priority += 10;

  // Poor network? Mesh might struggle
  if (context.networkQuality === 'poor') {
    priority -= 40;
  }

  return priority;
}

/**
 * Calculate hybrid priority
 */
function calculateHybridPriority(context: CallContext): number {
  let priority = 60;  // Balanced priority

  // Business/Enterprise users get smart hybrid routing
  if (context.subscriptionTier === 'business' || context.subscriptionTier === 'enterprise') {
    priority += 20;
  }

  return priority;
}

/**
 * Calculate PSTN cost per minute
 */
function calculatePSTNCost(context: CallContext): number {
  const { toNumber } = context;

  // US/Canada: $0.01/min
  if (toNumber.startsWith('+1')) {
    return 0.01;
  }

  // International: varies by country
  // UK: $0.02/min
  if (toNumber.startsWith('+44')) {
    return 0.02;
  }

  // Default international: $0.05/min
  return 0.05;
}

/**
 * Calculate hybrid cost (reduced PSTN usage)
 */
function calculateHybridCost(context: CallContext): number {
  return calculatePSTNCost(context) * 0.5;  // 50% cheaper via hybrid
}

/**
 * Check internet connection
 */
async function checkInternetConnection(): Promise<boolean> {
  // In production: check actual network state
  return true;  // Assume available for now
}

/**
 * Check if recipient is on Mod Cellular mesh network
 */
async function checkRecipientOnMesh(phoneNumber: string): Promise<boolean> {
  // In production: query user database
  // SELECT EXISTS(SELECT 1 FROM users WHERE phone_number = $1)
  return false;  // Assume not on mesh for now
}

/**
 * Route inbound call to user
 */
export async function routeInboundCall(params: {
  callControlId: string;
  fromNumber: string;
  toNumber: string;
}): Promise<void> {
  console.log('[ROUTER] Routing inbound call from', params.fromNumber, 'to', params.toNumber);

  // Find user by phone number
  const user = await findUserByPhoneNumber(params.toNumber);

  if (!user) {
    console.error('[ROUTER] User not found for number:', params.toNumber);
    // Send to voicemail or reject
    return;
  }

  // Check user availability
  const isAvailable = await checkUserAvailability(user.id);

  if (!isAvailable) {
    console.log('[ROUTER] User unavailable, sending to voicemail');
    // TODO: Send to voicemail
    return;
  }

  // Check Do Not Disturb
  const dndEnabled = await checkDoNotDisturb(user.id);

  if (dndEnabled) {
    console.log('[ROUTER] Do Not Disturb enabled, sending to voicemail');
    // TODO: Send to voicemail
    return;
  }

  // Check spam filter
  const isSpam = await checkSpamFilter(params.fromNumber, user.id);

  if (isSpam) {
    console.log('[ROUTER] Spam detected, blocking call');
    // TODO: Reject call
    return;
  }

  // Ring user's app via push notification + WebRTC
  await ringUser(user.id, params.callControlId, params.fromNumber);
}

/**
 * Find user by phone number
 */
async function findUserByPhoneNumber(phoneNumber: string): Promise<any> {
  // In production: database query
  // SELECT * FROM users WHERE phone_number = $1
  return null;
}

/**
 * Check if user is available (online, not on another call)
 */
async function checkUserAvailability(userId: string): Promise<boolean> {
  // In production: check user's online status
  return true;
}

/**
 * Check if Do Not Disturb is enabled
 */
async function checkDoNotDisturb(userId: string): Promise<boolean> {
  // In production: check user settings
  return false;
}

/**
 * Check if number is spam
 */
async function checkSpamFilter(fromNumber: string, userId: string): Promise<boolean> {
  // In production: query spam database + user blocklist
  return false;
}

/**
 * Ring user's device
 */
async function ringUser(userId: string, callControlId: string, fromNumber: string): Promise<void> {
  console.log('[ROUTER] Ringing user:', userId);

  // Send push notification
  // await sendPushNotification(userId, {
  //   title: 'Incoming Call',
  //   body: `Call from ${fromNumber}`,
  //   data: { callControlId, fromNumber }
  // });

  // Establish WebRTC session when user answers
}

/**
 * Handle call forwarding
 */
export async function forwardCall(params: {
  callControlId: string;
  fromNumber: string;
  forwardToNumber: string;
}): Promise<void> {
  console.log('[ROUTER] Forwarding call to:', params.forwardToNumber);

  // Transfer call via PSTN gateway
  // await transferCall(params.callControlId, params.forwardToNumber);
}

/**
 * Handle simultaneous ring (ring multiple devices)
 */
export async function simultaneousRing(userId: string, callControlId: string): Promise<void> {
  console.log('[ROUTER] Simultaneous ring for user:', userId);

  // Get all user's devices
  // const devices = await getUserDevices(userId);

  // Ring all devices
  // for (const device of devices) {
  //   await ringDevice(device.id, callControlId);
  // }
}

/**
 * Emergency call routing (911, 112, etc.)
 */
export async function routeEmergencyCall(context: CallContext): Promise<void> {
  console.log('[ROUTER] EMERGENCY CALL DETECTED');

  // Override all routing logic
  // Route directly to local emergency services via PSTN

  // Get user's registered E911 address
  // const e911Address = await getE911Address(context.userId);

  // Route to appropriate PSAP (Public Safety Answering Point)
  // await routeToEmergencyServices(context, e911Address);

  // Log emergency call for compliance
  // await logEmergencyCall(context);
}

export default {
  routeOutboundCall,
  routeInboundCall,
  forwardCall,
  simultaneousRing,
  routeEmergencyCall
};

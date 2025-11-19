/**
 * Modular Pay - Hybrid Billing Engine
 * 
 * Pay with MODX tokens OR credit card.
 * Subscription tiers: Free, Premium, Business, Enterprise
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      voiceMinutes: 100,
      smsMessages: 'unlimited',
      assignedNumbers: 1,
      voicemailTranscription: false,
      numberPorting: false,
      callRecording: false,
      spamFiltering: 'basic'
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceUsd: 9.99,
    priceModx: 199.8,  // At $0.05/MODX
    features: {
      voiceMinutes: 'unlimited',
      smsMessages: 'unlimited',
      assignedNumbers: 1,
      voicemailTranscription: true,
      numberPorting: true,
      callRecording: true,
      spamFiltering: 'advanced'
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    priceUsd: 19.99,
    priceModx: 399.8,
    features: {
      voiceMinutes: 'unlimited',
      assignedNumbers: 5,
      autoAttendant: true,
      callQueuing: true,
      analytics: 'advanced',
      apiAccess: true
    }
  }
};

export async function createSubscription(userId: string, tier: string, paymentMethod: 'card' | 'modx'): Promise<any> {
  if (paymentMethod === 'card') {
    return await createStripeSubscription(userId, tier);
  } else {
    return await createModxSubscription(userId, tier);
  }
}

async function createStripeSubscription(userId: string, tier: string): Promise<any> {
  console.log('[BILLING] Creating Stripe subscription:', tier);
  // Stripe integration here
  return { subscriptionId: `sub_${Date.now()}` };
}

async function createModxSubscription(userId: string, tier: string): Promise<any> {
  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  const modxRequired = tierConfig.priceModx || 0;
  
  // Deduct MODX from user wallet
  console.log('[BILLING] Charging', modxRequired, 'MODX for', tier);
  
  return { subscriptionId: `modx_sub_${Date.now()}` };
}

export async function getSubscriptionStatus(userId: string): Promise<any> {
  // SELECT * FROM subscriptions WHERE user_id = $1
  return { tier: 'free', status: 'active' };
}

export default { createSubscription, getSubscriptionStatus, SUBSCRIPTION_TIERS };

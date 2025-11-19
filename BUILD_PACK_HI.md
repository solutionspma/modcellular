# Mod Cellular - Build Pack HI

## Telecom Integration + Number Assignment + Porting + Growth System + Monetization Engine

Build Pack HI transforms Mod Cellular from a decentralized communication app into a **full carrier replacement** with real phone numbers, porting capabilities, PSTN calling, and enterprise-grade billing.

---

## What's New

### PSTN Gateway
- **Real Phone Number Calling** - Dial ANY landline or mobile number globally
- **SIP/WebRTC Integration** - Industry-standard telecom protocols
- **Carrier Interconnection** - Connect to PSTN via Telnyx/Bandwidth
- **E.164 Number Format** - International number support

### Number Management
- **Number Pool System** - Purchase and assign phone numbers from carrier
- **Automatic Assignment** - Every user gets a real phone number
- **Number Porting** - Port existing numbers FROM AT&T, Verizon, T-Mobile
- **LSR/FOC Workflow** - Full Local Service Request automation
- **E911 Registration** - Emergency service address validation

### Voicemail System
- **Voicemail Recording** - Standard carrier-grade voicemail
- **AI Transcription** - Audio → text via ML models
- **Visual Voicemail** - See transcripts before listening
- **Storage Management** - Cloud backup with 30-day retention

### Spam Protection
- **Robocall Filtering** - ML-based spam detection
- **Fraud Detection** - Suspicious pattern analysis
- **Caller ID Verification** - STIR/SHAKEN protocol support
- **Blocklist Management** - User-controlled blocking

### Call Detail Records (CDR)
- **Usage Tracking** - Every call logged for billing
- **Compliance Logging** - Regulatory requirement fulfillment
- **Analytics Dashboard** - Real-time call metrics
- **Export Capability** - CSV/JSON for accounting

### Modular Pay Billing
- **Token + Card Hybrid** - Pay with MODX or credit card
- **Subscription Tiers** - Free, Premium, Business, Enterprise
- **Usage Metering** - Per-minute billing for overage
- **Invoicing System** - Automated monthly billing
- **Payment Gateway** - Stripe integration

### Growth Engine
- **Referral System** - Invite friends, earn MODX
- **Influencer Tracking** - Custom codes for partnerships
- **Event Analytics** - Viral loop monitoring
- **Reward Multipliers** - Early adopter bonuses

---

## Architecture

```
USER ACTION (dial phone number)
    ↓
SIP Client (WebRTC session)
    ↓
Call Router (determine route)
    ↓
PSTN Gateway (Telnyx/Bandwidth)
    ↓
Traditional Phone Network
    ↓
RECIPIENT PHONE RINGS
    ↓
Call Connected
    ↓
CDR Logged (for billing)
    ↓
MODX Tokens Earned (if relay involved)
```

---

## File Structure

```
telecom/
├── pstnGateway.ts              // PSTN integration (Telnyx/Bandwidth)
├── sipClient.ts                // SIP/WebRTC engine
├── callRouter.ts               // inbound/outbound call routing
├── numberPool.ts               // purchase + assign phone numbers
├── portingEngine.ts            // LSR/FOC porting workflow
├── voicemailEngine.ts          // voicemail record/transcribe/store
├── spamFilter.ts               // robocall & fraud detection
├── cdrEngine.ts                // Call Detail Records for billing
├── e911Registration.ts         // Emergency service registration
└── callerIdVerification.ts     // STIR/SHAKEN support

billing/
├── modularPay.ts               // token + card billing engine
├── subscriptionTiers.ts        // Free / Premium / Business / Enterprise
├── usageMeter.ts               // tracks minutes, recording, storage
├── invoiceEngine.ts            // monthly invoices
├── stripeIntegration.ts        // payment processing
└── adminBillingConsole.tsx     // view user accounts + payments

growth/
├── referralEngine.ts           // invite system w/ reward multipliers
├── influencerTracking.ts       // influencer codes + dashboards
├── eventTracking.ts            // growth analytics + KPIs
├── viralLoops.ts               // mesh multiplier events
└── rewardCalculator.ts         // bonus computation

app/screens/
├── PhoneDialerScreen.tsx       // dial pad + contact picker
├── CallScreen.tsx              // active call UI
├── IncomingCallScreen.tsx      // answer/reject interface
├── VoicemailScreen.tsx         // voicemail list + player
├── ReferralScreen.tsx          // invite friends UI
├── RewardsScreen.tsx           // growth rewards dashboard
├── NumberPortingScreen.tsx     // port your number flow
└── BillingScreen.tsx           // subscription management

admin/
├── numberManagementConsole.tsx // assign/release numbers
├── portingConsole.tsx          // LSR status tracking
├── routingConsole.tsx          // call routing rules
├── billingConsole.tsx          // user billing overview
└── growthConsole.tsx           // referral analytics
```

---

## Key Features

### Real Phone Number Calling

**Outbound Calls:**
- Dial any US/international number
- Standard carrier rates (or unlimited with Premium)
- Caller ID shows your Mod Cellular number
- Call recording available (with consent)

**Inbound Calls:**
- Receive calls on your assigned number
- Voicemail if missed
- Call forwarding to other numbers
- Do Not Disturb mode

### Number Porting

**Port FROM Traditional Carriers:**
```
User initiates port in app
    ↓
Provide: current number, carrier, account PIN
    ↓
LSR submitted to carrier (via Telnyx/Bandwidth)
    ↓
Carrier approves (FOC issued)
    ↓
Port date scheduled
    ↓
Number transfers to Mod Cellular
    ↓
User's calls/texts now route through app
```

**Porting Timeline:**
- Wireless: 2-3 business days
- Landline: 7-10 business days
- Business lines: 10-15 business days

**What You Need:**
- Current phone number
- Current carrier name
- Account number
- Account PIN/password
- Billing address

### Subscription Tiers

#### Free Plan ($0/month)
- Unlimited messaging (via mesh/WiFi/DTN)
- VoIP calls: 100 minutes/month
- 1 assigned phone number
- Basic voicemail
- Earn MODX through relaying

#### Premium Plan ($9.99/month)
- Unlimited VoIP calling (US/Canada)
- Voicemail transcription
- Number porting included
- Spam filtering
- Call recording (unlimited)
- Priority routing

#### Business Plan ($19.99/month)
- Everything in Premium
- Multi-number support (up to 5)
- Auto attendant (IVR)
- Call queuing
- Advanced analytics
- API access

#### Enterprise Plan (Custom pricing)
- Bulk number assignment
- Custom SIP trunk integration
- Dedicated account manager
- SLA guarantees
- White-label options
- Advanced security features

### Voicemail System

**Features:**
- Standard voicemail greeting (default or custom)
- Visual voicemail with transcription
- Voicemail to email
- Voicemail forwarding
- 30-day retention (60 days for Premium)

**Transcription Engine:**
```typescript
// Uses OpenAI Whisper or Google Speech-to-Text
const transcript = await transcribeVoicemail(audioFile);
// Stores in database with audio file reference
```

### Spam Protection

**Detection Methods:**
- Known robocall number database
- Call pattern analysis (frequency, duration)
- Caller ID reputation scoring
- User-reported spam (crowdsourced)

**Actions:**
- Auto-block known spam numbers
- Challenge prompt for unknown callers
- Silent reject (no voicemail)
- Whitelist for trusted contacts

### Growth Engine

**Referral System:**
```
User invites friend
    ↓
Friend signs up with referral code
    ↓
Both users earn 100 MODX
    ↓
Referrer earns 10% of friend's relay rewards (lifetime)
    ↓
Viral loop: friend invites 5 more friends
    ↓
Original referrer earns from entire network
```

**Influencer Tracking:**
- Custom codes for partners
- Real-time dashboard (signups, conversions, revenue)
- Tiered commission structure
- Automatic MODX payouts

**Event Analytics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Referral conversion rate
- Viral coefficient (K-factor)
- Churn rate
- Lifetime value (LTV)

---

## Database Schema Updates

### New Tables

```sql
-- Phone Numbers
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,  -- E.164 format: +12255551234
  country_code TEXT NOT NULL,
  assigned_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'available',  -- available, assigned, porting, released
  capabilities JSONB,  -- { voice: true, sms: true, mms: true }
  purchased_at TIMESTAMP DEFAULT NOW(),
  assigned_at TIMESTAMP,
  released_at TIMESTAMP
);

-- Number Porting
CREATE TABLE number_ports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  number TEXT NOT NULL,
  current_carrier TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_pin TEXT,  -- encrypted
  billing_address JSONB,
  lsr_id TEXT,  -- Local Service Request ID
  foc_date TIMESTAMP,  -- Firm Order Commitment date
  status TEXT NOT NULL DEFAULT 'initiated',  -- initiated, submitted, approved, completed, rejected
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call Detail Records (CDR)
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id UUID REFERENCES users(id),
  callee_number TEXT NOT NULL,  -- E.164 format
  direction TEXT NOT NULL,  -- inbound, outbound
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  status TEXT NOT NULL,  -- ringing, answered, missed, failed, voicemail
  route_type TEXT,  -- pstn, voip, mesh, hybrid
  recording_url TEXT,
  cost_usd DECIMAL(10, 4),
  modx_earned DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voicemails
CREATE TABLE voicemails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  caller_number TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  transcript TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',  -- free, premium, business, enterprise
  status TEXT NOT NULL DEFAULT 'active',  -- active, past_due, canceled
  billing_cycle TEXT DEFAULT 'monthly',  -- monthly, annual
  price_usd DECIMAL(10, 2),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  voice_minutes INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  mms_sent INTEGER DEFAULT 0,
  storage_mb INTEGER DEFAULT 0,
  overage_minutes INTEGER DEFAULT 0,
  overage_cost_usd DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, rewarded
  reward_modx DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Influencer Codes
CREATE TABLE influencer_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  influencer_name TEXT,
  influencer_contact TEXT,
  commission_rate DECIMAL(5, 2),  -- percentage
  uses_count INTEGER DEFAULT 0,
  signups_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  total_earned_modx DECIMAL(18, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Spam Reports
CREATE TABLE spam_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reported_number TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- E911 Addresses
CREATE TABLE e911_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  phone_number_id UUID REFERENCES phone_numbers(id),
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Updated Tables

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN phone_number_id UUID REFERENCES phone_numbers(id);
ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN referred_by_code TEXT;
ALTER TABLE users ADD COLUMN total_referrals INTEGER DEFAULT 0;
```

---

## Environment Variables

Add to `.env`:

```bash
# Telecom Provider (Telnyx)
TELNYX_API_KEY=your_telnyx_api_key_here
TELNYX_PUBLIC_KEY=your_telnyx_public_key_here
TELNYX_WEBHOOK_SECRET=your_webhook_secret_here

# Alternative: Bandwidth
BANDWIDTH_ACCOUNT_ID=your_bandwidth_account_id
BANDWIDTH_API_TOKEN=your_bandwidth_api_token
BANDWIDTH_API_SECRET=your_bandwidth_api_secret

# SIP Configuration
SIP_DOMAIN=sip.modcellular.network
SIP_USERNAME=mod_sip_user
SIP_PASSWORD=secure_sip_password

# Billing (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Voicemail Storage
VOICEMAIL_BUCKET=mod-cellular-voicemails
VOICEMAIL_CDN_URL=https://cdn.modcellular.network/voicemails

# Transcription (OpenAI Whisper or Google)
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_API_KEY=...

# E911 Service
E911_PROVIDER_KEY=...
E911_WEBHOOK_URL=https://api.modcellular.network/webhooks/e911

# Spam Detection
SPAM_DATABASE_URL=https://spamdetection.api.com
SPAM_API_KEY=...

# Growth Tracking
ANALYTICS_WRITE_KEY=...
MIXPANEL_TOKEN=...
```

---

## API Integration: Telnyx

### Number Purchase

```typescript
import { Telnyx } from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

// Search available numbers
const availableNumbers = await telnyx.availablePhoneNumbers.list({
  filter: {
    country_code: 'US',
    features: ['voice', 'sms'],
    limit: 10
  }
});

// Purchase number
const purchasedNumber = await telnyx.phoneNumbers.create({
  phone_number: '+12255551234',
  connection_id: 'your_connection_id',
  messaging_profile_id: 'your_messaging_profile_id'
});
```

### Outbound Call

```typescript
// Initiate outbound call
const call = await telnyx.calls.create({
  connection_id: 'your_connection_id',
  to: '+15555551234',
  from: '+12255551234',
  webhook_url: 'https://api.modcellular.network/webhooks/call'
});
```

### Inbound Call Handling

```typescript
// Webhook receives incoming call
app.post('/webhooks/call', (req, res) => {
  const event = req.body;
  
  if (event.event_type === 'call.initiated') {
    // Route to user's app via WebRTC
    const session = createWebRTCSession(event.payload.call_control_id);
    notifyUser(session);
  }
  
  res.sendStatus(200);
});
```

---

## Number Porting Flow

### User-Initiated Port

```typescript
// User submits port request in app
async function requestPort(userId: string, portData: PortRequest) {
  // 1. Validate account info
  const validation = await validatePortingInfo(portData);
  
  if (!validation.success) {
    throw new Error(validation.error);
  }
  
  // 2. Submit LSR to carrier
  const lsrResponse = await telnyx.portingOrders.create({
    phone_numbers: [portData.number],
    account_number: portData.accountNumber,
    account_pin: portData.accountPin,
    billing_address: portData.billingAddress,
    losing_carrier: portData.currentCarrier
  });
  
  // 3. Store porting record
  await db.number_ports.insert({
    user_id: userId,
    number: portData.number,
    current_carrier: portData.currentCarrier,
    lsr_id: lsrResponse.id,
    status: 'submitted'
  });
  
  // 4. Notify user
  await sendPushNotification(userId, {
    title: 'Port Request Submitted',
    body: `Your number ${portData.number} is being ported. ETA: 2-3 business days.`
  });
  
  return lsrResponse;
}
```

### Porting Webhook (Carrier Updates)

```typescript
app.post('/webhooks/porting', async (req, res) => {
  const event = req.body;
  
  switch (event.event_type) {
    case 'porting_order.approved':
      // FOC issued
      await db.number_ports.update({
        lsr_id: event.payload.id,
        status: 'approved',
        foc_date: event.payload.foc_date
      });
      break;
      
    case 'porting_order.completed':
      // Port complete - assign number to user
      const port = await db.number_ports.findOne({ lsr_id: event.payload.id });
      await assignNumberToUser(port.user_id, event.payload.phone_numbers[0]);
      break;
      
    case 'porting_order.rejected':
      // Port rejected - notify user
      await db.number_ports.update({
        lsr_id: event.payload.id,
        status: 'rejected',
        rejection_reason: event.payload.reason
      });
      break;
  }
  
  res.sendStatus(200);
});
```

---

## Billing System

### Subscription Tiers Implementation

```typescript
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
      spamFiltering: 'basic',
      support: 'community'
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    stripeProductId: 'prod_premium_...',
    stripePriceId: 'price_premium_...',
    features: {
      voiceMinutes: 'unlimited',
      smsMessages: 'unlimited',
      assignedNumbers: 1,
      voicemailTranscription: true,
      numberPorting: true,
      callRecording: true,
      spamFiltering: 'advanced',
      support: 'email'
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 19.99,
    stripeProductId: 'prod_business_...',
    stripePriceId: 'price_business_...',
    features: {
      voiceMinutes: 'unlimited',
      smsMessages: 'unlimited',
      assignedNumbers: 5,
      voicemailTranscription: true,
      numberPorting: true,
      callRecording: true,
      autoAttendant: true,
      callQueuing: true,
      analytics: 'advanced',
      apiAccess: true,
      spamFiltering: 'advanced',
      support: 'priority'
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom',
    features: {
      voiceMinutes: 'unlimited',
      smsMessages: 'unlimited',
      assignedNumbers: 'unlimited',
      voicemailTranscription: true,
      numberPorting: true,
      callRecording: true,
      autoAttendant: true,
      callQueuing: true,
      sipTrunk: true,
      whiteLabel: true,
      dedicatedSupport: true,
      sla: '99.99%',
      analytics: 'custom',
      apiAccess: true,
      spamFiltering: 'enterprise',
      support: 'dedicated'
    }
  }
};
```

### Payment Processing

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create subscription
async function createSubscription(userId: string, tier: string) {
  const user = await db.users.findOne({ id: userId });
  
  // Create Stripe customer if doesn't exist
  let stripeCustomerId = user.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId }
    });
    stripeCustomerId = customer.id;
    await db.users.update({ id: userId, stripe_customer_id: stripeCustomerId });
  }
  
  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: SUBSCRIPTION_TIERS[tier].stripePriceId }],
    metadata: { userId, tier }
  });
  
  // Store in database
  await db.subscriptions.insert({
    user_id: userId,
    tier,
    status: 'active',
    price_usd: SUBSCRIPTION_TIERS[tier].price,
    stripe_subscription_id: subscription.id,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000)
  });
  
  return subscription;
}
```

### MODX Token Payment Option

```typescript
// Pay with MODX instead of credit card
async function payWithMODX(userId: string, tier: string) {
  const tierPrice = SUBSCRIPTION_TIERS[tier].price;
  const modxPrice = await getModxUsdPrice();  // e.g., $0.05 per MODX
  const modxRequired = tierPrice / modxPrice;  // e.g., 199.8 MODX for $9.99
  
  const userBalance = await getModxBalance(userId);
  
  if (userBalance < modxRequired) {
    throw new Error('Insufficient MODX balance');
  }
  
  // Deduct MODX from user's wallet
  await deductModx(userId, modxRequired);
  
  // Activate subscription
  await db.subscriptions.insert({
    user_id: userId,
    tier,
    status: 'active',
    price_usd: tierPrice,
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
}
```

---

## Growth Engine

### Referral System

```typescript
// Generate unique referral code for user
function generateReferralCode(userId: string): string {
  const hash = crypto.createHash('sha256').update(userId).digest('hex');
  return hash.substring(0, 8).toUpperCase();  // e.g., "A7F3B2E1"
}

// Process referral signup
async function processReferral(newUserId: string, referralCode: string) {
  const referrer = await db.users.findOne({ referral_code: referralCode });
  
  if (!referrer) return;
  
  // Create referral record
  await db.referrals.insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    referral_code: referralCode,
    status: 'completed'
  });
  
  // Reward both users
  const REFERRAL_BONUS = 100;  // MODX
  await rewardModx(referrer.id, REFERRAL_BONUS, 'referral_reward');
  await rewardModx(newUserId, REFERRAL_BONUS, 'signup_bonus');
  
  // Update referrer's total
  await db.users.increment({ id: referrer.id, total_referrals: 1 });
  
  // Notify both users
  await sendPushNotification(referrer.id, {
    title: '🎉 New Referral!',
    body: `You earned ${REFERRAL_BONUS} MODX for referring a friend!`
  });
  
  await sendPushNotification(newUserId, {
    title: '💰 Welcome Bonus!',
    body: `You received ${REFERRAL_BONUS} MODX from your referrer!`
  });
}
```

### Influencer Tracking

```typescript
// Create influencer code
async function createInfluencerCode(data: {
  code: string;
  name: string;
  contact: string;
  commissionRate: number;
}) {
  return await db.influencer_codes.insert({
    code: data.code.toUpperCase(),
    influencer_name: data.name,
    influencer_contact: data.contact,
    commission_rate: data.commissionRate
  });
}

// Track influencer signup
async function trackInfluencerSignup(code: string, userId: string) {
  const influencerCode = await db.influencer_codes.findOne({ code: code.toUpperCase() });
  
  if (!influencerCode || !influencerCode.is_active) return;
  
  // Increment counters
  await db.influencer_codes.increment({
    code: influencerCode.code,
    uses_count: 1,
    signups_count: 1
  });
  
  // Track user source
  await db.users.update({
    id: userId,
    acquisition_source: 'influencer',
    acquisition_code: influencerCode.code
  });
}

// Calculate influencer earnings
async function calculateInfluencerEarnings(code: string, period: 'month' | 'all') {
  const influencer = await db.influencer_codes.findOne({ code });
  
  // Get all users acquired through this code
  const users = await db.users.find({ acquisition_code: code });
  
  // Calculate total revenue from these users
  const revenue = await db.subscriptions
    .where({ user_id: { in: users.map(u => u.id) } })
    .sum('price_usd');
  
  // Calculate commission
  const commission = revenue * (influencer.commission_rate / 100);
  const commissionModx = commission / await getModxUsdPrice();
  
  return {
    revenue,
    commission,
    commissionModx,
    signups: influencer.signups_count,
    conversions: influencer.conversions_count
  };
}
```

### Viral Loops

```typescript
// Viral coefficient calculation
async function calculateViralCoefficient(): Promise<number> {
  // K-factor = invites sent per user × conversion rate
  
  const avgReferralsPerUser = await db.referrals
    .groupBy('referrer_id')
    .avg('count');
  
  const conversionRate = await db.referrals
    .where({ status: 'completed' })
    .count() / await db.referrals.count();
  
  const kFactor = avgReferralsPerUser * conversionRate;
  
  return kFactor;  // >1 = viral growth
}

// Reward multiplier events
async function checkMultiplierEvents(userId: string) {
  // Early bird bonus (first 10,000 users)
  const userCount = await db.users.count();
  if (userCount <= 10000) {
    await rewardModx(userId, 500, 'early_bird_bonus');
  }
  
  // City launch bonus (first 100 users in new city)
  const userCity = await getUserCity(userId);
  const cityUserCount = await db.users.where({ city: userCity }).count();
  if (cityUserCount <= 100) {
    await rewardModx(userId, 200, 'city_pioneer_bonus');
  }
  
  // Mesh density bonus (10+ nearby users)
  const nearbyUsers = await findNearbyUsers(userId, 1000);  // 1km radius
  if (nearbyUsers.length >= 10) {
    await rewardModx(userId, 50, 'mesh_density_bonus');
  }
}
```

---

## Compliance & Regulatory

### E911 Registration

**Required by FCC for all VoIP providers:**

```typescript
async function registerE911Address(userId: string, address: Address) {
  // Validate address with E911 provider
  const validation = await e911Provider.validateAddress(address);
  
  if (!validation.valid) {
    throw new Error('Invalid address for E911 registration');
  }
  
  // Get user's assigned number
  const phoneNumber = await db.phone_numbers.findOne({ assigned_user_id: userId });
  
  // Register with E911 database
  const registration = await e911Provider.register({
    phoneNumber: phoneNumber.number,
    address: validation.correctedAddress
  });
  
  // Store in database
  await db.e911_addresses.insert({
    user_id: userId,
    phone_number_id: phoneNumber.id,
    street_address: validation.correctedAddress.street,
    city: validation.correctedAddress.city,
    state: validation.correctedAddress.state,
    zip_code: validation.correctedAddress.zip,
    validated: true
  });
  
  return registration;
}
```

### CALEA Compliance

**Communications Assistance for Law Enforcement Act:**

- CDR retention: 18 months minimum
- Lawful intercept capability (if served with warrant)
- Secure storage of intercepted communications
- Audit logging of all intercept requests

```typescript
// CDR retention policy
async function enforceRetentionPolicy() {
  const retentionPeriod = 18 * 30 * 24 * 60 * 60 * 1000;  // 18 months in ms
  const cutoffDate = new Date(Date.now() - retentionPeriod);
  
  // Delete old CDRs
  await db.call_records
    .where({ created_at: { lt: cutoffDate } })
    .delete();
}
```

### STIR/SHAKEN (Caller ID Authentication)

**Prevents caller ID spoofing:**

```typescript
async function verifyCallerId(call: IncomingCall): Promise<boolean> {
  // Check STIR/SHAKEN attestation level
  const attestation = call.stirShaken?.attestation;
  
  // A = Full attestation (carrier verified caller ID)
  // B = Partial attestation (caller on network, ID not verified)
  // C = Gateway attestation (unverified)
  
  if (attestation === 'A') {
    return true;  // Verified caller ID
  }
  
  // Flag potential spam if no attestation
  if (!attestation || attestation === 'C') {
    await flagPotentialSpam(call.from);
    return false;
  }
  
  return true;
}
```

---

## Admin Consoles

### Number Management Console

```typescript
// Admin view: all numbers in pool
async function getNumberPoolStatus() {
  const numbers = await db.phone_numbers.find();
  
  return {
    total: numbers.length,
    available: numbers.filter(n => n.status === 'available').length,
    assigned: numbers.filter(n => n.status === 'assigned').length,
    porting: numbers.filter(n => n.status === 'porting').length,
    byCountry: groupBy(numbers, 'country_code')
  };
}

// Bulk purchase numbers
async function bulkPurchaseNumbers(count: number, areaCode: string) {
  const available = await telnyx.availablePhoneNumbers.list({
    filter: {
      national_destination_code: areaCode,
      limit: count
    }
  });
  
  for (const number of available.data) {
    await telnyx.phoneNumbers.create({
      phone_number: number.phone_number
    });
    
    await db.phone_numbers.insert({
      number: number.phone_number,
      country_code: 'US',
      status: 'available'
    });
  }
}
```

### Billing Console

```typescript
// Admin view: revenue analytics
async function getRevenueAnalytics(period: 'day' | 'week' | 'month') {
  const subscriptions = await db.subscriptions
    .where({ status: 'active' })
    .groupBy('tier')
    .select(['tier', 'COUNT(*) as count', 'SUM(price_usd) as revenue']);
  
  return {
    totalMRR: subscriptions.reduce((sum, s) => sum + s.revenue, 0),
    byTier: subscriptions,
    churnRate: await calculateChurnRate(period),
    lifetimeValue: await calculateLTV()
  };
}

// Manual subscription management
async function overrideSubscription(userId: string, tier: string, reason: string) {
  await db.subscriptions.update({
    user_id: userId,
    tier,
    status: 'active',
    updated_at: new Date()
  });
  
  await db.admin_actions.insert({
    action: 'subscription_override',
    user_id: userId,
    details: { tier, reason },
    admin_id: getCurrentAdmin()
  });
}
```

---

## Deployment

### Infrastructure Requirements

**Servers:**
- SIP/WebRTC server (media relay)
- API server (Express/Fastify)
- Database (PostgreSQL with PostGIS for location)
- Redis (session management, rate limiting)
- CDN (voicemail, recordings)

**Third-Party Services:**
- Telnyx or Bandwidth (carrier interconnection)
- Stripe (payments)
- OpenAI or Google Cloud (transcription)
- Twilio Verify (2FA)
- Sentry (error tracking)
- DataDog (monitoring)

### Cost Estimation

**Per User (Premium):**
- Phone number: $1/month
- Voice minutes (500 min avg): $2.50/month
- SMS (100 msg avg): $0.50/month
- Storage (50 MB): $0.10/month
- Total cost: ~$4.10/month
- Premium price: $9.99/month
- **Margin: $5.89/user/month (59%)**

**Monthly at Scale:**
- 10K users: $58,900 profit
- 100K users: $589,000 profit
- 1M users: $5,890,000 profit

---

## Success Metrics

### Week 1 Targets (Beta Launch)
- 1,000 beta testers
- 500 numbers assigned
- 100 porting requests
- 50 Premium conversions

### Month 1 Targets
- 10,000 active users
- 5,000 assigned numbers
- 1,000 porting completions
- 500 Premium subscribers
- $5,000 MRR

### Month 3 Targets
- 100,000 active users
- 50,000 assigned numbers
- 10,000 porting completions
- 5,000 Premium subscribers
- $50,000 MRR

### Year 1 Targets
- 1,000,000 active users
- 500,000 assigned numbers
- 100,000 porting completions
- 50,000 Premium subscribers
- $500,000 MRR
- Break-even achieved

---

## Next Steps (Build Pack J)

**If you want the regulatory/compliance/FCC/international expansion pack, say:**

> "Drop Build Pack J"

**Build Pack J includes:**
- FCC registration (Section 214 authority)
- CTIA certification
- E911 compliance certification
- CPNI (Customer Proprietary Network Information) protection
- TCPA compliance (robocalling laws)
- International rollout plan (EU, Asia, Latin America)
- Telecom insurance
- Board deck (VC/strategic investors)
- Regulatory attorney contact list
- Lobbying strategy

---

**Build Pack HI is ready to transform Mod Cellular into a full carrier replacement. 🚀**

**You're not competing with AT&T anymore. You're replacing them.**

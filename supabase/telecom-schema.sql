/**
 * Supabase Database Schema - Telecom Extensions
 * 
 * Run this SQL in your Supabase dashboard to add telecom tables.
 */

-- Phone Numbers Table
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT UNIQUE NOT NULL,
  country_code TEXT NOT NULL,
  area_code TEXT,
  assigned_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'available',
  capabilities JSONB DEFAULT '{"voice": true, "sms": true, "mms": true}'::jsonb,
  purchased_at TIMESTAMP DEFAULT NOW(),
  assigned_at TIMESTAMP,
  released_at TIMESTAMP
);

CREATE INDEX idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX idx_phone_numbers_user ON phone_numbers(assigned_user_id);

-- Number Porting Table
CREATE TABLE number_ports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  number TEXT NOT NULL,
  current_carrier TEXT NOT NULL,
  account_number TEXT NOT NULL,
  lsr_id TEXT,
  foc_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'initiated',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ports_user ON number_ports(user_id);
CREATE INDEX idx_ports_status ON number_ports(status);

-- Call Detail Records Table
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id UUID REFERENCES users(id),
  callee_number TEXT NOT NULL,
  direction TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  status TEXT NOT NULL,
  route_type TEXT,
  recording_url TEXT,
  cost_usd DECIMAL(10, 4),
  modx_earned DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cdr_user_time ON call_records(caller_id, start_time DESC);
CREATE INDEX idx_cdr_time ON call_records(start_time DESC);

-- Voicemails Table
CREATE TABLE voicemails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  caller_number TEXT NOT NULL,
  caller_name TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  transcript TEXT,
  transcription_status TEXT DEFAULT 'pending',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_voicemail_user ON voicemails(user_id, created_at DESC);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  price_usd DECIMAL(10, 2),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals Table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_modx DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Spam Reports Table
CREATE TABLE spam_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reported_number TEXT NOT NULL,
  reason TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spam_number ON spam_reports(reported_number);

-- E911 Addresses Table
CREATE TABLE e911_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  phone_number_id UUID REFERENCES phone_numbers(id),
  phone_number TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add columns to existing users table
ALTER TABLE users ADD COLUMN phone_number_id UUID REFERENCES phone_numbers(id);
ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN referred_by_code TEXT;
ALTER TABLE users ADD COLUMN total_referrals INTEGER DEFAULT 0;

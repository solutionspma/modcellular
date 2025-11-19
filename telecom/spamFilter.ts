/**
 * Spam Filter
 * 
 * AI-powered robocall detection and spam filtering.
 * Protects users from unwanted calls using ML + crowdsourced data.
 */

export interface SpamScore {
  number: string;
  score: number;            // 0-100 (0 = legitimate, 100 = spam)
  category: 'legitimate' | 'suspicious' | 'spam' | 'scam' | 'robocall';
  reasons: string[];
  reportCount: number;
  lastReported?: Date;
}

export interface CallAnalysis {
  isSpam: boolean;
  shouldBlock: boolean;
  shouldChallenge: boolean;
  confidence: number;
  score: SpamScore;
}

/**
 * Analyze incoming call for spam
 */
export async function analyzeIncomingCall(params: {
  fromNumber: string;
  toNumber: string;
  userId: string;
}): Promise<CallAnalysis> {
  try {
    console.log('[SPAM] Analyzing call from:', params.fromNumber);

    // Get spam score
    const score = await getSpamScore(params.fromNumber);

    // Check user's blocklist
    const isBlocked = await isNumberBlocked(params.userId, params.fromNumber);

    if (isBlocked) {
      return {
        isSpam: true,
        shouldBlock: true,
        shouldChallenge: false,
        confidence: 1.0,
        score
      };
    }

    // Check user's whitelist
    const isWhitelisted = await isNumberWhitelisted(params.userId, params.fromNumber);

    if (isWhitelisted) {
      return {
        isSpam: false,
        shouldBlock: false,
        shouldChallenge: false,
        confidence: 1.0,
        score
      };
    }

    // Determine action based on score
    const analysis: CallAnalysis = {
      isSpam: score.score >= 70,
      shouldBlock: score.score >= 90,        // Auto-block high confidence spam
      shouldChallenge: score.score >= 50 && score.score < 90,  // Challenge suspicious calls
      confidence: score.score / 100,
      score
    };

    console.log('[SPAM] Analysis:', analysis.category, '-', analysis.score.score);

    return analysis;
  } catch (error: any) {
    console.error('[SPAM] Analysis failed:', error);
    
    // Default to allow call if analysis fails
    return {
      isSpam: false,
      shouldBlock: false,
      shouldChallenge: false,
      confidence: 0,
      score: {
        number: params.fromNumber,
        score: 0,
        category: 'legitimate',
        reasons: [],
        reportCount: 0
      }
    };
  }
}

/**
 * Get spam score for phone number
 */
export async function getSpamScore(phoneNumber: string): Promise<SpamScore> {
  let score = 0;
  const reasons: string[] = [];

  // Check pattern-based indicators
  const patterns = analyzeNumberPattern(phoneNumber);
  score += patterns.score;
  reasons.push(...patterns.reasons);

  // Check crowdsourced reports
  const reports = await getCrowdsourcedReports(phoneNumber);
  score += reports.score;
  reasons.push(...reports.reasons);

  // Check external spam databases
  const external = await checkExternalDatabases(phoneNumber);
  score += external.score;
  reasons.push(...external.reasons);

  // Check call frequency (if number calls many users)
  const frequency = await analyzeCallFrequency(phoneNumber);
  score += frequency.score;
  reasons.push(...frequency.reasons);

  // Determine category
  let category: SpamScore['category'] = 'legitimate';
  if (score >= 90) category = 'robocall';
  else if (score >= 80) category = 'scam';
  else if (score >= 60) category = 'spam';
  else if (score >= 30) category = 'suspicious';

  return {
    number: phoneNumber,
    score: Math.min(score, 100),
    category,
    reasons,
    reportCount: reports.count
  };
}

/**
 * Analyze number pattern for spam indicators
 */
function analyzeNumberPattern(phoneNumber: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Sequential digits (e.g., +15551234567)
  if (/\d{5,}/.test(phoneNumber)) {
    const digits = phoneNumber.replace(/\D/g, '');
    let sequential = 0;
    for (let i = 0; i < digits.length - 1; i++) {
      if (parseInt(digits[i]) + 1 === parseInt(digits[i + 1])) {
        sequential++;
      }
    }
    if (sequential >= 5) {
      score += 20;
      reasons.push('Sequential digits pattern');
    }
  }

  // Repeating digits (e.g., +15555555555)
  const repeating = phoneNumber.match(/(\d)\1{4,}/);
  if (repeating) {
    score += 25;
    reasons.push('Repeating digits pattern');
  }

  // Known spam area codes
  const spamAreaCodes = ['800', '888', '877', '866', '855', '844', '833'];
  const areaCode = phoneNumber.replace(/\D/g, '').substring(1, 4);
  if (spamAreaCodes.includes(areaCode)) {
    score += 10;
    reasons.push(`Toll-free area code (${areaCode})`);
  }

  return { score, reasons };
}

/**
 * Check crowdsourced spam reports
 */
async function getCrowdsourcedReports(phoneNumber: string): Promise<{
  score: number;
  reasons: string[];
  count: number;
}> {
  // In production: query spam_reports table
  // SELECT COUNT(*) FROM spam_reports WHERE reported_number = $1
  
  const reportCount = 0;  // Placeholder
  let score = 0;
  const reasons: string[] = [];

  if (reportCount > 100) {
    score = 50;
    reasons.push(`${reportCount} spam reports from users`);
  } else if (reportCount > 50) {
    score = 30;
    reasons.push(`${reportCount} spam reports`);
  } else if (reportCount > 10) {
    score = 15;
    reasons.push(`${reportCount} spam reports`);
  }

  return { score, reasons, count: reportCount };
}

/**
 * Check external spam databases
 */
async function checkExternalDatabases(phoneNumber: string): Promise<{
  score: number;
  reasons: string[];
}> {
  // In production: check services like:
  // - Twilio Lookup API
  // - Nomorobo
  // - YouMail
  // - Federal Trade Commission (FTC) Do Not Call Registry

  const score = 0;
  const reasons: string[] = [];

  return { score, reasons };
}

/**
 * Analyze call frequency patterns
 */
async function analyzeCallFrequency(phoneNumber: string): Promise<{
  score: number;
  reasons: string[];
}> {
  // In production: analyze CDRs
  // SELECT COUNT(*) FROM call_records 
  // WHERE caller_id = $1 
  // AND start_time > NOW() - INTERVAL '1 hour'

  const callsPerHour = 0;  // Placeholder
  let score = 0;
  const reasons: string[] = [];

  if (callsPerHour > 100) {
    score = 40;
    reasons.push('High call volume (robocall pattern)');
  } else if (callsPerHour > 50) {
    score = 20;
    reasons.push('Elevated call volume');
  }

  return { score, reasons };
}

/**
 * Report number as spam
 */
export async function reportSpam(params: {
  userId: string;
  reportedNumber: string;
  reason?: string;
  category?: 'spam' | 'scam' | 'robocall';
}): Promise<void> {
  try {
    console.log('[SPAM] User reporting spam:', params.reportedNumber);

    await storeSpamReport({
      reporterId: params.userId,
      reportedNumber: params.reportedNumber,
      reason: params.reason,
      category: params.category || 'spam',
      createdAt: new Date()
    });

    // Automatically block number for this user
    await blockNumber(params.userId, params.reportedNumber);

    console.log('[SPAM] Spam reported and blocked');
  } catch (error: any) {
    console.error('[SPAM] Failed to report spam:', error);
  }
}

/**
 * Block number
 */
export async function blockNumber(userId: string, phoneNumber: string): Promise<void> {
  // In production: INSERT INTO blocked_numbers
  console.log('[SPAM] Blocking number:', phoneNumber, 'for user:', userId);
}

/**
 * Unblock number
 */
export async function unblockNumber(userId: string, phoneNumber: string): Promise<void> {
  // In production: DELETE FROM blocked_numbers
  console.log('[SPAM] Unblocking number:', phoneNumber, 'for user:', userId);
}

/**
 * Whitelist number (always allow)
 */
export async function whitelistNumber(userId: string, phoneNumber: string): Promise<void> {
  // In production: INSERT INTO whitelisted_numbers
  console.log('[SPAM] Whitelisting number:', phoneNumber, 'for user:', userId);
}

/**
 * Check if number is blocked
 */
async function isNumberBlocked(userId: string, phoneNumber: string): Promise<boolean> {
  // In production: SELECT EXISTS(SELECT 1 FROM blocked_numbers WHERE user_id = $1 AND number = $2)
  return false;
}

/**
 * Check if number is whitelisted
 */
async function isNumberWhitelisted(userId: string, phoneNumber: string): Promise<boolean> {
  // In production: SELECT EXISTS(SELECT 1 FROM whitelisted_numbers WHERE user_id = $1 AND number = $2)
  return false;
}

/**
 * Get user's blocked numbers
 */
export async function getBlockedNumbers(userId: string): Promise<string[]> {
  // In production: SELECT number FROM blocked_numbers WHERE user_id = $1
  return [];
}

/**
 * Challenge caller (CAPTCHA-like verification)
 */
export async function challengeCaller(callControlId: string): Promise<boolean> {
  try {
    console.log('[SPAM] Challenging caller:', callControlId);

    // Speak challenge
    const digit1 = Math.floor(Math.random() * 10);
    const digit2 = Math.floor(Math.random() * 10);
    const expectedAnswer = digit1 + digit2;

    await speakText(
      callControlId,
      `This call has been flagged as suspicious. To verify you are human, please enter ${digit1} plus ${digit2} using your keypad.`
    );

    // Listen for DTMF response
    const response = await waitForDTMF(callControlId, 10000);  // 10 second timeout

    if (response === expectedAnswer.toString()) {
      console.log('[SPAM] Challenge passed');
      await speakText(callControlId, 'Thank you. Connecting your call.');
      return true;
    } else {
      console.log('[SPAM] Challenge failed');
      await speakText(callControlId, 'Verification failed. Goodbye.');
      return false;
    }
  } catch (error: any) {
    console.error('[SPAM] Challenge failed:', error);
    return false;
  }
}

/**
 * Get spam statistics (admin)
 */
export async function getSpamStatistics(): Promise<{
  totalReports: number;
  blockedCalls: number;
  challengedCalls: number;
  topSpamNumbers: Array<{ number: string; reports: number }>;
}> {
  // In production: database aggregation
  return {
    totalReports: 0,
    blockedCalls: 0,
    challengedCalls: 0,
    topSpamNumbers: []
  };
}

/**
 * Database operations (placeholders)
 */
async function storeSpamReport(report: any): Promise<void> {
  // INSERT INTO spam_reports ...
  console.log('[DB] Storing spam report');
}

// Placeholder functions
async function speakText(callControlId: string, text: string): Promise<void> {
  console.log('[SPAM] Speaking:', text);
}

async function waitForDTMF(callControlId: string, timeout: number): Promise<string> {
  // Wait for DTMF input
  return '';
}

export default {
  analyzeIncomingCall,
  getSpamScore,
  reportSpam,
  blockNumber,
  unblockNumber,
  whitelistNumber,
  getBlockedNumbers,
  challengeCaller,
  getSpamStatistics
};

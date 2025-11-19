/**
 * Number Pool Management
 * 
 * Purchase, assign, and release phone numbers from carrier.
 * Manages inventory of available numbers for user assignment.
 */

import { Telnyx } from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY || '');

export interface PhoneNumber {
  id: string;
  number: string;              // E.164 format: +12255551234
  countryCode: string;
  areaCode: string;
  assignedUserId?: string;
  status: 'available' | 'assigned' | 'porting' | 'released';
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  purchasedAt: Date;
  assignedAt?: Date;
  releasedAt?: Date;
}

export interface NumberSearchParams {
  countryCode?: string;
  areaCode?: string;
  contains?: string;
  limit?: number;
  features?: string[];
}

/**
 * Search available numbers for purchase
 */
export async function searchAvailableNumbers(params: NumberSearchParams): Promise<any[]> {
  try {
    console.log('[NUMBER_POOL] Searching numbers:', params);

    const searchParams: any = {
      filter: {
        country_code: params.countryCode || 'US',
        features: params.features || ['voice', 'sms'],
        limit: params.limit || 50
      }
    };

    if (params.areaCode) {
      searchParams.filter.national_destination_code = params.areaCode;
    }

    if (params.contains) {
      searchParams.filter.contains = params.contains;
    }

    const response = await telnyx.availablePhoneNumbers.list(searchParams);

    console.log('[NUMBER_POOL] Found', response.data.length, 'numbers');

    return response.data.map((num: any) => ({
      number: num.phone_number,
      costUsd: num.cost_information?.monthly_cost || 1.00,
      features: num.features
    }));
  } catch (error: any) {
    console.error('[NUMBER_POOL] Search failed:', error);
    throw new Error(`Failed to search numbers: ${error.message}`);
  }
}

/**
 * Purchase phone number from carrier
 */
export async function purchaseNumber(phoneNumber: string): Promise<PhoneNumber> {
  try {
    console.log('[NUMBER_POOL] Purchasing number:', phoneNumber);

    const purchased = await telnyx.phoneNumbers.create({
      phone_number: phoneNumber,
      connection_id: process.env.TELNYX_CONNECTION_ID,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID
    });

    const number: PhoneNumber = {
      id: purchased.id,
      number: purchased.phone_number,
      countryCode: phoneNumber.substring(0, phoneNumber.length - 10),
      areaCode: phoneNumber.substring(phoneNumber.length - 10, phoneNumber.length - 7),
      status: 'available',
      capabilities: {
        voice: purchased.features?.includes('voice') || false,
        sms: purchased.features?.includes('sms') || false,
        mms: purchased.features?.includes('mms') || false
      },
      purchasedAt: new Date()
    };

    // Store in database
    await storeNumberInDatabase(number);

    console.log('[NUMBER_POOL] Number purchased successfully');

    return number;
  } catch (error: any) {
    console.error('[NUMBER_POOL] Purchase failed:', error);
    throw new Error(`Failed to purchase number: ${error.message}`);
  }
}

/**
 * Bulk purchase numbers (for inventory)
 */
export async function bulkPurchaseNumbers(count: number, areaCode?: string): Promise<PhoneNumber[]> {
  try {
    console.log(`[NUMBER_POOL] Bulk purchasing ${count} numbers in area code:`, areaCode);

    const available = await searchAvailableNumbers({
      areaCode,
      limit: count
    });

    const purchased: PhoneNumber[] = [];

    for (const num of available.slice(0, count)) {
      try {
        const number = await purchaseNumber(num.number);
        purchased.push(number);
      } catch (error) {
        console.error('[NUMBER_POOL] Failed to purchase:', num.number);
      }
    }

    console.log(`[NUMBER_POOL] Bulk purchased ${purchased.length} of ${count} numbers`);

    return purchased;
  } catch (error: any) {
    console.error('[NUMBER_POOL] Bulk purchase failed:', error);
    throw new Error(`Bulk purchase failed: ${error.message}`);
  }
}

/**
 * Assign number to user
 */
export async function assignNumberToUser(userId: string, preferences?: {
  areaCode?: string;
  contains?: string;
}): Promise<PhoneNumber> {
  try {
    console.log('[NUMBER_POOL] Assigning number to user:', userId);

    // Check if user already has a number
    const existingNumber = await getUserNumber(userId);
    if (existingNumber) {
      console.log('[NUMBER_POOL] User already has number:', existingNumber.number);
      return existingNumber;
    }

    // Find available number matching preferences
    let availableNumber = await findAvailableNumber(preferences);

    // If no available number in pool, purchase one
    if (!availableNumber) {
      console.log('[NUMBER_POOL] No numbers in pool, purchasing new number');
      const searchResults = await searchAvailableNumbers({
        areaCode: preferences?.areaCode,
        contains: preferences?.contains,
        limit: 1
      });

      if (searchResults.length === 0) {
        throw new Error('No numbers available for purchase');
      }

      availableNumber = await purchaseNumber(searchResults[0].number);
    }

    // Assign to user
    availableNumber.assignedUserId = userId;
    availableNumber.status = 'assigned';
    availableNumber.assignedAt = new Date();

    await updateNumberInDatabase(availableNumber);

    console.log('[NUMBER_POOL] Number assigned:', availableNumber.number);

    return availableNumber;
  } catch (error: any) {
    console.error('[NUMBER_POOL] Assignment failed:', error);
    throw new Error(`Failed to assign number: ${error.message}`);
  }
}

/**
 * Release number from user (make available for reassignment)
 */
export async function releaseNumber(userId: string, deleteNumber: boolean = false): Promise<void> {
  try {
    console.log('[NUMBER_POOL] Releasing number for user:', userId);

    const number = await getUserNumber(userId);

    if (!number) {
      console.log('[NUMBER_POOL] User has no assigned number');
      return;
    }

    if (deleteNumber) {
      // Delete from carrier
      await telnyx.phoneNumbers.del(number.id);
      
      // Delete from database
      await deleteNumberFromDatabase(number.id);

      console.log('[NUMBER_POOL] Number deleted:', number.number);
    } else {
      // Return to available pool
      number.assignedUserId = undefined;
      number.status = 'available';
      number.releasedAt = new Date();

      await updateNumberInDatabase(number);

      console.log('[NUMBER_POOL] Number released to pool:', number.number);
    }
  } catch (error: any) {
    console.error('[NUMBER_POOL] Release failed:', error);
    throw new Error(`Failed to release number: ${error.message}`);
  }
}

/**
 * Get user's assigned number
 */
export async function getUserNumber(userId: string): Promise<PhoneNumber | null> {
  // In production: database query
  // SELECT * FROM phone_numbers WHERE assigned_user_id = $1
  return null;
}

/**
 * Find available number in pool
 */
async function findAvailableNumber(preferences?: {
  areaCode?: string;
  contains?: string;
}): Promise<PhoneNumber | null> {
  // In production: database query
  // SELECT * FROM phone_numbers 
  // WHERE status = 'available'
  // AND area_code = $1 (if specified)
  // LIMIT 1
  return null;
}

/**
 * Get pool statistics
 */
export async function getPoolStatistics(): Promise<{
  total: number;
  available: number;
  assigned: number;
  porting: number;
  byAreaCode: Record<string, number>;
}> {
  // In production: database aggregation
  return {
    total: 0,
    available: 0,
    assigned: 0,
    porting: 0,
    byAreaCode: {}
  };
}

/**
 * Ensure minimum pool size (auto-purchase if low)
 */
export async function maintainPoolSize(minSize: number = 100, areaCode?: string): Promise<void> {
  const stats = await getPoolStatistics();

  if (stats.available < minSize) {
    const needed = minSize - stats.available;
    console.log(`[NUMBER_POOL] Pool below minimum (${stats.available}/${minSize}), purchasing ${needed} numbers`);
    
    await bulkPurchaseNumbers(needed, areaCode);
  } else {
    console.log(`[NUMBER_POOL] Pool size OK (${stats.available}/${minSize})`);
  }
}

/**
 * Reserve number for porting (during port-in process)
 */
export async function reserveNumberForPorting(phoneNumber: string, userId: string): Promise<PhoneNumber> {
  // Create placeholder record during porting
  const number: PhoneNumber = {
    id: `porting-${Date.now()}`,
    number: phoneNumber,
    countryCode: phoneNumber.substring(0, phoneNumber.length - 10),
    areaCode: phoneNumber.substring(phoneNumber.length - 10, phoneNumber.length - 7),
    assignedUserId: userId,
    status: 'porting',
    capabilities: {
      voice: true,
      sms: true,
      mms: true
    },
    purchasedAt: new Date()
  };

  await storeNumberInDatabase(number);

  console.log('[NUMBER_POOL] Number reserved for porting:', phoneNumber);

  return number;
}

/**
 * Activate ported number (after port completion)
 */
export async function activatePortedNumber(phoneNumber: string, telnyxNumberId: string): Promise<void> {
  // Update database record with actual Telnyx ID
  // UPDATE phone_numbers 
  // SET id = $1, status = 'assigned' 
  // WHERE number = $2

  console.log('[NUMBER_POOL] Ported number activated:', phoneNumber);
}

/**
 * Database operations (placeholders for Supabase integration)
 */
async function storeNumberInDatabase(number: PhoneNumber): Promise<void> {
  // In production: INSERT INTO phone_numbers ...
  console.log('[DB] Storing number:', number.number);
}

async function updateNumberInDatabase(number: PhoneNumber): Promise<void> {
  // In production: UPDATE phone_numbers SET ... WHERE id = $1
  console.log('[DB] Updating number:', number.number);
}

async function deleteNumberFromDatabase(numberId: string): Promise<void> {
  // In production: DELETE FROM phone_numbers WHERE id = $1
  console.log('[DB] Deleting number:', numberId);
}

export default {
  searchAvailableNumbers,
  purchaseNumber,
  bulkPurchaseNumbers,
  assignNumberToUser,
  releaseNumber,
  getUserNumber,
  getPoolStatistics,
  maintainPoolSize,
  reserveNumberForPorting,
  activatePortedNumber
};

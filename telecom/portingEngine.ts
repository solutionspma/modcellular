/**
 * Number Porting Engine
 * 
 * Handles porting phone numbers FROM traditional carriers TO Mod Cellular.
 * Implements LSR (Local Service Request) workflow with FOC (Firm Order Commitment).
 */

import { Telnyx } from 'telnyx';
import { reserveNumberForPorting, activatePortedNumber } from './numberPool';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY || '');

export interface PortRequest {
  userId: string;
  phoneNumber: string;
  currentCarrier: string;
  accountNumber: string;
  accountPin?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  authorizedName: string;
}

export interface PortStatus {
  id: string;
  lsrId: string;
  status: 'initiated' | 'submitted' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'canceled';
  phoneNumber: string;
  currentCarrier: string;
  focDate?: Date;            // Firm Order Commitment date
  completionDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initiate port-in request
 */
export async function initiatePortIn(request: PortRequest): Promise<PortStatus> {
  try {
    console.log('[PORTING] Initiating port for:', request.phoneNumber);

    // Validate request
    await validatePortRequest(request);

    // Reserve number in database
    await reserveNumberForPorting(request.phoneNumber, request.userId);

    // Submit LSR to carrier via Telnyx
    const portingOrder = await telnyx.portingOrders.create({
      phone_numbers: [request.phoneNumber],
      account_number: request.accountNumber,
      account_pin: request.accountPin,
      billing_address: {
        street_address: request.billingAddress.street,
        locality: request.billingAddress.city,
        administrative_area: request.billingAddress.state,
        postal_code: request.billingAddress.zipCode
      },
      losing_carrier: request.currentCarrier,
      authorized_person_name: request.authorizedName,
      webhook_url: `${process.env.API_URL}/webhooks/telnyx/porting`
    });

    const portStatus: PortStatus = {
      id: portingOrder.id,
      lsrId: portingOrder.lsr_id || portingOrder.id,
      status: 'submitted',
      phoneNumber: request.phoneNumber,
      currentCarrier: request.currentCarrier,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in database
    await storePortStatusInDatabase(request.userId, portStatus);

    console.log('[PORTING] Port request submitted, LSR ID:', portStatus.lsrId);

    return portStatus;
  } catch (error: any) {
    console.error('[PORTING] Port initiation failed:', error);
    throw new Error(`Failed to initiate port: ${error.message}`);
  }
}

/**
 * Validate port request before submission
 */
async function validatePortRequest(request: PortRequest): Promise<void> {
  // Check if number is valid E.164
  if (!request.phoneNumber.match(/^\+1\d{10}$/)) {
    throw new Error('Invalid phone number format (must be US/Canada E.164)');
  }

  // Check if user already has this number porting
  const existingPort = await getActivePortForNumber(request.phoneNumber);
  if (existingPort) {
    throw new Error('Port already in progress for this number');
  }

  // Check if account number is provided
  if (!request.accountNumber || request.accountNumber.length < 5) {
    throw new Error('Valid account number required');
  }

  // Check if billing address is complete
  if (!request.billingAddress.street || !request.billingAddress.city || 
      !request.billingAddress.state || !request.billingAddress.zipCode) {
    throw new Error('Complete billing address required');
  }

  console.log('[PORTING] Validation passed');
}

/**
 * Check port status from carrier
 */
export async function checkPortStatus(lsrId: string): Promise<PortStatus | null> {
  try {
    const portingOrder = await telnyx.portingOrders.retrieve(lsrId);

    const status: PortStatus = {
      id: portingOrder.id,
      lsrId: portingOrder.lsr_id || portingOrder.id,
      status: mapTelnyxStatus(portingOrder.status),
      phoneNumber: portingOrder.phone_numbers[0],
      currentCarrier: portingOrder.losing_carrier,
      focDate: portingOrder.foc_date ? new Date(portingOrder.foc_date) : undefined,
      completionDate: portingOrder.completed_at ? new Date(portingOrder.completed_at) : undefined,
      rejectionReason: portingOrder.rejection_reason,
      createdAt: new Date(portingOrder.created_at),
      updatedAt: new Date(portingOrder.updated_at)
    };

    return status;
  } catch (error: any) {
    console.error('[PORTING] Failed to check status:', error);
    return null;
  }
}

/**
 * Map Telnyx status to our status
 */
function mapTelnyxStatus(telnyxStatus: string): PortStatus['status'] {
  const statusMap: Record<string, PortStatus['status']> = {
    'draft': 'initiated',
    'pending': 'submitted',
    'approved': 'approved',
    'porting': 'in_progress',
    'completed': 'completed',
    'rejected': 'rejected',
    'canceled': 'canceled'
  };

  return statusMap[telnyxStatus] || 'initiated';
}

/**
 * Handle port approval (FOC issued)
 */
export async function handlePortApproval(lsrId: string, focDate: Date): Promise<void> {
  try {
    console.log('[PORTING] Port approved, FOC date:', focDate);

    // Update database
    await updatePortStatus(lsrId, {
      status: 'approved',
      focDate
    });

    // Notify user
    const port = await getPortByLsrId(lsrId);
    if (port) {
      await notifyUser(port.userId, {
        title: 'Number Port Approved! 🎉',
        body: `Your number will be ported on ${focDate.toLocaleDateString()}`
      });
    }
  } catch (error: any) {
    console.error('[PORTING] Failed to handle approval:', error);
  }
}

/**
 * Handle port completion
 */
export async function handlePortCompletion(lsrId: string, telnyxNumberId: string): Promise<void> {
  try {
    console.log('[PORTING] Port completed, LSR ID:', lsrId);

    const port = await getPortByLsrId(lsrId);
    
    if (!port) {
      console.error('[PORTING] Port record not found');
      return;
    }

    // Activate ported number
    await activatePortedNumber(port.phoneNumber, telnyxNumberId);

    // Update port status
    await updatePortStatus(lsrId, {
      status: 'completed',
      completionDate: new Date()
    });

    // Notify user
    await notifyUser(port.userId, {
      title: 'Number Port Complete! ✅',
      body: `${port.phoneNumber} is now active on Mod Cellular`
    });

    console.log('[PORTING] Port completed successfully');
  } catch (error: any) {
    console.error('[PORTING] Failed to handle completion:', error);
  }
}

/**
 * Handle port rejection
 */
export async function handlePortRejection(lsrId: string, reason: string): Promise<void> {
  try {
    console.log('[PORTING] Port rejected:', reason);

    // Update database
    await updatePortStatus(lsrId, {
      status: 'rejected',
      rejectionReason: reason
    });

    // Notify user
    const port = await getPortByLsrId(lsrId);
    if (port) {
      await notifyUser(port.userId, {
        title: 'Number Port Rejected',
        body: `Reason: ${reason}. Please check your account info and try again.`
      });
    }
  } catch (error: any) {
    console.error('[PORTING] Failed to handle rejection:', error);
  }
}

/**
 * Cancel port request
 */
export async function cancelPort(lsrId: string, userId: string): Promise<void> {
  try {
    console.log('[PORTING] Canceling port:', lsrId);

    // Cancel with carrier
    await telnyx.portingOrders.cancel(lsrId);

    // Update database
    await updatePortStatus(lsrId, {
      status: 'canceled'
    });

    console.log('[PORTING] Port canceled');
  } catch (error: any) {
    console.error('[PORTING] Failed to cancel port:', error);
    throw new Error(`Failed to cancel port: ${error.message}`);
  }
}

/**
 * Get user's active ports
 */
export async function getUserActivePorts(userId: string): Promise<PortStatus[]> {
  // In production: database query
  // SELECT * FROM number_ports 
  // WHERE user_id = $1 
  // AND status IN ('initiated', 'submitted', 'approved', 'in_progress')
  return [];
}

/**
 * Get all ports (admin)
 */
export async function getAllPorts(filters?: {
  status?: PortStatus['status'];
  startDate?: Date;
  endDate?: Date;
}): Promise<PortStatus[]> {
  // In production: database query with filters
  return [];
}

/**
 * Get port statistics (admin)
 */
export async function getPortStatistics(): Promise<{
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  avgCompletionDays: number;
}> {
  // In production: database aggregation
  return {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    avgCompletionDays: 0
  };
}

/**
 * Estimate port completion time
 */
export function estimatePortTime(carrier: string, numberType: 'mobile' | 'landline'): {
  minDays: number;
  maxDays: number;
  typical: string;
} {
  if (numberType === 'mobile') {
    return {
      minDays: 2,
      maxDays: 5,
      typical: '2-3 business days'
    };
  } else {
    return {
      minDays: 7,
      maxDays: 15,
      typical: '7-10 business days'
    };
  }
}

/**
 * Validate carrier account info before porting
 */
export async function validateAccountInfo(request: PortRequest): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Check account number format (carrier-specific)
  if (request.currentCarrier.toLowerCase().includes('verizon')) {
    if (request.accountNumber.length < 9) {
      errors.push('Verizon account numbers are typically 9-10 digits');
    }
  }

  if (request.currentCarrier.toLowerCase().includes('at&t')) {
    if (request.accountNumber.length < 11) {
      errors.push('AT&T account numbers are typically 11-13 digits');
    }
  }

  // Check PIN format
  if (request.accountPin && request.accountPin.length < 4) {
    errors.push('Account PIN must be at least 4 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Database operations (placeholders)
 */
async function storePortStatusInDatabase(userId: string, status: PortStatus): Promise<void> {
  // INSERT INTO number_ports ...
  console.log('[DB] Storing port status:', status.lsrId);
}

async function updatePortStatus(lsrId: string, updates: Partial<PortStatus>): Promise<void> {
  // UPDATE number_ports SET ... WHERE lsr_id = $1
  console.log('[DB] Updating port status:', lsrId);
}

async function getPortByLsrId(lsrId: string): Promise<any> {
  // SELECT * FROM number_ports WHERE lsr_id = $1
  return null;
}

async function getActivePortForNumber(phoneNumber: string): Promise<PortStatus | null> {
  // SELECT * FROM number_ports WHERE phone_number = $1 AND status NOT IN ('completed', 'rejected', 'canceled')
  return null;
}

async function notifyUser(userId: string, notification: { title: string; body: string }): Promise<void> {
  // Send push notification
  console.log('[NOTIFY] Sending to user:', userId, notification);
}

export default {
  initiatePortIn,
  checkPortStatus,
  handlePortApproval,
  handlePortCompletion,
  handlePortRejection,
  cancelPort,
  getUserActivePorts,
  getAllPorts,
  getPortStatistics,
  estimatePortTime,
  validateAccountInfo
};

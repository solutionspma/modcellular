import * as FileSystem from 'expo-file-system';

export interface QueuedTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  type: 'transfer' | 'relay-reward' | 'reputation-update';
  timestamp: number;
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  retries: number;
  metadata?: any;
}

const TX_QUEUE_PATH = FileSystem.documentDirectory + 'txQueue.json';

export async function queueTransaction(tx: Omit<QueuedTransaction, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<string> {
  try {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: QueuedTransaction = {
      ...tx,
      id,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    let queue: QueuedTransaction[] = [];
    
    const fileInfo = await FileSystem.getInfoAsync(TX_QUEUE_PATH);
    if (fileInfo.exists) {
      const data = await FileSystem.readAsStringAsync(TX_QUEUE_PATH);
      queue = JSON.parse(data);
    }

    queue.push(transaction);
    await FileSystem.writeAsStringAsync(TX_QUEUE_PATH, JSON.stringify(queue));

    console.log(`Transaction queued: ${id}`);
    return id;
  } catch (error) {
    console.error('Failed to queue transaction:', error);
    throw error;
  }
}

export async function getTransactionQueue(): Promise<QueuedTransaction[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(TX_QUEUE_PATH);
    if (!fileInfo.exists) {
      return [];
    }

    const data = await FileSystem.readAsStringAsync(TX_QUEUE_PATH);
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read transaction queue:', error);
    return [];
  }
}

export async function updateTransactionStatus(
  id: string,
  status: QueuedTransaction['status']
): Promise<void> {
  try {
    const queue = await getTransactionQueue();
    const index = queue.findIndex(tx => tx.id === id);

    if (index !== -1) {
      queue[index].status = status;
      await FileSystem.writeAsStringAsync(TX_QUEUE_PATH, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Failed to update transaction status:', error);
  }
}

export async function processPendingTransactions(): Promise<number> {
  try {
    const queue = await getTransactionQueue();
    const pending = queue.filter(tx => tx.status === 'pending');

    let processed = 0;

    for (const tx of pending) {
      // Placeholder: Submit to blockchain
      console.log(`Processing transaction: ${tx.id}`);
      
      // In production, submit to blockchain here
      // For now, mark as submitted
      await updateTransactionStatus(tx.id, 'submitted');
      processed++;
    }

    return processed;
  } catch (error) {
    console.error('Failed to process transactions:', error);
    return 0;
  }
}

export async function clearCompletedTransactions(): Promise<void> {
  try {
    const queue = await getTransactionQueue();
    const active = queue.filter(tx => 
      tx.status === 'pending' || tx.status === 'submitted'
    );

    await FileSystem.writeAsStringAsync(TX_QUEUE_PATH, JSON.stringify(active));
  } catch (error) {
    console.error('Failed to clear transactions:', error);
  }
}

export async function getTransactionById(id: string): Promise<QueuedTransaction | null> {
  const queue = await getTransactionQueue();
  return queue.find(tx => tx.id === id) || null;
}

export async function getPendingCount(): Promise<number> {
  const queue = await getTransactionQueue();
  return queue.filter(tx => tx.status === 'pending').length;
}

export async function getTransactionHistory(limit: number = 50): Promise<QueuedTransaction[]> {
  const queue = await getTransactionQueue();
  return queue
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

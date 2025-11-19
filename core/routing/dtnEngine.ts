import * as FileSystem from 'expo-file-system';

interface DTNMessage {
  id: string;
  text: string;
  receiver: string;
  timestamp: number;
  retries: number;
  priority: number;
}

const DTN_PATH = FileSystem.documentDirectory + 'dtnStore.json';

export async function storeForLater(
  text: string,
  receiver: string,
  priority: number = 5
): Promise<void> {
  try {
    let messages: DTNMessage[] = [];
    
    const fileInfo = await FileSystem.getInfoAsync(DTN_PATH);
    if (fileInfo.exists) {
      const data = await FileSystem.readAsStringAsync(DTN_PATH);
      messages = JSON.parse(data);
    }

    messages.push({
      id: `dtn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      receiver,
      timestamp: Date.now(),
      retries: 0,
      priority
    });

    await FileSystem.writeAsStringAsync(DTN_PATH, JSON.stringify(messages));
    console.log('Message stored in DTN queue');
  } catch (error) {
    console.error('Failed to store DTN message:', error);
  }
}

export async function flushDTN(
  sendFunc: (msg: DTNMessage) => Promise<boolean>
): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(DTN_PATH);
    if (!fileInfo.exists) return 0;

    const data = await FileSystem.readAsStringAsync(DTN_PATH);
    const messages: DTNMessage[] = JSON.parse(data);

    let sent = 0;
    const failed: DTNMessage[] = [];

    for (const msg of messages) {
      try {
        const success = await sendFunc(msg);
        if (success) {
          sent++;
        } else {
          msg.retries++;
          if (msg.retries < 10) {
            failed.push(msg);
          }
        }
      } catch (error) {
        msg.retries++;
        if (msg.retries < 10) {
          failed.push(msg);
        }
      }
    }

    // Save failed messages back
    if (failed.length > 0) {
      await FileSystem.writeAsStringAsync(DTN_PATH, JSON.stringify(failed));
    } else {
      await FileSystem.deleteAsync(DTN_PATH);
    }

    console.log(`DTN flush: ${sent} sent, ${failed.length} remaining`);
    return sent;
  } catch (error) {
    console.error('Failed to flush DTN queue:', error);
    return 0;
  }
}

export async function getDTNQueueSize(): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(DTN_PATH);
    if (!fileInfo.exists) return 0;

    const data = await FileSystem.readAsStringAsync(DTN_PATH);
    const messages: DTNMessage[] = JSON.parse(data);
    return messages.length;
  } catch (error) {
    return 0;
  }
}

export async function clearDTNQueue(): Promise<void> {
  try {
    await FileSystem.deleteAsync(DTN_PATH);
  } catch (error) {
    console.error('Failed to clear DTN queue:', error);
  }
}

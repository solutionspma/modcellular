import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  privateKey: string;
  balance: string;
}

let walletInstance: ethers.Wallet | null = null;

export async function initWallet(): Promise<ethers.Wallet> {
  if (walletInstance) {
    return walletInstance;
  }

  try {
    let privateKey = await SecureStore.getItemAsync('mod_pk');

    if (!privateKey) {
      // Create new wallet
      const wallet = ethers.Wallet.createRandom();
      await SecureStore.setItemAsync('mod_pk', wallet.privateKey);
      
      console.log('New wallet created:', wallet.address);
      walletInstance = wallet;
      
      // Store globally for easy access
      if (typeof global !== 'undefined') {
        (global as any).wallet = wallet;
      }
    } else {
      // Restore existing wallet
      walletInstance = new ethers.Wallet(privateKey);
      
      if (typeof global !== 'undefined') {
        (global as any).wallet = walletInstance;
      }
      
      console.log('Wallet restored:', walletInstance.address);
    }

    return walletInstance;
  } catch (error) {
    console.error('Wallet initialization error:', error);
    throw error;
  }
}

export async function getWalletAddress(): Promise<string> {
  const wallet = await initWallet();
  return wallet.address;
}

export async function getWalletInfo(): Promise<WalletInfo> {
  const wallet = await initWallet();
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance: '0' // Will be fetched from blockchain
  };
}

export async function exportPrivateKey(): Promise<string> {
  const privateKey = await SecureStore.getItemAsync('mod_pk');
  if (!privateKey) {
    throw new Error('No wallet found');
  }
  return privateKey;
}

export async function importPrivateKey(privateKey: string): Promise<ethers.Wallet> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    await SecureStore.setItemAsync('mod_pk', privateKey);
    
    walletInstance = wallet;
    
    if (typeof global !== 'undefined') {
      (global as any).wallet = wallet;
    }
    
    console.log('Wallet imported:', wallet.address);
    return wallet;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Invalid private key');
  }
}

export async function signMessage(message: string): Promise<string> {
  const wallet = await initWallet();
  return wallet.signMessage(message);
}

export function getWalletInstance(): ethers.Wallet | null {
  return walletInstance;
}

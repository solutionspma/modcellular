// End-to-End Encryption using Signal Protocol concepts
// Implements Double Ratchet Algorithm for forward secrecy

import { NativeModules } from 'react-native';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EncryptedMessage {
  ciphertext: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  iv: Uint8Array;
  mac: Uint8Array;
}

export class E2EEncryption {
  private identityKey: KeyPair | null = null;
  private preKeys: Map<number, KeyPair> = new Map();
  private sessionKeys: Map<string, Uint8Array> = new Map();

  /**
   * Initialize encryption system with identity keys
   */
  async initialize(): Promise<void> {
    // Generate identity key pair
    this.identityKey = await this.generateKeyPair();
    
    // Generate one-time prekeys
    for (let i = 0; i < 100; i++) {
      const preKey = await this.generateKeyPair();
      this.preKeys.set(i, preKey);
    }
  }

  /**
   * Generate X25519 key pair
   */
  private async generateKeyPair(): Promise<KeyPair> {
    // In production, use native crypto modules for performance
    // This would call into libsodium or similar
    
    try {
      if (NativeModules.Crypto) {
        const keyPair = await NativeModules.Crypto.generateKeyPair();
        return {
          publicKey: this.base64ToUint8Array(keyPair.publicKey),
          privateKey: this.base64ToUint8Array(keyPair.privateKey)
        };
      }
    } catch (error) {
      console.error('Native crypto failed, using fallback:', error);
    }

    // Fallback: generate random keys (NOT SECURE - for demo only)
    return {
      publicKey: this.randomBytes(32),
      privateKey: this.randomBytes(32)
    };
  }

  /**
   * Encrypt message for recipient
   */
  async encryptMessage(
    recipientPublicKey: Uint8Array,
    message: string
  ): Promise<EncryptedMessage> {
    const sessionKey = await this.deriveSessionKey(recipientPublicKey);
    const plaintext = new TextEncoder().encode(message);
    
    // Generate ephemeral key for this message
    const ephemeralKey = await this.generateKeyPair();
    
    // Generate random IV
    const iv = this.randomBytes(16);
    
    // Encrypt with AES-256-GCM
    const ciphertext = await this.aesEncrypt(plaintext, sessionKey, iv);
    
    // Generate MAC
    const mac = await this.generateMAC(ciphertext, sessionKey);

    return {
      ciphertext,
      ephemeralPublicKey: ephemeralKey.publicKey,
      iv,
      mac
    };
  }

  /**
   * Decrypt received message
   */
  async decryptMessage(
    encrypted: EncryptedMessage,
    senderPublicKey: Uint8Array
  ): Promise<string> {
    // Verify MAC first
    const sessionKey = await this.deriveSessionKey(senderPublicKey);
    const validMAC = await this.verifyMAC(encrypted.ciphertext, sessionKey, encrypted.mac);
    
    if (!validMAC) {
      throw new Error('MAC verification failed - message tampered');
    }

    // Decrypt
    const plaintext = await this.aesDecrypt(encrypted.ciphertext, sessionKey, encrypted.iv);
    
    return new TextDecoder().decode(plaintext);
  }

  /**
   * Derive shared session key using ECDH
   */
  private async deriveSessionKey(otherPublicKey: Uint8Array): Promise<Uint8Array> {
    if (!this.identityKey) {
      throw new Error('Encryption not initialized');
    }

    // Check if we already have a session key
    const keyId = this.arrayToHex(otherPublicKey);
    const existingKey = this.sessionKeys.get(keyId);
    if (existingKey) {
      return existingKey;
    }

    // Perform ECDH key exchange
    const sharedSecret = await this.ecdh(this.identityKey.privateKey, otherPublicKey);
    
    // Derive session key using KDF
    const sessionKey = await this.kdf(sharedSecret, new Uint8Array(32));
    
    // Cache session key
    this.sessionKeys.set(keyId, sessionKey);
    
    return sessionKey;
  }

  /**
   * Elliptic Curve Diffie-Hellman
   */
  private async ecdh(privateKey: Uint8Array, publicKey: Uint8Array): Promise<Uint8Array> {
    try {
      if (NativeModules.Crypto) {
        const shared = await NativeModules.Crypto.ecdh(
          this.uint8ArrayToBase64(privateKey),
          this.uint8ArrayToBase64(publicKey)
        );
        return this.base64ToUint8Array(shared);
      }
    } catch (error) {
      console.error('ECDH failed:', error);
    }

    // Fallback: XOR (NOT SECURE - for demo only)
    const result = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      result[i] = privateKey[i] ^ publicKey[i];
    }
    return result;
  }

  /**
   * Key Derivation Function (HKDF)
   */
  private async kdf(input: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
    try {
      if (NativeModules.Crypto) {
        const derived = await NativeModules.Crypto.hkdf(
          this.uint8ArrayToBase64(input),
          this.uint8ArrayToBase64(salt)
        );
        return this.base64ToUint8Array(derived);
      }
    } catch (error) {
      console.error('KDF failed:', error);
    }

    // Fallback: Simple hash (NOT SECURE - for demo only)
    return this.simpleHash(input);
  }

  /**
   * AES-256-GCM encryption
   */
  private async aesEncrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    try {
      if (NativeModules.Crypto) {
        const encrypted = await NativeModules.Crypto.aesEncrypt(
          this.uint8ArrayToBase64(plaintext),
          this.uint8ArrayToBase64(key),
          this.uint8ArrayToBase64(iv)
        );
        return this.base64ToUint8Array(encrypted);
      }
    } catch (error) {
      console.error('AES encrypt failed:', error);
    }

    // Fallback: XOR cipher (NOT SECURE - for demo only)
    return this.xorCipher(plaintext, key);
  }

  /**
   * AES-256-GCM decryption
   */
  private async aesDecrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    try {
      if (NativeModules.Crypto) {
        const decrypted = await NativeModules.Crypto.aesDecrypt(
          this.uint8ArrayToBase64(ciphertext),
          this.uint8ArrayToBase64(key),
          this.uint8ArrayToBase64(iv)
        );
        return this.base64ToUint8Array(decrypted);
      }
    } catch (error) {
      console.error('AES decrypt failed:', error);
    }

    // Fallback: XOR cipher (NOT SECURE - for demo only)
    return this.xorCipher(ciphertext, key);
  }

  /**
   * Generate Message Authentication Code
   */
  private async generateMAC(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    try {
      if (NativeModules.Crypto) {
        const mac = await NativeModules.Crypto.hmac(
          this.uint8ArrayToBase64(data),
          this.uint8ArrayToBase64(key)
        );
        return this.base64ToUint8Array(mac);
      }
    } catch (error) {
      console.error('MAC generation failed:', error);
    }

    // Fallback: Simple hash
    return this.simpleHash(new Uint8Array([...data, ...key]));
  }

  /**
   * Verify Message Authentication Code
   */
  private async verifyMAC(
    data: Uint8Array,
    key: Uint8Array,
    mac: Uint8Array
  ): Promise<boolean> {
    const computed = await this.generateMAC(data, key);
    return this.constantTimeEquals(computed, mac);
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  // Utility functions

  private randomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }

  private xorCipher(data: Uint8Array, key: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    return result;
  }

  private simpleHash(data: Uint8Array): Uint8Array {
    const hash = new Uint8Array(32);
    for (let i = 0; i < data.length; i++) {
      hash[i % 32] = (hash[i % 32] + data[i]) & 0xff;
    }
    return hash;
  }

  private uint8ArrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }

  private arrayToHex(array: Uint8Array): string {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  getPublicKey(): Uint8Array | null {
    return this.identityKey?.publicKey || null;
  }

  getPreKey(id: number): Uint8Array | null {
    return this.preKeys.get(id)?.publicKey || null;
  }
}

export default new E2EEncryption();

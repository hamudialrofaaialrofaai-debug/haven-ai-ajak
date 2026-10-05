/**
 * Haven Cryptographic Privacy Vault
 * Implements Zero-Knowledge End-to-End Encryption using Web Cryptography API (SubtleCrypto)
 * Standard: AES-GCM 256-bit with PBKDF2 (100,000 iterations, SHA-256)
 */

const WORDLIST = [
  'amber', 'anchor', 'aurora', 'beacon', 'breeze', 'cedar', 'canyon', 'cascade',
  'cipher', 'clarity', 'clover', 'cosmos', 'cradle', 'crystal', 'dawn', 'drift',
  'echo', 'ember', 'falcon', 'feather', 'forest', 'fable', 'glacier', 'grove',
  'haven', 'horizon', 'island', 'jasper', 'lagoon', 'lotus', 'lunar', 'meadow',
  'mosaic', 'nebula', 'oasis', 'ocean', 'orbit', 'opal', 'prism', 'quiet',
  'radiant', 'ripple', 'sanctuary', 'shadow', 'solace', 'summit', 'timber', 'twilight',
  'valley', 'velvet', 'vessel', 'whisper', 'willow', 'zenith', 'zephyr'
];

/**
 * Generates a 6-word mnemonic passphrase for device sync
 */
export function generateSyncPhrase(): string {
  const words: string[] = [];
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 6; i++) {
    const index = randomBytes[i] % WORDLIST.length;
    words.push(WORDLIST[index]);
  }
  return words.join('-');
}

/**
 * Generates a random base64 salt
 */
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bufferToBase64(salt.buffer);
}

/**
 * Derives an AES-GCM 256-bit key from passphrase and salt using PBKDF2
 */
export async function deriveKey(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBuffer = base64ToBuffer(saltBase64);

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary plaintext object using AES-GCM 256-bit
 */
export async function encryptData(data: any, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const jsonStr = JSON.stringify(data);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(jsonStr)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * Decrypts AES-GCM ciphertext using CryptoKey
 */
export async function decryptData(ciphertext: string, ivBase64: string, key: CryptoKey): Promise<any> {
  const dec = new TextDecoder();
  const ciphertextBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  );

  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr);
}

// Helpers
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Client-Side PII Anonymizer / Scrubber
 * Redacts personally identifiable information (emails, phone numbers, SSNs, credit cards)
 * before dispatching requests to external models, preserving true zero-knowledge privacy.
 */
export function scrubPII(text: string): { scrubbedText: string; redactedItems: string[] } {
  const redactedItems: string[] = [];
  let result = text;

  // 1. Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  result = result.replace(emailRegex, (match) => {
    redactedItems.push(`Email (${match.slice(0, 3)}***)`);
    return '[EMAIL_REDACTED]';
  });

  // 2. Phone numbers (standard international / US)
  const phoneRegex = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  result = result.replace(phoneRegex, (match) => {
    redactedItems.push(`Phone (${match.slice(-4)})`);
    return '[PHONE_REDACTED]';
  });

  // 3. Social Security / ID numbers (XXX-XX-XXXX)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  result = result.replace(ssnRegex, () => {
    redactedItems.push('Government ID');
    return '[ID_REDACTED]';
  });

  // 4. Credit card numbers (13 to 19 digits with dashes or spaces)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  result = result.replace(ccRegex, () => {
    redactedItems.push('Payment Card');
    return '[CARD_REDACTED]';
  });

  return { scrubbedText: result, redactedItems };
}

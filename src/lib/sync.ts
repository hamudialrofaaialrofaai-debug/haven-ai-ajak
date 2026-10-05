import { deriveKey, encryptData, decryptData } from './crypto';
import { VaultMetadata, FullEncryptedPayload } from '../types';

export interface SyncPushResult {
  success: boolean;
  updatedAt: number;
  devices: string[];
  error?: string;
}

export interface SyncPullResult {
  success: boolean;
  payload?: FullEncryptedPayload;
  devices?: string[];
  updatedAt?: number;
  error?: string;
}

/**
 * Pushes client-encrypted ciphertext to the Zero-Knowledge Sync Relay
 */
export async function pushSyncToRelay(
  meta: VaultMetadata,
  payload: FullEncryptedPayload
): Promise<SyncPushResult> {
  try {
    const key = await deriveKey(meta.syncSecretPhrase, meta.keySalt);
    const { ciphertext, iv } = await encryptData(payload, key);
    const currentDevice = meta.devices.find((d) => d.isCurrent)?.name || 'Active Web Client';

    const res = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncId: meta.syncId,
        ciphertext,
        iv,
        salt: meta.keySalt,
        deviceName: currentDevice,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Server sync push failed');
    }

    const data = await res.json();
    return {
      success: true,
      updatedAt: data.updatedAt,
      devices: data.devices || [],
    };
  } catch (error: any) {
    console.error('pushSyncToRelay error:', error);
    return {
      success: false,
      updatedAt: Date.now(),
      devices: [],
      error: error?.message || 'Sync failed',
    };
  }
}

/**
 * Pulls client-encrypted ciphertext from the Zero-Knowledge Sync Relay and decrypts locally
 */
export async function pullSyncFromRelay(
  syncId: string,
  secretPhrase: string
): Promise<SyncPullResult> {
  try {
    const res = await fetch(`/api/sync/pull/${encodeURIComponent(syncId)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Sync room not found or expired. Verify the Sync ID.');
      }
      throw new Error('Failed to pull from sync relay.');
    }

    const data = await res.json();
    const { ciphertext, iv, salt, updatedAt, devices } = data;

    if (!ciphertext || !iv || !salt) {
      throw new Error('Corrupted sync payload received.');
    }

    // Derive the key with the provided secret phrase and remote salt
    const key = await deriveKey(secretPhrase, salt);
    const payload = await decryptData(ciphertext, iv, key);

    return {
      success: true,
      payload,
      devices,
      updatedAt,
    };
  } catch (error: any) {
    console.error('pullSyncFromRelay error:', error);
    return {
      success: false,
      error: error?.message || 'Decryption failed. Please check your 6-word phrase.',
    };
  }
}

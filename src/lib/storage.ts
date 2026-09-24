import { encryptData, decryptData } from '../utils/crypto';

export interface PatientRecord {
  id: string;
  name: string;
  ageValue: number;
  ageUnit: 'months' | 'years';
  sex: 'M' | 'F';
  weight?: number;
  height?: number;
  muac?: number;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const KEY = 'epiaid_patients';

/**
 * Reads the raw (possibly encrypted) list from localStorage.
 * When a cryptoKey is provided, each record is expected to be an encrypted
 * blob under `_enc` and is decrypted; otherwise the plain array is returned
 * as-is (supports pre-encryption data and the "encryption disabled" case).
 */
export async function getPatients(cryptoKey: CryptoKey | null): Promise<PatientRecord[]> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Array<PatientRecord | { _enc: string }>;

    if (!cryptoKey) {
      // Encryption disabled: assume plain records. If an encrypted blob is
      // encountered here (locked-out edge case), skip it rather than throw.
      return list.filter((r): r is PatientRecord => !('_enc' in r));
    }

    const decrypted: PatientRecord[] = [];
    for (const r of list) {
      if ('_enc' in r) {
        try {
          const json = await decryptData(r._enc, cryptoKey);
          decrypted.push(JSON.parse(json) as PatientRecord);
        } catch {
          // Wrong key or corrupted entry — skip rather than crash the list.
        }
      } else {
        decrypted.push(r); // legacy plaintext record, pre-encryption
      }
    }
    return decrypted;
  } catch {
    return [];
  }
}

export async function savePatient(patient: PatientRecord, cryptoKey: CryptoKey | null): Promise<void> {
  const raw = localStorage.getItem(KEY);
  const rawList = raw ? (JSON.parse(raw) as Array<PatientRecord | { _enc: string }>) : [];
  const updated: PatientRecord = { ...patient, updatedAt: new Date().toISOString() };

  const entry: PatientRecord | { _enc: string } = cryptoKey
    ? { _enc: await encryptData(JSON.stringify(updated), cryptoKey) }
    : updated;

  // Find existing entry by id — must decrypt each to compare id when encrypted.
  let idx = -1;
  for (let i = 0; i < rawList.length; i++) {
    const r = rawList[i];
    if ('_enc' in r) {
      if (!cryptoKey) continue;
      try {
        const json = await decryptData(r._enc, cryptoKey);
        if ((JSON.parse(json) as PatientRecord).id === patient.id) { idx = i; break; }
      } catch { /* skip */ }
    } else if (r.id === patient.id) {
      idx = i;
      break;
    }
  }

  if (idx >= 0) {
    rawList[idx] = entry;
  } else {
    rawList.unshift(entry);
  }
  localStorage.setItem(KEY, JSON.stringify(rawList));
}

export async function deletePatient(id: string, cryptoKey: CryptoKey | null): Promise<void> {
  const raw = localStorage.getItem(KEY);
  const rawList = raw ? (JSON.parse(raw) as Array<PatientRecord | { _enc: string }>) : [];
  const kept: Array<PatientRecord | { _enc: string }> = [];

  for (const r of rawList) {
    if ('_enc' in r) {
      if (!cryptoKey) { kept.push(r); continue; } // can't check id without key — keep it
      try {
        const json = await decryptData(r._enc, cryptoKey);
        if ((JSON.parse(json) as PatientRecord).id !== id) kept.push(r);
      } catch {
        kept.push(r); // undecryptable — keep rather than silently lose data
      }
    } else if (r.id !== id) {
      kept.push(r);
    }
  }
  localStorage.setItem(KEY, JSON.stringify(kept));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
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

export async function getPatients(cryptoKey: CryptoKey | null): Promise<PatientRecord[]> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Array<PatientRecord | { _enc: string }>;

    if (!cryptoKey) {
      return list.filter((r): r is PatientRecord => !('_enc' in r));
    }

    const decrypted: PatientRecord[] = [];
    for (const r of list) {
      if ('_enc' in r) {
        try {
          const json = await decryptData(r._enc, cryptoKey);
          decrypted.push(JSON.parse(json) as PatientRecord);
        } catch {
          // wrong key or corrupted entry — skip rather than crash the list
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
      if (!cryptoKey) { kept.push(r); continue; }
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

/**
 * Re-encrypts (or decrypts, or both) every stored record when the crypto
 * key changes — called when encryption is enabled, disabled, or the
 * password changes, so existing records are never silently orphaned.
 * oldKey: the key to decrypt with (null = records are currently plaintext).
 * newKey: the key to re-encrypt with (null = leave as plaintext).
 */
export async function reencryptAll(
  oldKey: CryptoKey | null,
  newKey: CryptoKey | null,
): Promise<void> {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  const rawList = JSON.parse(raw) as Array<PatientRecord | { _enc: string }>;
  const rewritten: Array<PatientRecord | { _enc: string }> = [];

  for (const r of rawList) {
    let record: PatientRecord;
    if ('_enc' in r) {
      if (!oldKey) { rewritten.push(r); continue; }
      try {
        record = JSON.parse(await decryptData(r._enc, oldKey)) as PatientRecord;
      } catch {
        rewritten.push(r); // can't decrypt — leave untouched rather than lose it
        continue;
      }
    } else {
      record = r;
    }
    rewritten.push(newKey ? { _enc: await encryptData(JSON.stringify(record), newKey) } : record);
  }
  localStorage.setItem(KEY, JSON.stringify(rewritten));
}
import { useState, useCallback, useEffect } from 'react';
import { getPatients, savePatient, deletePatient, generateId, type PatientRecord } from '../lib/storage';
import { useCrypto } from '../context/CryptoContext';

export function usePatients() {
  const { cryptoKey, isEncryptionEnabled, isUnlocked } = useCrypto();
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  // Only load once unlocked (or immediately if encryption isn't enabled)
  const canAccess = !isEncryptionEnabled || isUnlocked;

  const refresh = useCallback(async () => {
    if (!canAccess) { setPatients([]); return; }
    setPatients(await getPatients(cryptoKey));
  }, [canAccess, cryptoKey]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const record: PatientRecord = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    await savePatient(record, cryptoKey);
    await refresh();
    return record;
  }, [cryptoKey, refresh]);

  const update = useCallback(async (patient: PatientRecord) => {
    await savePatient(patient, cryptoKey);
    await refresh();
  }, [cryptoKey, refresh]);

  const remove = useCallback(async (id: string) => {
    await deletePatient(id, cryptoKey);
    await refresh();
  }, [cryptoKey, refresh]);

  return { patients, add, update, remove, refresh };
}
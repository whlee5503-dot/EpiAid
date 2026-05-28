import { useState, useCallback } from 'react';
import { getPatients, savePatient, deletePatient, generateId, type PatientRecord } from '../lib/storage';

export function usePatients() {
  const [patients, setPatients] = useState<PatientRecord[]>(() => getPatients());

  const refresh = useCallback(() => setPatients(getPatients()), []);

  const add = useCallback((data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const record: PatientRecord = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    savePatient(record);
    refresh();
    return record;
  }, [refresh]);

  const update = useCallback((patient: PatientRecord) => {
    savePatient(patient);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    deletePatient(id);
    refresh();
  }, [refresh]);

  return { patients, add, update, remove, refresh };
}

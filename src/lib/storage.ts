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

export function getPatients(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PatientRecord[]) : [];
  } catch {
    return [];
  }
}

export function savePatient(patient: PatientRecord): void {
  const list = getPatients();
  const idx = list.findIndex((p) => p.id === patient.id);
  const updated = { ...patient, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deletePatient(id: string): void {
  const list = getPatients().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

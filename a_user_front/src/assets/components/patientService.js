import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiService';

export function getAllPatients() {
  return apiGet('/patients');
}

export function createPatient(patient) {
  return apiPost('/patients', patient);
}

export function updatePatient(id, patient) {
  return apiPut(`/patients/${id}`, patient);
}

export function deletePatient(id) {
  return apiDelete(`/patients/${id}`);
}

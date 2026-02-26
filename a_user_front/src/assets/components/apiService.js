const BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080';

export async function apiGet(path) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error(`Erreur GET ${path} : ${response.status}`);
  return await response.json();
}

export async function apiPost(path, body) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Erreur POST ${path} : ${response.status}`);
  return await response.json();
}

export async function apiPut(path, body) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Erreur PUT ${path} : ${response.status}`);
  return await response.json();
}

export async function apiDelete(path) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error(`Erreur DELETE ${path} : ${response.status}`);
}

// Ajoute ces fonctions spécifiques ici
export async function getAllPatients() {
  return apiGet('/api/integration/patients');
}

export async function getAllDoctors() {
  return apiGet('/integration/doctors');
}

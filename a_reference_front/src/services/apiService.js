const BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  console.log("Auth token used:", token);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}


export async function apiGet(path) {
  const headers = {
    ...getAuthHeaders(),
  };
  console.log('Request headers for', path, headers); // debug
  const response = await fetch(`${BASE_URL}${path}`, { headers });
  if (!response.ok) throw new Error(`Erreur GET ${path} : ${response.status}`);
  return await response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Erreur POST ${path} : ${response.status}`);
  return await response.json();
}

export async function apiPut(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Erreur PUT ${path} : ${response.status}`);
  return await response.json();
}

export async function apiDelete(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) throw new Error(`Erreur DELETE ${path} : ${response.status}`);
}

export async function getAllDoctors() {
  return apiGet('/integration/doctors');
}

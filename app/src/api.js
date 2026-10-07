import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api'
);

async function request(path, { method = 'GET', token, body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`No se pudo conectar con la API (${API_BASE_URL}). Revisa EXPO_PUBLIC_API_URL y que el backend esté activo.`);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `La API respondió con estado ${response.status}`);
  }
  return result;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getProfile: (token) => request('/users/me', { token }),
  updateProfile: (token, body) => request('/users/me', { method: 'PATCH', token, body }),
  getExercises: () => request('/exercises'),
  createSession: (token, body) => request('/workout-sessions', { method: 'POST', token, body }),
  getSessions: (token) => request('/workout-sessions', { token }),
  getSession: (token, id) => request(`/workout-sessions/${id}`, { token }),
  addSet: (token, id, body) => request(`/workout-sessions/${id}/sets`, { method: 'POST', token, body }),
  updateSet: (token, sessionId, setId, body) => request(`/workout-sessions/${sessionId}/sets/${setId}`, { method: 'PATCH', token, body }),
  deleteSet: (token, sessionId, setId) => request(`/workout-sessions/${sessionId}/sets/${setId}`, { method: 'DELETE', token }),
  getLastSets: (token) => request('/users/me/last-sets', { token }),
  getRestPreferences: (token) => request('/users/me/rest-preferences', { token }),
  updateRestPreferences: (token, body) => request('/users/me/rest-preferences', { method: 'PATCH', token, body }),
  getPlateConfig: (token) => request('/users/me/plate-config', { token }),
  savePlateConfig: (token, body) => request('/users/me/plate-config', { method: 'PUT', token, body }),
  suggestPlates: (token, body) => request('/users/me/plate-config/suggest', { method: 'POST', token, body }),
  getRanks: (token) => request('/users/me/ranks', { token }),
  getRecords: (token) => request('/users/me/records', { token }),
  getLeagues: (token) => request('/leagues', { token }),
  createLeague: (token, body) => request('/leagues', { method: 'POST', token, body }),
  joinLeague: (token, id) => request(`/leagues/${id}/join`, { method: 'POST', token }),
  getLeagueMembers: (token, id) => request(`/leagues/${id}/members`, { token }),
  getRoutines: (token) => request('/routines', { token }),
  createRoutine: (token, body) => request('/routines', { method: 'POST', token, body }),
  getRoutine: (token, id) => request(`/routines/${id}`, { token }),
  applyRoutine: (token, id, body) => request(`/routines/${id}/apply`, { method: 'POST', token, body }),
};
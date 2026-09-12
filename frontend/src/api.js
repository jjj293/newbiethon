const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

async function putJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || '요청에 실패했습니다.')
  }
  return response.json()
}

export function registerUser(username, password) {
  return postJson('/auth/register', { username, password })
}

export function loginUser(username, password) {
  return postJson('/auth/login', { username, password })
}

export async function getUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || '사용자 정보를 불러오지 못했습니다.')
  }
  return response.json()
}

export function updateUserProfile(userId, payload) {
  return putJson(`/users/${userId}`, payload)
}

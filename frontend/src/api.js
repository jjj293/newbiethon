const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

export function registerUser(username, password) {
  return postJson('/auth/register', { username, password })
}

export function loginUser(username, password) {
  return postJson('/auth/login', { username, password })
}

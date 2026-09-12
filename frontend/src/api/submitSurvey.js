const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function submitSurvey(payload) {
  const response = await fetch(`${API_BASE_URL}/api/lifestyle-preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('설문 제출에 실패했습니다.')
  }

  return response.json()
}

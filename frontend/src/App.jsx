import { useState } from 'react'
import './App.css'
import { loginUser, registerUser } from './api'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const showResult = (data, successPrefix) => {
    if (data.success) {
      setMessageType('success')
      setMessage(`${successPrefix} (user_id: ${data.user_id})`)
    } else {
      setMessageType('error')
      setMessage(data.message || '요청에 실패했습니다.')
    }
  }

  const handleLogin = async () => {
    try {
      const data = await loginUser(username, password)
      showResult(data, '로그인 성공')
    } catch {
      setMessageType('error')
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  const handleRegister = async () => {
    try {
      const data = await registerUser(username, password)
      showResult(data, '계정이 생성되었습니다')
    } catch {
      setMessageType('error')
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="status-screen">
      <h1>로그인</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="PW"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-actions">
          <button type="button" onClick={handleLogin}>
            로그인
          </button>
          <button type="button" onClick={handleRegister}>
            사용자 생성
          </button>
        </div>
        {message && (
          <p className={`message ${messageType}`}>{message}</p>
        )}
      </div>
    </div>
  )
}

export default App;
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id'))

  if (!userId) {
    return <LoginPage onLoginSuccess={setUserId} />
  }

  return <ProfilePage userId={userId} />
}

export default App

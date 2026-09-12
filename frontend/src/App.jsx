import { useState } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id'))
  const [showHome, setShowHome] = useState(true)

  if (!userId && showHome) {
    return <HomePage onStart={() => setShowHome(false)} />
  }

  if (!userId) {
    return <LoginPage onLoginSuccess={setUserId} />
  }

  return <ProfilePage userId={userId} />
}

export default App

import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import LifestylePreferencesPage from './pages/LifestylePreferencesPage'

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id'))
  const [nickname, setNickname] = useState('')

  if (!userId) {
    return <LoginPage onLoginSuccess={setUserId} />
  }

  if (!nickname) {
    return <ProfilePage userId={userId} onProfileSaved={setNickname} />
  }

  return <LifestylePreferencesPage user_id={userId} nickname={nickname} />
}

export default App

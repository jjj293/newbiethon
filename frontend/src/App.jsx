import { useState } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import HomeScreen from './pages/HomeScreen'
import LifestylePreferencesPage from './pages/LifestylePreferencesPage'
import ProfileConfirm from './pages/ProfileConfirm'

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id'))
  const [screen, setScreen] = useState(() => (localStorage.getItem('user_id') ? 'profile' : 'home'))
  const [nickname, setNickname] = useState('')

  if (screen === 'home') {
    return <HomePage onStart={() => setScreen('login')} />
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(id) => {
          setUserId(id)
          setScreen('profile')
        }}
      />
    )
  }

  if (screen === 'profile') {
    return (
      <ProfilePage
        userId={userId}
        onSaveSuccess={(savedNickname) => {
          setNickname(savedNickname)
          setScreen('homeLocked')
        }}
      />
    )
  }

  if (screen === 'homeLocked') {
    return (
      <HomeScreen
        user={{ nickname: nickname || '사용자', profile_completed: false }}
        onStartSimulation={() => setScreen('simulation')}
      />
    )
  }

  if (screen === 'simulation') {
    return (
      <LifestylePreferencesPage
        user_id={userId}
        nickname={nickname}
        onComplete={() => setScreen('confirm')}
      />
    )
  }

  if (screen === 'confirm') {
    return <ProfileConfirm onConfirm={() => setScreen('homeUnlocked')} />
  }

  return <HomeScreen user={{ nickname: nickname || '사용자', profile_completed: true }} />
}

export default App

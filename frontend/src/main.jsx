import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// TODO: 로그인 파트에서 로그인한 사용자의 userId를 여기로 전달해줘야 함.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App userId="" />
  </StrictMode>,
)

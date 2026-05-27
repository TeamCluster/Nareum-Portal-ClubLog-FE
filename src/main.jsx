import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// StrictMode      : 개발 중 잠재적 문제(이중 호출, deprecated API)를 콘솔에 경고.
// BrowserRouter   : HTML5 history API 기반 라우팅 — useNavigate, <Link> 등이 동작.
// './index.css'   : Tailwind directives + 전역 스타일.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

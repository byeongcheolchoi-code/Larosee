import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ScriptGenerator from './pages/ScriptGenerator.jsx'
import './styles.css'

function Shell({ children }) {
  const loc = useLocation()
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">LA ROSÉE <span>교육 플랫폼</span></div>
        <nav>
          <Link className={loc.pathname === '/' ? 'active' : ''} to="/">관리자 대시보드</Link>
          <Link className={loc.pathname === '/script' ? 'active' : ''} to="/script">현장 스크립트</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/script" element={<ScriptGenerator />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

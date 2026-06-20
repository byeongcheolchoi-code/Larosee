import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import { RequireAuth } from './auth/RequireAuth.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Pending from './pages/Pending.jsx'
import ApprovalQueue from './pages/ApprovalQueue.jsx'
import MyStatus from './pages/MyStatus.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ScriptGenerator from './pages/ScriptGenerator.jsx'
import './styles.css'

function Shell({ children }) {
  const loc = useLocation()
  const { profile, signOut } = useAuth()

  const links = []
  if (profile?.role === '본사관리자' || profile?.role === '최고관리자') {
    links.push({ to: '/admin', label: '관리자 대시보드' })
    links.push({ to: '/approvals', label: '가입 승인' })
  }
  if (profile?.role === '파트장' || profile?.role === '일반직원') {
    links.push({ to: '/my', label: '내 학습 현황' })
  }
  links.push({ to: '/script', label: '현장 스크립트' })

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">LA ROSÉE <span>교육 플랫폼</span></div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {links.map((l) => (
            <Link key={l.to} className={loc.pathname === l.to ? 'active' : ''} to={l.to}>{l.label}</Link>
          ))}
          {profile && (
            <button onClick={signOut} style={{ fontSize: 13, marginLeft: 8 }}>
              {profile.name}님 · 로그아웃
            </button>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

function HomeRedirect() {
  const { profile } = useAuth()
  if (profile?.role === '본사관리자' || profile?.role === '최고관리자') return <Navigate to="/admin" replace />
  return <Navigate to="/my" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pending" element={<Pending />} />

          <Route path="/" element={
            <RequireAuth>
              <Shell><HomeRedirect /></Shell>
            </RequireAuth>
          } />

          <Route path="/admin" element={
            <RequireAuth allowedRoles={['본사관리자', '최고관리자']}>
              <Shell><AdminDashboard /></Shell>
            </RequireAuth>
          } />

          <Route path="/approvals" element={
            <RequireAuth allowedRoles={['본사관리자', '최고관리자']}>
              <Shell><ApprovalQueue /></Shell>
            </RequireAuth>
          } />

          <Route path="/my" element={
            <RequireAuth allowedRoles={['파트장', '일반직원']}>
              <Shell><MyStatus /></Shell>
            </RequireAuth>
          } />

          <Route path="/script" element={
            <RequireAuth>
              <Shell><ScriptGenerator /></Shell>
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Properties from './pages/Properties'
import Tenants from './pages/Tenants'
import Bills from './pages/Bills'
import Sidebar from './components/Sidebar'

function AuthGate() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsLoggedIn(true)
  }, [])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-90 gap-4">
        {showRegister ? (
          <Register onRegistered={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={() => setIsLoggedIn(true)} />
        )}
        <button className="text-sm text-brand-40" onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? 'Already have an account? Log in' : 'No account? Register'}
        </button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="ml-56 flex-1 min-h-screen bg-brand-0 p-8">
          <div className="flex justify-end mb-4">
            <button className="text-sm font-medium text-red-900 bg-red-100 hover:bg-red-500 hover:text-red-200 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
               onClick={() => {
                localStorage.removeItem('token')
                setIsLoggedIn(false)
              }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </div>
          <Routes>
            <Route path="/properties" element={<Properties />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="*" element={<Navigate to="/properties" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default AuthGate
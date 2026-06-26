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
        <main className="ml-56 flex-1 min-h-screen bg-brand-90 p-8">
          <div className="flex justify-end mb-4">
            <button
              className="text-sm text-brand-10"
              onClick={() => {
                localStorage.removeItem('token')
                setIsLoggedIn(false)
              }}
            >
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
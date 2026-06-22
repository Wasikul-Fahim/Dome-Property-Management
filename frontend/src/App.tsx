import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Properties from './pages/Properties'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('username')
    if (token) {
      setIsLoggedIn(true)
      setUsername(user)
    }
  }, [])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        {showRegister
          ? <Register onRegistered={() => setShowRegister(false)} />
          : <Login onLogin={() => { setIsLoggedIn(true); setUsername(localStorage.getItem('username')) }} />}
        <button
          className="text-sm text-blue-600"
          onClick={() => setShowRegister(!showRegister)}
        >
          {showRegister ? 'Already have an account? Log in' : "No account? Register"}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">{username ? `Welcome ${username} !` : 'Welcome back!'}</h1>
        <button className="text-sm text-gray-500"
          onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('username'); setIsLoggedIn(false); setUsername(null) }}>
          Log out
        </button>
      </div>
      <Properties />
    </div>
  )
}

export default App
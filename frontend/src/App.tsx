import { useState, useEffect } from 'react'
import Login from './pages/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsLoggedIn(true)
  }, [])

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">Property Manager</h1>
        <button
          className="text-sm text-gray-500"
          onClick={() => {
            localStorage.removeItem('token')
            setIsLoggedIn(false)
          }}
        >
          Log out
        </button>
      </div>
      <p className="text-gray-600">You're logged in. Properties list goes here next.</p>
    </div>
  )
}

export default App
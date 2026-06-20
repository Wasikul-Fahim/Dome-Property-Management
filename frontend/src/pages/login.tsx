import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../api/client'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => api.post('/users/login', { email, password }),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.access_token)
      onLogin()
    },
  })

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
      <h1 className="text-xl font-medium mb-6">Property Manager</h1>
      <input className="w-full border rounded-lg p-3 mb-3 text-sm"
        placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />
      <input className="w-full border rounded-lg p-3 mb-4 text-sm"
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} />
      <button
        className="w-full bg-blue-600 text-white rounded-lg p-3 text-sm font-medium"
        onClick={() => loginMutation.mutate()}
        disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Log in'}
      </button>
      {loginMutation.isError &&
        <p className="text-red-500 text-sm mt-3">Invalid email or password</p>}
    </div>
  )
}
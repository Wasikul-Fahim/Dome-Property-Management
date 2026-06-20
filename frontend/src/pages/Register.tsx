import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../api/client'

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const registerMutation = useMutation({
    mutationFn: () => api.post('/users/register', { name, email, password }),
    onSuccess: () => onRegistered(),
  })

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
      <h1 className="text-xl font-medium mb-6">Create account</h1>
      <input className="w-full border rounded-lg p-3 mb-3 text-sm"
        placeholder="Name" value={name}
        onChange={e => setName(e.target.value)} />
      <input className="w-full border rounded-lg p-3 mb-3 text-sm"
        placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />
      <input className="w-full border rounded-lg p-3 mb-4 text-sm"
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} />
      <button
        className="w-full bg-blue-600 text-white rounded-lg p-3 text-sm font-medium"
        onClick={() => registerMutation.mutate()}
        disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Creating...' : 'Create account'}
      </button>
      {registerMutation.isError &&
        <p className="text-red-500 text-sm mt-3">Something went wrong. Try a different email.</p>}
    </div>
  )
}
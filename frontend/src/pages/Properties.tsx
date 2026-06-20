import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperties, createProperty, deleteProperty, type PropertyInput } from '../api/properties'

export default function Properties() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PropertyInput>({
    name: '',
    address: '',
    property_type: 'apartment',
  })

  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  })

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setForm({ name: '', address: '', property_type: 'apartment' })
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })

  if (isLoading) return <p className="text-gray-500 text-sm">Loading properties...</p>
  if (isError) return <p className="text-red-500 text-sm">Failed to load properties.</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your properties</h2>
        <button
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add property'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-4 mb-4">
          <input
            className="w-full border rounded-lg p-2 mb-2 text-sm"
            placeholder="Property name (e.g. Dhanmondi Flat 3B)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-2 mb-2 text-sm"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <select
            className="w-full border rounded-lg p-2 mb-3 text-sm"
            value={form.property_type}
            onChange={(e) => setForm({ ...form, property_type: e.target.value })}
          >
            <option value="apartment">Apartment</option>
            <option value="shop">Shop</option>
            <option value="land">Land</option>
            <option value="other">Other</option>
          </select>
          <button
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg w-full disabled:opacity-50"
            onClick={() => createMutation.mutate(form)}
            disabled={createMutation.isPending || !form.name || !form.address}
          >
            {createMutation.isPending ? 'Saving...' : 'Save property'}
          </button>
        </div>
      )}

      {properties && properties.length === 0 && (
        <p className="text-gray-500 text-sm">No properties yet. Add your first one above.</p>
      )}

      <div className="grid gap-3">
        {properties?.map((property) => (
          <div
            key={property.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-start"
          >
            <div>
              <p className="font-medium text-sm">{property.name}</p>
              <p className="text-gray-500 text-sm">{property.address}</p>
              <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                {property.property_type}
              </span>
            </div>
            <button
              className="text-red-500 text-sm"
              onClick={() => deleteMutation.mutate(property.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
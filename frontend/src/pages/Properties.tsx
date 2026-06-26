import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  type Property,
  type PropertyInput,
} from '../api/properties'
import PropertyLeases from '../components/PropertyLeases'
import BillsPanel from '../components/BillsPanel'
import DropdownMenu from '../components/DropDownMenu'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyForm: PropertyInput = {
  name: '',
  address: '',
  property_type: 'apartment',
  meter_number: '',
}

export default function Properties() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PropertyInput>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  })

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PropertyInput }) => updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setDeleteTarget(null)
    },
  })

  function resetForm() {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  function startEdit(property: Property) {
    setForm({
      name: property.name,
      address: property.address,
      property_type: property.property_type,
      meter_number: property.meter_number ?? '',
    })
    setEditingId(property.id)
    setShowForm(true)
  }

  if (isLoading) return <p className="text-gray-500 text-sm">Loading properties...</p>
  if (isError) return <p className="text-red-500 text-sm">Failed to load properties.</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your properties</h2>
        <button
          className="bg-brand-50 text-brand-10 text-sm px-4 py-2 rounded-lg"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : '+ Add property'}
        </button>
      </div>

      {showForm && (
        <div className="bg-brand-80 border rounded-xl p-4 mb-4">
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
            className="w-full border rounded-lg p-2 mb-2 text-sm"
            value={form.property_type}
            onChange={(e) => setForm({ ...form, property_type: e.target.value })}
          >
            <option value="apartment">Apartment</option>
            <option value="shop">Shop</option>
            <option value="land">Land</option>
            <option value="other">Other</option>
          </select>
          <input
            className="w-full border rounded-lg p-2 mb-3 text-sm"
            placeholder="Electric meter number (optional)"
            value={form.meter_number}
            onChange={(e) => setForm({ ...form, meter_number: e.target.value })}
          />
          <button
            className="bg-brand-50 text-brand-20 font-bold text-sm px-4 py-2 rounded-lg w-full disabled:opacity-50"
            onClick={() =>
              editingId
                ? updateMutation.mutate({ id: editingId, data: form })
                : createMutation.mutate(form)
            }
            disabled={
              createMutation.isPending || updateMutation.isPending || !form.name || !form.address
            }
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : editingId
              ? 'Update property'
              : 'Save property'}
          </button>
        </div>
      )}

      {properties && properties.length === 0 && (
        <p className="text-gray-500 text-sm">No properties yet. Add your first one above.</p>
      )}

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
          <div key={property.id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{property.name}</p>
                <p className="text-gray-500 text-sm">{property.address}</p>
                <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {property.property_type}
                </span>
                {property.meter_number && (
                  <span className="inline-block mt-1 ml-1 text-xs bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-700">
                    Meter: {property.meter_number}
                  </span>
                )}
              </div>
              <DropdownMenu
                items={[
                  { label: 'Edit', onClick: () => startEdit(property) },
                  { label: 'Delete', onClick: () => setDeleteTarget(property), danger: true },
                ]}
              />
            </div>

            <PropertyLeases propertyId={property.id} />
            <BillsPanel propertyId={property.id} />
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
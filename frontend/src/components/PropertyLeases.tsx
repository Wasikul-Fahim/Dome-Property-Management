import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeasesForProperty, createLease } from '../api/leases'
import { getTenants, createTenant } from '../api/tenants'
import RentLedger from './RentLedger'

export default function PropertyLeases({ propertyId }: { propertyId: number }) {
  const queryClient = useQueryClient()
  const [showNewLeaseForm, setShowNewLeaseForm] = useState(false)
  const [showNewTenant, setShowNewTenant] = useState(false)

  const [selectedTenantId, setSelectedTenantId] = useState<number | ''>('')
  const [startDate, setStartDate] = useState('')
  const [rent, setRent] = useState('')

  const [newTenant, setNewTenant] = useState({ full_name: '', phone: '' })

  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases', propertyId],
    queryFn: () => getLeasesForProperty(propertyId),
  })

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  })

  const createLeaseMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases', propertyId] })
      setShowNewLeaseForm(false)
      setSelectedTenantId('')
      setStartDate('')
      setRent('')
    },
  })

  const createTenantMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setSelectedTenantId(tenant.id)
      setShowNewTenant(false)
      setNewTenant({ full_name: '', phone: '' })
    },
  })

  if (isLoading) return <p className="text-gray-500 text-sm">Loading tenants...</p>

  const currentLease = leases?.find((l) => l.end_date === null)
  const pastLeases = leases?.filter((l) => l.end_date !== null) ?? []

  return (
    <div className="mt-3 border-t pt-3">
      {currentLease ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700 font-medium mb-1 text-center">Current tenant</p>
          <p className="text-md font-medium">{currentLease.tenant.full_name}</p>
          <p className="text-sm text-gray-600">{currentLease.tenant.phone}</p>
          <p className="text-xs text-gray-400">{currentLease.tenant.nid_number}</p> <br />
          <p className="text-sm text-gray-500 mt-1">
            Rent: {currentLease.monthly_rent} / month · Since {currentLease.start_date}
          </p>
        <RentLedger leaseId={currentLease.id} monthlyRent={currentLease.monthly_rent} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No current tenant</p>
      )}

      <button
        className="text-xs text-blue-600 mt-2"
        onClick={() => setShowNewLeaseForm(!showNewLeaseForm)}
      >
        {showNewLeaseForm ? 'Cancel' : currentLease ? '+ Replace tenant' : '+ Add tenant'}
      </button>

      {showNewLeaseForm && (
        <div className="bg-white border rounded-lg p-3 mt-2 space-y-2">
          {!showNewTenant ? (
            <>
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(Number(e.target.value))}
              >
                <option value="">Select tenant...</option>
                {tenants?.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
              <button
                className="text-xs text-blue-600"
                onClick={() => setShowNewTenant(true)}
              >
                + New tenant instead
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Tenant full name"
                value={newTenant.full_name}
                onChange={(e) => setNewTenant({ ...newTenant, full_name: e.target.value })}
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Phone"
                value={newTenant.phone}
                onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="NID Number"
                value={newTenant.nid_number}
                onChange={(e) => setNewTenant({ ...newTenant, nid_number: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg"
                  onClick={() => createTenantMutation.mutate(newTenant)}
                  disabled={!newTenant.full_name}
                >
                  Save tenant
                </button>
                <button className="text-xs text-gray-500" onClick={() => setShowNewTenant(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Monthly rent"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg w-full disabled:opacity-50"
            disabled={!selectedTenantId || !startDate || !rent || createLeaseMutation.isPending}
            onClick={() =>
              createLeaseMutation.mutate({
                property_id: propertyId,
                tenant_id: Number(selectedTenantId),
                start_date: startDate,
                monthly_rent: Number(rent),
              })
            }
          >
            {createLeaseMutation.isPending ? 'Saving...' : 'Start lease'}
          </button>
        </div>
      )}

      {pastLeases.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Past tenants ({pastLeases.length})
          </summary>
          <div className="mt-2 space-y-2">
            {pastLeases.map((l) => (
              <div key={l.id} className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                {l.tenant.full_name} · {l.start_date} → {l.end_date} · {l.monthly_rent}/mo
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
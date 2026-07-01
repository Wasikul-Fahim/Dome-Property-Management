import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeasesForProperty, createLease } from '../api/leases'
import { getTenants, createTenant } from '../api/tenants'
import RentLedger from './RentLedger'

function CopyableText({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <span onClick={handleCopy} style={{ cursor: 'pointer' }}>
      {text} {copied && <small>(Copied!)</small>}
    </span>
  );
}

  const formatMonthDisplay = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const shortYear = year.slice(-2);
    return `${monthName}, ${shortYear}`;
  };


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
        <div className="bg-brand-0 border border-brand-30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Column 1: Name (Vertically centered by the parent, left-aligned) */}
            <div>
              <p className="text-lg font-bold text-brand-txt ml-1">{currentLease.tenant.full_name}</p>
            </div>

            {/* Column 2: Contact Details (Stacked in 2 rows, right-aligned) */}
            <div className="flex flex-col items-end gap-1.5">
              {/* Row 1: Phone */}
              <div className="flex items-center gap-1.5 text-sm text-brand-txt">
                <svg className="w-4 h-4 text-brand-txt" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                    <rect width="12.5" height="18.5" x="5.75" y="2.75" rx="3"/>
                    <path d="M11 17.75h2"/>
                  </g>
                </svg>
                <span>
                  <CopyableText text={currentLease.tenant.phone} />
                </span>
              </div>

              {/* Row 2: NID */}
              <div className="flex items-center gap-1.5 text-xs text-brand-txt">
                <svg className="w-4 h-4 text-brand-txt" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M18 3a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7q0-.053.005-.102A3.994 3.994 0 0 1 6 3zm-1 12H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2M9 7a2.995 2.995 0 0 0-2.995 2.898A1 1 0 0 0 6 10a3 3 0 1 0 3-3m8 4h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m0-4h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2"/>
                </svg>
                <span>
                  <CopyableText text={currentLease.tenant.nid_number} />
                </span>
              </div>
            </div>
            
          </div>
          {/* Row 3: Lease Details */}
          <p className="text-sm text-gray-500 mb-4">
            Rent: <span className="font-semibold text-brand-primary">{currentLease.monthly_rent}</span> / month · Since <span className="font-semibold text-brand-secondary">{formatMonthDisplay(currentLease.start_date)}</span>
          </p>
          {/* Rent Ledger Component */}
          <RentLedger leaseId={currentLease.id} monthlyRent={currentLease.monthly_rent} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No current tenant</p>
      )}


      <button
        className="mt-2 text-xs font-medium bg-brand-secondary text-blue-900 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition w-full"
        onClick={() => setShowNewLeaseForm(!showNewLeaseForm)}
      >
        {showNewLeaseForm ? (
          'Cancel'
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {currentLease ? 'Replace tenant' : 'Add tenant'}
          </>
        )}
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
          <summary className="text-xs text-brand-30 cursor-pointer">
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
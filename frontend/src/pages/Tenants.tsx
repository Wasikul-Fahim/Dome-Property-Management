import { useQuery } from '@tanstack/react-query'
import { getAllLeases } from '../api/leases'

export default function Tenants() {
  const { data: leases, isLoading, isError } = useQuery({
    queryKey: ['allLeases'],
    queryFn: getAllLeases,
  })

  if (isLoading) return <p className="text-gray-500 text-sm">Loading tenants...</p>
  if (isError) return <p className="text-red-500 text-sm">Failed to load tenants.</p>

  const current = leases?.filter((l) => l.end_date === null) ?? []
  const past = leases?.filter((l) => l.end_date !== null) ?? []

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Tenants</h2>

      {current.length === 0 && (
        <p className="text-gray-500 text-sm mb-4">No current tenants.</p>
      )}

      <div className="grid gap-2 mb-4">
        {current.map((lease) => (
          <div
            key={lease.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm">{lease.tenant.full_name}</p>
              <p className="text-xs text-gray-500">{lease.tenant.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700">{lease.property.name}</p>
              <p className="text-xs text-gray-400">
                {lease.monthly_rent}/mo · since {lease.start_date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <details className="mt-2">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Past tenants ({past.length})
          </summary>
          <div className="mt-2 grid gap-2">
            {past.map((lease) => (
              <div
                key={lease.id}
                className="bg-gray-50 border rounded-xl p-4 flex justify-between items-center text-gray-500"
              >
                <div>
                  <p className="text-sm">{lease.tenant.full_name}</p>
                  <p className="text-xs">{lease.tenant.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{lease.property.name}</p>
                  <p className="text-xs">
                    {lease.start_date} → {lease.end_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
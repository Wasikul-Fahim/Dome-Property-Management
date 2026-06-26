import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllBillsWithProperty, markBillPaid } from '../api/bills'

export default function Bills() {
  const queryClient = useQueryClient()

  const { data: bills, isLoading, isError } = useQuery({
    queryKey: ['allBills'],
    queryFn: getAllBillsWithProperty,
  })

  const payMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => markBillPaid(id, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allBills'] }),
  })

  if (isLoading) return <p className="text-gray-500 text-sm">Loading bills...</p>
  if (isError) return <p className="text-red-500 text-sm">Failed to load bills.</p>

  const unpaid = bills?.filter((b) => !b.paid) ?? []
  const paid = bills?.filter((b) => b.paid) ?? []

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Bills</h2>

      {unpaid.length === 0 && (
        <p className="text-gray-500 text-sm mb-4">No unpaid bills. You're all caught up.</p>
      )}

      <div className="grid gap-2 mb-4">
        {unpaid.map((bill) => (
          <div
            key={bill.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm capitalize">{bill.bill_type}</p>
              <p className="text-xs text-gray-500">{bill.property.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700">{bill.amount} · due {bill.due_date}</p>
              <button
                className="text-xs text-blue-600 mt-1"
                onClick={() => payMutation.mutate({ id: bill.id, amount: bill.amount })}
              >
                Mark paid
              </button>
            </div>
          </div>
        ))}
      </div>

      {paid.length > 0 && (
        <details className="mt-2">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Paid bills ({paid.length})
          </summary>
          <div className="mt-2 grid gap-2">
            {paid.map((bill) => (
              <div
                key={bill.id}
                className="bg-gray-50 border rounded-xl p-4 flex justify-between items-center text-gray-500"
              >
                <div>
                  <p className="text-sm capitalize">{bill.bill_type}</p>
                  <p className="text-xs">{bill.property.name}</p>
                </div>
                <p className="text-sm">{bill.amount} · paid {bill.paid_date}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
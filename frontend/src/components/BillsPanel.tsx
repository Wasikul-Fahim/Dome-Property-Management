import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBillsForProperty, createBill, markBillPaid, deleteBill } from '../api/bills'

const BILL_TYPES = ['electricity', 'gas', 'water', 'tax', 'internet', 'other']

export default function BillsPanel({ propertyId }: { propertyId: number }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    bill_type: 'electricity',
    amount: '',
    due_date: '',
    notes: '',
  })

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills', propertyId],
    queryFn: () => getBillsForProperty(propertyId),
  })

  const createMutation = useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', propertyId] })
      setForm({ bill_type: 'electricity', amount: '', due_date: '', notes: '' })
      setShowForm(false)
    },
  })

  const payMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => markBillPaid(id, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', propertyId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', propertyId] }),
  })

  if (isLoading) return <p className="text-xs text-gray-500">Loading bills...</p>

  const unpaid = bills?.filter((b) => !b.paid) ?? []
  const paid = bills?.filter((b) => b.paid) ?? []

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-medium text-gray-600">Bills & taxes</p>
        <button className="text-xs text-blue-600" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add bill'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-3 mb-2 space-y-2">
          <select
            className="w-full border rounded-lg p-2 text-sm"
            value={form.bill_type}
            onChange={(e) => setForm({ ...form, bill_type: e.target.value })}
          >
            {BILL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg w-full disabled:opacity-50"
            disabled={!form.amount || !form.due_date || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                property_id: propertyId,
                bill_type: form.bill_type,
                amount: Number(form.amount),
                due_date: form.due_date,
                notes: form.notes || undefined,
              })
            }
          >
            {createMutation.isPending ? 'Saving...' : 'Save bill'}
          </button>
        </div>
      )}

      <div className="space-y-1">
        {unpaid.map((b) => (
          <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 rounded-lg p-2">
            <span className="capitalize">{b.bill_type} — {b.amount} (due {b.due_date})</span>
            <div className="flex gap-2">
              <button className="text-blue-600" onClick={() => payMutation.mutate({ id: b.id, amount: b.amount })}>
                Mark paid
              </button>
              <button className="text-gray-400" onClick={() => deleteMutation.mutate(b.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {paid.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">Paid ({paid.length})</summary>
          <div className="mt-1 space-y-1">
            {paid.map((b) => (
              <div key={b.id} className="text-xs bg-green-50 rounded-lg p-2 capitalize">
                {b.bill_type} — {b.amount} (paid {b.paid_date})
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
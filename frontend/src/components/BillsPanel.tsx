import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBillsForProperty, createBill, markBillPaid, deleteBill } from '../api/bills'

const BILL_TYPES = ['Electricity', 'Gas', 'Water', 'Tax', 'Internet', 'Other']

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BillsPanel({ propertyId }: { propertyId: number }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    bill_type: 'electricity',
    amount: '',
    due_date: getTodayDateString(),
    notes: '',
  })

  // Which bill is currently showing its "confirm payment" inline prompt.
  // Only one at a time, keyed by bill id — same pattern as showForm/editingId elsewhere.
  const [confirmingPayId, setConfirmingPayId] = useState<number | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')

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
    mutationFn: ({ id, amount, referenceNumber }: { id: number; amount: number; referenceNumber: string | null }) =>
      markBillPaid(id, amount, referenceNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', propertyId] })
      setConfirmingPayId(null)
      setReferenceNumber('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills', propertyId] }),
  })

  if (isLoading) return <p className="text-xs text-gray-500">Loading bills...</p>

  const unpaid = bills?.filter((b) => !b.paid) ?? []
  const paid = bills?.filter((b) => b.paid) ?? []

  function startConfirmingPay(billId: number) {
    setConfirmingPayId(billId)
    setReferenceNumber('')
  }

  function cancelConfirmingPay() {
    setConfirmingPayId(null)
    setReferenceNumber('')
  }

  function confirmPay(billId: number, amount: number) {
    // Reference number is optional — empty string becomes null, never required to proceed.
    payMutation.mutate({ id: billId, amount, referenceNumber: referenceNumber.trim() || null })
  }

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <p className="text-md font-semibold text-brand-secondary">Bills & taxes</p>
        <button className="bg-brand-50 text-brand-0 text-xs px-3 py-1 rounded-lg disabled:opacity-50" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="bg-brand-bg border rounded-lg p-3 mb-2 space-y-2">
          <select
            className="w-full border text-brand-txt rounded-lg p-2 text-sm"
            value={form.bill_type}
            onChange={(e) => setForm({ ...form, bill_type: e.target.value })}
          >
            {BILL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="number"
            className="w-full border text-brand-txt  rounded-lg p-2 text-sm"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="date"
            className="w-full border text-brand-txt rounded-lg p-2 text-sm [&::-webkit-calendar-picker-indicator]:invert"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <input
            className="w-full border text-brand-txt rounded-lg p-2 text-sm"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button
            className="bg-brand-primary text-brand-txt text-sm px-4 py-2 rounded-lg w-full disabled:opacity-50"
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
          <div key={b.id} className="bg-brand-secondary rounded-lg p-3 text-sm text-brand-bg">
            <div className="flex justify-between items-center text-xs">
              <span className="capitalize">{b.bill_type} — {b.amount} (due {b.due_date})</span>
              {confirmingPayId !== b.id && (
                <div className="flex items-center gap-1.5">
                  {/* Mark Paid Micro-Button */}
                  <button className="p-1 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-100 transition flex items-center gap-1 px-1.5 py-0.5" onClick={() => startConfirmingPay(b.id)}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Paid
                  </button>

                  {/* Delete Micro-Button */}
                  <button className="p-1 text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-100 transition flex items-center gap-1 px-1.5 py-0.5" onClick={() => deleteMutation.mutate(b.id)}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>

            {confirmingPayId === b.id && (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  autoFocus
                  className="flex-1 border rounded-lg p-1.5 text-xs"
                  placeholder="Confirmation / bill number (optional)"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmPay(b.id, b.amount)
                    if (e.key === 'Escape') cancelConfirmingPay()
                  }}
                />
                <button
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                  disabled={payMutation.isPending}
                  onClick={() => confirmPay(b.id, b.amount)}
                >
                  {payMutation.isPending ? 'Saving...' : 'Confirm'}
                </button>
                <button className="bg-red-100 text-red-800 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50" onClick={cancelConfirmingPay}>
                    Cancel
                </button>

              </div>
            )}
          </div>
        ))}
      </div>

      {paid.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-brand-30 cursor-pointer">Paid ({paid.length})</summary>
          <div className="mt-1 space-y-1">
            {paid.map((b) => (
              <div key={b.id} className="text-xs bg-green-50 rounded-lg p-2 capitalize">
                {b.bill_type} — {b.amount} (paid {b.paid_date})
                {b.reference_number && (
                  <span className="text-green-700"> · Ref: {b.reference_number}</span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPaymentsForLease, markPaymentPaid } from '../api/rentPayments'

export default function RentLedger({ leaseId, monthlyRent }: { leaseId: number; monthlyRent: number }) {
  const queryClient = useQueryClient()
  const [activeMonthId, setActiveMonthId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [paidDate, setPaidDate] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')

  const { data: payments, isLoading } = useQuery({
    queryKey: ['rentPayments', leaseId],
    queryFn: () => getPaymentsForLease(leaseId),
  })

  const syncMutation = useMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rentPayments', leaseId] }),
    onError: (err) => console.error('Sync failed:', err),
  })

  useEffect(() => {
    syncMutation.mutate()
  }, [leaseId])

  const markPaidMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      markPaymentPaid(id, Number(amount), paidDate, receiptNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentPayments', leaseId] })
      closeForm()
    },
  })

  const openForm = (paymentId: number) => {
    setActiveMonthId(paymentId)
    setAmount(String(monthlyRent))
    setPaidDate(new Date().toISOString().split('T')[0])
    setReceiptNumber('')
  }


  const closeForm = () => {
    setActiveMonthId(null)
    setAmount('')
    setPaidDate('')
    setReceiptNumber('')
  }

  if (isLoading) return <p className="text-xs text-gray-500">Loading rent history...</p>

  const paidCount = payments?.filter((p) => p.is_paid).length ?? 0
  const totalCount = payments?.length ?? 0

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-600 mb-2">
        Rent ledger — {paidCount}/{totalCount} months paid
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {payments?.map((p) => (
          <div key={p.id}>
            <button
              onClick={() => !p.is_paid && openForm(p.id)}
              disabled={p.is_paid}
              className={`w-full text-xs rounded-lg p-2 text-left transition ${
                p.is_paid
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : activeMonthId === p.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
              }`}
              title={p.is_paid ? `Paid ${p.amount_paid} · Receipt #${p.receipt_number} · ${p.paid_date}` : 'Click to record payment'}
            >
              <div className="font-medium">{p.month}</div>
              <div className="text-[11px] opacity-80">{p.is_paid ? 'Paid' : 'Unpaid'}</div>
            </button>
          </div>
        ))}
      </div>

      {activeMonthId !== null && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-blue-700">
            Confirm payment for {payments?.find((p) => p.id === activeMonthId)?.month}
          </p>
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Amount paid"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
          />
          <input
            type="text"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Receipt number"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg flex-1 disabled:opacity-50"
              disabled={!amount || !paidDate || !receiptNumber || markPaidMutation.isPending}
              onClick={() => markPaidMutation.mutate({ id: activeMonthId })}
            >
              {markPaidMutation.isPending ? 'Saving...' : 'Confirm paid'}
            </button>
            <button className="text-sm text-gray-500 px-3" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


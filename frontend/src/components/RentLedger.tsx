import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPaymentsForLease, markPaymentPaid } from '../api/rentPayments'

export default function RentLedger({ leaseId, monthlyRent }: { leaseId: number; monthlyRent: number }) {
  const queryClient = useQueryClient()
  const [activeMonthId, setActiveMonthId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [paidDate, setPaidDate] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [rowOffset, setRowOffset] = useState(0)

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

  const formatMonthDisplay = (monthStr: string) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const shortYear = year.slice(-2);
  return `${monthName}, ${shortYear}`;
};

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
  // Calc Rows for Pagination
  const itemsPerRow = 3
  const maxRowsVisible = 2
  const totalRows = payments ? Math.ceil(payments.length / itemsPerRow) : 0

  const visiblePayments = payments?.slice(
    rowOffset * itemsPerRow,
    (rowOffset + maxRowsVisible) * itemsPerRow
  )

  return (
    <div className="mt-2">
      {/* Header with inline up/down navigation icons */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-medium text-gray-600">
          Rent ledger — {paidCount}/{totalCount} paid
        </p>
        
        {totalRows > maxRowsVisible && (
          <div className="flex items-center gap-1 bg-gray-500 border border-gray-400 rounded-md p-0.5">
            {/* Navigate Up Button */}
            <button
              onClick={() => setRowOffset((prev) => Math.max(0, prev - 1))}
              disabled={rowOffset === 0}
              className="p-1 rounded text-gray-100 hover:bg-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Scroll up"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            
            {/* Navigate Down Button */}
            <button
              onClick={() => setRowOffset((prev) => Math.min(totalRows - maxRowsVisible, prev + 1))}
              disabled={rowOffset >= totalRows - maxRowsVisible}
              className="p-1 rounded text-gray-100 hover:bg-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Scroll down"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Controlled Grid Container */}
      <div className="grid grid-cols-3 gap-2 min-h-[84px]">
        {visiblePayments?.map((p) => (
          <div key={p.id}>
            <button
              onClick={() => !p.is_paid && openForm(p.id)}
              disabled={p.is_paid}
              className={`w-full text-xs rounded-lg p-2 text-left transition ${
                p.is_paid
                  ? 'bg-green-900 text-green-100 cursor-default'
                  : activeMonthId === p.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-900 text-red-100 hover:bg-red-100 hover:text-red-700 cursor-pointer'
              }`}
              title={p.is_paid ? `Paid ${p.amount_paid} · Receipt #${p.receipt_number} · ${p.paid_date}` : 'Click to record payment'}
            >
              <div className="font-medium text-[11px] truncate">{formatMonthDisplay(p.month)}</div>
              <div className="text-[10px] opacity-80">{p.is_paid ? 'Paid' : 'Unpaid'}</div>
            </button>
          </div>
        ))}
      </div>

      {/* Form Panel remains the same */}
      {activeMonthId !== null && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-blue-700">
            Confirm payment for {formatMonthDisplay(payments?.find((p) => p.id === activeMonthId)?.month || '')}
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
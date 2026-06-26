import api from './client'

export interface RentPayment {
  id: number
  lease_id: number
  month: string
  amount_paid: number
  paid_date: string | null
  receipt_number: string | null
  is_paid: boolean
}



export const getPaymentsForLease = async (leaseId: number): Promise<RentPayment[]> => {
  const res = await api.get(`/rent-payments/lease/${leaseId}`)
  return res.data
}

export const createRentRecord = async (leaseId: number, month: string): Promise<RentPayment> => {
  const res = await api.post('/rent-payments/', { lease_id: leaseId, month })
  return res.data
}

export const markPaymentPaid = async (
  paymentId: number,
  amountPaid: number,
  paidDate: string,
  receiptNumber: string
): Promise<RentPayment> => {
  const res = await api.put(`/rent-payments/${paymentId}`, {
    amount_paid: amountPaid,
    paid_date: paidDate,
    receipt_number: receiptNumber,
    is_paid: true,
  })
  return res.data
}


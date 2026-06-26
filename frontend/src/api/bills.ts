import api from './client'

export interface Bill {
  id: number
  property_id: number
  bill_type: string
  amount: number
  due_date: string
  paid: boolean
  paid_date: string | null
  notes: string | null
}

export interface BillInput {
  property_id: number
  bill_type: string
  amount: number
  due_date: string
  notes?: string
}

export const getBillsForProperty = async (propertyId: number): Promise<Bill[]> => {
  const res = await api.get(`/bills/property/${propertyId}`)
  return res.data
}

export const getAllBills = async (): Promise<Bill[]> => {
  const res = await api.get('/bills/all')
  return res.data
}

export const createBill = async (data: BillInput): Promise<Bill> => {
  const res = await api.post('/bills/', data)
  return res.data
}

export const markBillPaid = async (
  id: number,
  amount: number,
  referenceNumber: string | null
): Promise<Bill> => {
  const res = await api.put(`/bills/${id}`, {
    paid: true,
    amount,
    paid_date: new Date().toISOString().split('T')[0],
    reference_number: referenceNumber || null,
  })
  return res.data
}

export const deleteBill = async (billId: number): Promise<void> => {
  await api.delete(`/bills/${billId}`)
}

export interface BillWithProperty extends Bill {
  property: { id: number; name: string }
}

export const getAllBillsWithProperty = async (): Promise<BillWithProperty[]> => {
  const res = await api.get('/bills/all')
  return res.data
}
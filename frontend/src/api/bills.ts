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

export const markBillPaid = async (billId: number, amount: number): Promise<Bill> => {
  const res = await api.put(`/bills/${billId}`, {
    paid: true,
    amount,
    paid_date: new Date().toISOString().split('T')[0],
  })
  return res.data
}

export const deleteBill = async (billId: number): Promise<void> => {
  await api.delete(`/bills/${billId}`)
}
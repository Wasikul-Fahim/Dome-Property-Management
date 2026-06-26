import api from './client'
import type { Tenant } from './tenants'

export interface Lease {
  id: number
  property_id: number
  tenant_id: number
  start_date: string
  end_date: string | null
  monthly_rent: number
  tenant: Tenant
}

export interface LeaseInput {
  property_id: number
  tenant_id: number
  start_date: string
  monthly_rent: number
}

export const getLeasesForProperty = async (propertyId: number): Promise<Lease[]> => {
  const res = await api.get(`/leases/property/${propertyId}`)
  return res.data
}

export const createLease = async (data: LeaseInput): Promise<Lease> => {
  const res = await api.post('/leases/', data)
  return res.data
}

export const endLease = async (leaseId: number, endDate: string): Promise<void> => {
  await api.post(`/leases/${leaseId}/end?end_date=${endDate}`)
}

export interface LeaseWithProperty extends Lease {
  property: { id: number; name: string }
}

export const getAllLeases = async (): Promise<LeaseWithProperty[]> => {
  const res = await api.get('/leases/all')
  return res.data
}
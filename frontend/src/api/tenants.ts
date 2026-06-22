import api from './client'

export interface Tenant {
  id: number
  full_name: string
  phone: string | null
  nid_number: string | null
}

export interface TenantInput {
  full_name: string
  phone?: string
  nid_number?: string
}

export const getTenants = async (): Promise<Tenant[]> => {
  const res = await api.get('/tenants/')
  return res.data
}

export const createTenant = async (data: TenantInput): Promise<Tenant> => {
  const res = await api.post('/tenants/', data)
  return res.data
}
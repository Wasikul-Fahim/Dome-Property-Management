import api from './client'

export interface Property {
  id: number
  name: string
  address: string
  property_type: string
  meter_number: string | null
  owner_id: number
}

export interface PropertyInput {
  name: string
  address: string
  property_type: string
  meter_number?: string
}

export const getProperties = async (): Promise<Property[]> => {
  const res = await api.get('/properties/')
  return res.data
}

export const createProperty = async (data: PropertyInput): Promise<Property> => {
  const res = await api.post('/properties/', data)
  return res.data
}

export const updateProperty = async (id: number, data: PropertyInput): Promise<Property> => {
  const res = await api.put(`/properties/${id}`, data)
  return res.data
}

export const deleteProperty = async (id: number): Promise<void> => {
  await api.delete(`/properties/${id}`)
}
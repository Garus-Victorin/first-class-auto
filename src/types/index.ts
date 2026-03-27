export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  pricePerDay?: number
  type: 'sale' | 'rental'
  status: 'available' | 'sold' | 'rented' | 'reserved'
  fuel: string
  transmission: string
  mileage: number
  seats: number
  color?: string
  description?: string
  images: string[]
  videos?: string[]
  location: string
  featured: number
  viewCount: number
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface Listing {
  id: string
  userId?: string
  sellerName: string
  sellerPhone: string
  sellerEmail?: string
  brand: string
  model: string
  year: number
  price: number
  type: 'sale' | 'rental'
  fuel: string
  transmission: string
  mileage: number
  color?: string
  description?: string
  images: string[]
  location: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  vehicleId: string
  userName: string
  userPhone: string
  userEmail?: string
  type: 'rental' | 'purchase'
  startDate?: string
  endDate?: string
  totalPrice?: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

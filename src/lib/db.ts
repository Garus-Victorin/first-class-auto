import type { Vehicle, Listing, Booking, BlogPost } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToVehicle(r: any): Vehicle {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    year: r.year,
    price: r.price,
    pricePerDay: r.price_per_day ?? undefined,
    type: r.type,
    status: r.status,
    fuel: r.fuel,
    transmission: r.transmission,
    mileage: r.mileage,
    seats: r.seats,
    color: r.color ?? undefined,
    description: r.description ?? undefined,
    images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images ?? []),
    videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : (r.videos ?? []),
    location: r.location,
    featured: r.featured ?? 0,
    viewCount: r.view_count ?? 0,
    userId: r.user_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToListing(r: any): Listing {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    sellerName: r.seller_name,
    sellerPhone: r.seller_phone,
    sellerEmail: r.seller_email ?? undefined,
    brand: r.brand,
    model: r.model,
    year: r.year,
    price: r.price,
    type: r.type,
    fuel: r.fuel,
    transmission: r.transmission,
    mileage: r.mileage,
    color: r.color ?? undefined,
    description: r.description ?? undefined,
    images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images ?? []),
    location: r.location,
    status: r.status,
    adminNotes: r.admin_notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToBlogPost(r: any): BlogPost {
  return {
    id: r.id,
    titre: r.titre,
    contenu: r.contenu,
    images: typeof r.images === 'string' ? JSON.parse(r.images) : (Array.isArray(r.images) ? r.images : (r.image ? [r.image] : [])),
    videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : (Array.isArray(r.videos) ? r.videos : (r.video ? [r.video] : [])),
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToBooking(r: any): Booking {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    userName: r.user_name,
    userPhone: r.user_phone,
    userEmail: r.user_email ?? undefined,
    type: r.type,
    startDate: r.start_date ?? undefined,
    endDate: r.end_date ?? undefined,
    totalPrice: r.total_price ?? undefined,
    status: r.status,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

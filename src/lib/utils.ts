import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA'
}

export function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images
  if (!images) return []
  try { return JSON.parse(images) } catch { return [] }
}

export const BRANDS = [
  'Toyota', 'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Lexus',
  'Honda', 'Hyundai', 'Kia', 'Nissan', 'Peugeot', 'Renault',
  'Volkswagen', 'Ford', 'Mitsubishi',
]

export const FUEL_TYPES = ['essence', 'diesel', 'hybride', 'électrique']
export const TRANSMISSIONS = ['automatique', 'manuelle']

export const VEHICLE_TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'sale', label: 'À vendre' },
  { value: 'rental', label: 'À louer' },
]

export const WHATSAPP_NUMBER = '+2290196422780'
export const PHONE_NUMBER = '+2290196422780'

export const LOCATIONS = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon']

export const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'

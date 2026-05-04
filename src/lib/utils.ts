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
  // Japonaises (très présentes en Afrique)
  'Toyota', 'Honda', 'Nissan', 'Mitsubishi', 'Mazda', 'Suzuki', 'Subaru', 'Isuzu', 'Daihatsu',
  // Coréennes
  'Hyundai', 'Kia', 'SsangYong',
  // Allemandes
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Opel',
  // Françaises
  'Peugeot', 'Renault', 'Citroën',
  // Américaines
  'Ford', 'Chevrolet', 'Jeep', 'Dodge', 'GMC',
  // Britanniques
  'Range Rover', 'Land Rover', 'Jaguar',
  // Italiennes
  'Fiat', 'Alfa Romeo',
  // Chinoises (très présentes en Afrique)
  'Chery', 'Geely', 'BYD', 'BAIC', 'JAC', 'Haval', 'MG', 'Dongfeng', 'Foton', 'Lifan', 'Changan', 'DFSK', 'Brilliance', 'Zotye',
  // Indiennes
  'Tata', 'Mahindra',
  // Luxe
  'Lexus', 'Infiniti', 'Acura', 'Volvo', 'Porsche', 'Maserati',
  // Utilitaires / Pick-up
  'Iveco', 'Hino', 'Dacia',
].sort()

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

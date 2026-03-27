import { Link } from '@tanstack/react-router'
import { Fuel, Settings, Calendar, Gauge } from 'lucide-react'
import { Button } from '@blinkdotnew/ui'
import { formatPrice, parseImages, DEFAULT_CAR_IMAGE } from '@/lib/utils'
import type { Vehicle } from '@/types'

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const images = parseImages(vehicle.images as unknown as string | string[])
  const imageUrl = images[0] || DEFAULT_CAR_IMAGE

  return (
    <Link to="/vehicule/$id" params={{ id: vehicle.id }}>
      <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-secondary shrink-0">
          <img
            src={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-2 py-1 rounded-md text-xs font-bold text-white ${
                vehicle.type === 'sale' ? 'bg-primary' : 'bg-[#16181D]'
              }`}
            >
              {vehicle.type === 'sale' ? 'VENTE' : 'LOCATION'}
            </span>
            {Number(vehicle.featured) > 0 && (
              <span className="px-2 py-1 rounded-md text-xs font-bold bg-accent text-accent-foreground">
                VEDETTE
              </span>
            )}
          </div>
          {/* Status badge if not available */}
          {vehicle.status !== 'available' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-foreground text-sm font-bold px-4 py-2 rounded-lg uppercase">
                {vehicle.status === 'sold' ? 'Vendu' : vehicle.status === 'rented' ? 'Loué' : 'Réservé'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            style={{ fontFamily: 'Syne, sans-serif' }}
            className="font-bold text-lg text-foreground leading-tight"
          >
            {vehicle.brand} {vehicle.model}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-xl font-bold text-primary">{formatPrice(vehicle.price)}</span>
          </div>
          {vehicle.type === 'rental' && vehicle.pricePerDay && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatPrice(vehicle.pricePerDay)}/jour
            </p>
          )}

          {/* Specs pills */}
          <div className="mt-3 flex flex-wrap gap-1.5 flex-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Fuel className="w-3 h-3" />
              {vehicle.fuel}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Settings className="w-3 h-3" />
              {vehicle.transmission}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Gauge className="w-3 h-3" />
              {vehicle.mileage.toLocaleString('fr-FR')} km
            </span>
          </div>

          {/* Location */}
          <p className="text-xs text-muted-foreground mt-2">{vehicle.location}</p>

          <Button
            variant="outline"
            className="mt-4 w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Voir les détails
          </Button>
        </div>
      </div>
    </Link>
  )
}

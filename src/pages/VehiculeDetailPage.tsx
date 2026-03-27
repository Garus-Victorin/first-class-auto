import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Calendar, Share2, MapPin, Fuel, Settings, Gauge, Users, Palette, ChevronLeft } from 'lucide-react'
import { Button, Badge, toast, Skeleton } from '@blinkdotnew/ui'
import { supabase } from '@/blink/client'
import { dbToVehicle } from '@/lib/db'
import { formatPrice, parseImages, DEFAULT_CAR_IMAGE, WHATSAPP_NUMBER } from '@/lib/utils'
import type { Vehicle } from '@/types'

const MOCK_VEHICLE: Vehicle = {
  id: 'mock-1', brand: 'Toyota', model: 'Land Cruiser', year: 2022, price: 45000000,
  type: 'sale', status: 'available', fuel: 'diesel', transmission: 'automatique',
  mileage: 25000, seats: 7, color: 'Blanc Nacré', location: 'Cotonou', featured: 1, viewCount: 120,
  images: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
  ],
  description: `Ce Toyota Land Cruiser 2022 est en excellent état. Importé directement du Japon, il n'a jamais été accidenté.`,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}



export function VehiculeDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
      if (error || !data) return MOCK_VEHICLE
      return dbToVehicle(data)
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-24 h-16 rounded-lg" />)}</div>
          </div>
          <div className="space-y-4"><Skeleton className="h-48 w-full rounded-xl" /></div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Véhicule introuvable.</p>
        <Link to="/catalogue"><Button className="mt-4 bg-primary text-white">Retour au catalogue</Button></Link>
      </div>
    )
  }

  const images = parseImages(vehicle.images as unknown as string | string[])
  if (images.length === 0) images.push(DEFAULT_CAR_IMAGE)
  const currentImage = images[currentImageIndex] || DEFAULT_CAR_IMAGE

  const waText = vehicle.type === 'sale'
    ? encodeURIComponent(`Bonjour First Class Auto,\n\nJe souhaite acheter ce véhicule :\n🚗 ${vehicle.brand} ${vehicle.model} ${vehicle.year}\n💰 Prix : ${formatPrice(vehicle.price)}\n⛽ Carburant : ${vehicle.fuel}\n⚙️ Transmission : ${vehicle.transmission}\n🛣️ Kilométrage : ${vehicle.mileage.toLocaleString('fr-FR')} km\n📍 Ville : ${vehicle.location}\n\nMerci de me recontacter.`)
    : encodeURIComponent(`Bonjour First Class Auto,\n\nJe souhaite louer ce véhicule :\n🚗 ${vehicle.brand} ${vehicle.model} ${vehicle.year}\n💰 Prix : ${formatPrice(vehicle.price)}\n⛽ Carburant : ${vehicle.fuel}\n⚙️ Transmission : ${vehicle.transmission}\n📍 Ville : ${vehicle.location}\n\nMerci de me recontacter.`)

  const specs = [
    { icon: Calendar, label: 'Année', value: vehicle.year },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuel },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Gauge, label: 'Kilométrage', value: `${vehicle.mileage.toLocaleString('fr-FR')} km` },
    { icon: Users, label: 'Places', value: vehicle.seats },
    { icon: Palette, label: 'Couleur', value: vehicle.color || 'N/A' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/50 border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/catalogue" className="text-muted-foreground hover:text-primary transition-colors">Catalogue</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{vehicle.brand} {vehicle.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-secondary">
              <img src={currentImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={`font-bold ${vehicle.type === 'sale' ? 'bg-primary text-white border-0' : 'bg-[#16181D] text-white border-0'}`}>
                  {vehicle.type === 'sale' ? 'À VENDRE' : 'À LOUER'}
                </Badge>
                {Number(vehicle.featured) > 0 && <Badge className="bg-accent text-accent-foreground border-0 font-bold">VEDETTE</Badge>}
              </div>
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)} className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-extrabold text-foreground">{vehicle.brand} {vehicle.model}</h1>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-muted-foreground text-sm">{vehicle.year}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm"><MapPin className="w-3.5 h-3.5" />{vehicle.location}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground text-sm">{vehicle.viewCount} vues</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-primary">{formatPrice(vehicle.price)}</p>
                  {vehicle.type === 'rental' && vehicle.pricePerDay && <p className="text-sm text-muted-foreground">{formatPrice(vehicle.pricePerDay)}/jour</p>}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="border-b border-border mb-4">
                <div className="flex gap-4">
                  <span className="pb-2 border-b-2 border-primary text-sm font-medium text-foreground">Description</span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line mb-6">
                {vehicle.description || 'Aucune description disponible pour ce véhicule.'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <spec.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-sm font-semibold text-foreground capitalize">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Prix</p>
              <p className="text-3xl font-extrabold text-primary">{formatPrice(vehicle.price)}</p>
              {vehicle.type === 'rental' && vehicle.pricePerDay && <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(vehicle.pricePerDay)}/jour</p>}
              <div className="mt-4 space-y-2.5">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#1ea852] transition-colors text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  {vehicle.type === 'sale' ? 'Acheter' : 'Louer'}
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: `${vehicle.brand} ${vehicle.model}`, url: window.location.href })
                    else { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !') }
                  }}
                  className="flex items-center justify-center gap-2 w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Partager cette annonce
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-sm text-foreground mb-3 uppercase tracking-wide">En bref</h4>
              <div className="space-y-2.5">
                {specs.slice(0, 4).map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><spec.icon className="w-3.5 h-3.5" />{spec.label}</span>
                    <span className="font-medium text-foreground capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-foreground/70 leading-relaxed">
                <span className="font-semibold text-primary">Conseil de sécurité :</span>{' '}
                Ne versez jamais d'argent avant d'avoir vu et inspecté le véhicule en personne.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

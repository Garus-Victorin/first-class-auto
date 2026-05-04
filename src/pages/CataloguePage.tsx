import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, Car } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@blinkdotnew/ui'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleCardSkeleton } from '@/components/vehicles/VehicleCardSkeleton'
import { api } from '@/blink/client'
import { dbToVehicle } from '@/lib/db'
import { BRANDS, FUEL_TYPES, TRANSMISSIONS } from '@/lib/utils'
import type { Vehicle } from '@/types'

interface CatalogueSearch {
  type?: string; brand?: string; minPrice?: string; maxPrice?: string
  fuel?: string; transmission?: string; sort?: string
}

function FilterPanel({ filters, onChange, onReset }: { filters: CatalogueSearch; onChange: (k: string, v: string) => void; onReset: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Type</h4>
        <div className="space-y-2">
          {[{ value: '', label: 'Tous les véhicules' }, { value: 'sale', label: 'À vendre' }, { value: 'rental', label: 'À louer' }].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="type" value={opt.value} checked={(filters.type || '') === opt.value} onChange={() => onChange('type', opt.value)} className="accent-primary w-4 h-4" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Marque</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.brand === brand} onChange={(e) => onChange('brand', e.target.checked ? brand : '')} className="accent-primary w-4 h-4 rounded" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Prix (FCFA)</h4>
        <div className="space-y-2">
          <input type="number" placeholder="Prix minimum" value={filters.minPrice || ''} onChange={(e) => onChange('minPrice', e.target.value)} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="number" placeholder="Prix maximum" value={filters.maxPrice || ''} onChange={(e) => onChange('maxPrice', e.target.value)} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Carburant</h4>
        <div className="space-y-2">
          {FUEL_TYPES.map((fuel) => (
            <label key={fuel} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.fuel === fuel} onChange={(e) => onChange('fuel', e.target.checked ? fuel : '')} className="accent-primary w-4 h-4 rounded" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors capitalize">{fuel}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Transmission</h4>
        <div className="space-y-2">
          {TRANSMISSIONS.map((tr) => (
            <label key={tr} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.transmission === tr} onChange={(e) => onChange('transmission', e.target.checked ? tr : '')} className="accent-primary w-4 h-4 rounded" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors capitalize">{tr}</span>
            </label>
          ))}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onReset} className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
        <X className="w-4 h-4 mr-1" /> Réinitialiser
      </Button>
    </div>
  )
}

export function CataloguePage() {
  const navigate = useNavigate()
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const [filters, setFilters] = useState<CatalogueSearch>({
    type: urlParams.get('type') || '', brand: urlParams.get('brand') || '',
    minPrice: urlParams.get('minPrice') || '', maxPrice: urlParams.get('maxPrice') || '',
    fuel: urlParams.get('fuel') || '', transmission: urlParams.get('transmission') || '',
    sort: urlParams.get('sort') || 'recent',
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const params: Record<string, string> = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    navigate({ to: '/catalogue', search: params as Record<string, string | undefined>, replace: true })
  }, [filters, navigate])

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['catalogue', filters],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' }
      if (filters.type) params.type = filters.type
      if (filters.brand) params.brand = filters.brand
      if (filters.fuel) params.fuel = filters.fuel
      if (filters.transmission) params.transmission = filters.transmission
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.sort) params.sort = filters.sort
      try {
        const res = await api.getVehicles(params)
        return res.data.map(dbToVehicle)
      } catch { return [] }
    },
  })

  function handleFilterChange(key: string, value: string) { setFilters((prev) => ({ ...prev, [key]: value })) }
  function handleReset() { setFilters({ type: '', brand: '', minPrice: '', maxPrice: '', fuel: '', transmission: '', sort: 'recent' }) }
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#16181D] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold">
            Catalogue{filters.type === 'rental' ? ' – Location' : filters.type === 'sale' ? ' – Vente' : ''}
          </h1>
          <p className="text-white/60 mt-1">Tous nos véhicules disponibles au Bénin</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground">Filtres</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>
              <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setMobileFiltersOpen(true)} className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres
                  {activeFilterCount > 0 && <span className="ml-1.5 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
                </Button>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{isLoading ? '…' : (vehicles?.length || 0)}</span> véhicule(s) trouvé(s)
                </p>
              </div>
              <select
                value={filters.sort || 'recent'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.type && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">{filters.type === 'sale' ? 'Vente' : 'Location'}<button onClick={() => handleFilterChange('type', '')}><X className="w-3 h-3" /></button></span>}
                {filters.brand && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">{filters.brand}<button onClick={() => handleFilterChange('brand', '')}><X className="w-3 h-3" /></button></span>}
                {filters.fuel && <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium capitalize">{filters.fuel}<button onClick={() => handleFilterChange('fuel', '')}><X className="w-3 h-3" /></button></span>}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-semibold">Aucun véhicule trouvé</p>
                <p className="text-muted-foreground text-sm mt-1">Essayez de modifier vos filtres.</p>
                <Button variant="outline" onClick={handleReset} className="mt-4">Réinitialiser les filtres</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Filtres</DialogTitle></DialogHeader>
          <FilterPanel filters={filters} onChange={handleFilterChange} onReset={() => { handleReset(); setMobileFiltersOpen(false) }} />
          <Button className="mt-4 w-full bg-primary text-white hover:bg-primary/90" onClick={() => setMobileFiltersOpen(false)}>
            Appliquer ({vehicles?.length || 0} résultats)
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Car, Key, Plus, Shield, Tag, MessageCircle, Truck, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@blinkdotnew/ui'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleCardSkeleton } from '@/components/vehicles/VehicleCardSkeleton'
import { api } from '@/blink/client'
import { dbToVehicle, dbToBlogPost } from '@/lib/db'
import { setPageSEO, PAGE_SEO } from '@/lib/seo'
import { useEffect } from 'react'
import type { Vehicle } from '@/types'

export function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    const s = PAGE_SEO.home
    setPageSEO(s.title, s.description, s.path)
  }, [])

  const { data: latestPosts = [] } = useQuery({
    queryKey: ['home-blog'],
    queryFn: async () => {
      try {
        const res = await api.getBlog({ limit: 3 })
        return res.data.map(dbToBlogPost)
      } catch { return [] }
    },
  })

  const { data: featuredVehicles, isLoading } = useQuery({
    queryKey: ['home-vehicles'],
    queryFn: async () => {
      try {
        const res = await api.getVehicles({ limit: 8 })
        return res.data.map(dbToVehicle)
      } catch { return [] }
    },
  })

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-[#16181D] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
            alt="Voiture premium"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#16181D] via-[#16181D]/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span>N°1 au Bénin</span>
            </div>
            <h1
              style={{ fontFamily: 'Syne, sans-serif' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
            >
              Trouvez le véhicule<br />
              de vos rêves{' '}
              <span className="text-primary">au Bénin</span>
            </h1>
            <p className="mt-5 text-white/70 text-lg leading-relaxed">
              Achetez, louez ou vendez votre voiture en toute confiance.
              Plus de 100 véhicules disponibles à Cotonou et partout au Bénin.
            </p>
            
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold text-foreground">
              Comment pouvons-nous vous aider ?
            </h2>
            <p className="text-muted-foreground mt-2">Choisissez ce qui correspond à votre besoin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate({ to: '/catalogue', search: { type: 'sale' } })}
              className="group relative rounded-2xl p-8 text-left overflow-hidden bg-primary text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold">Acheter</h3>
              <p className="text-white/80 text-sm mt-2">Trouvez la voiture idéale parmi notre catalogue</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                Voir les véhicules <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/catalogue', search: { type: 'rental' } })}
              className="group relative rounded-2xl p-8 text-left overflow-hidden bg-[#16181D] text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold">Louer</h3>
              <p className="text-white/70 text-sm mt-2">Location courte ou longue durée, avec chauffeur</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                Voir les locations <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/publier' })}
              className="group relative rounded-2xl p-8 text-left overflow-hidden bg-accent text-accent-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold">Vendre</h3>
              <p className="text-accent-foreground/70 text-sm mt-2">Publiez votre annonce gratuitement en 5 minutes</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                Publier une annonce <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED VEHICLES ────────────────────────────────── */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold text-foreground">
                Nos Véhicules
              </h2>
              <p className="text-muted-foreground mt-1">Découvrez notre sélection disponible</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/catalogue' })}
              className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-white"
            >
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <VehicleCardSkeleton key={i} />)
              : (featuredVehicles || []).map((v) => <VehicleCard key={v.id} vehicle={v} />)
            }
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate({ to: '/catalogue' })} className="border-primary text-primary hover:bg-primary hover:text-white">
              Voir tout le catalogue
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold text-foreground">
              Pourquoi choisir First Class Auto ?
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Nous vous accompagnons à chaque étape de votre projet automobile
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Sécurité garantie', desc: 'Chaque véhicule est vérifié par notre équipe avant publication', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Tag, title: 'Prix transparents', desc: 'Tous les prix sont affichés en FCFA, sans frais cachés', color: 'text-accent-foreground', bg: 'bg-accent/20' },
              { icon: MessageCircle, title: 'WhatsApp instant', desc: 'Contactez les vendeurs directement via WhatsApp 24h/24', color: 'text-[#25D366]', bg: 'bg-[#25D366]/10' },
              { icon: Truck, title: 'Livraison Bénin', desc: 'Service de livraison disponible dans tout le Bénin', color: 'text-primary', bg: 'bg-primary/10' },
            ].map((feature, i) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold text-foreground">
                  Derniers articles
                </h2>
                <p className="text-muted-foreground mt-1">Actualités et conseils auto</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/blog' })}
                className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-white"
              >
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate({ to: '/blog' })}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="aspect-video bg-secondary overflow-hidden">
                    {post.images.length > 0 ? (
                      <img src={post.images[0]} alt={post.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : post.videos?.length > 0 ? (
                      <video src={post.videos[0]} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h6" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-base line-clamp-2 mb-2">
                      {post.titre}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.contenu}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" onClick={() => navigate({ to: '/blog' })} className="border-primary text-primary hover:bg-primary hover:text-white">
                Voir tous les articles
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-16 bg-[#16181D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl sm:text-4xl font-bold text-white">
              Vendez votre voiture rapidement
            </h2>
            <p className="text-white/60 mt-4 text-lg">
              Publiez votre annonce gratuitement et touchez des milliers d'acheteurs potentiels au Bénin
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate({ to: '/publier' })} className="bg-primary text-white hover:bg-primary/90 font-bold text-base px-8">
                Publier une annonce
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate({ to: '/contact' })} className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8">
                Nous contacter
              </Button>
            </div>
            <p className="text-white/40 text-sm mt-4">Gratuit · Rapide · Validé sous 24h</p>
          </div>
        </div>
      </section>

      {/* ── PRICE RANGE TEASER ───────────────────────────────── */}
      <section className="py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-foreground mb-6">
            Trouvez dans votre budget
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Moins de 10M FCFA', range: { maxPrice: '10000000' } },
              { label: '10M – 30M FCFA', range: { minPrice: '10000000', maxPrice: '30000000' } },
              { label: '30M – 60M FCFA', range: { minPrice: '30000000', maxPrice: '60000000' } },
              { label: 'Plus de 60M FCFA', range: { minPrice: '60000000' } },
            ].map((budget) => (
              <button
                key={budget.label}
                onClick={() => navigate({ to: '/catalogue', search: budget.range })}
                className="p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-all duration-200 group"
              >
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{budget.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Voir les offres</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

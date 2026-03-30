import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/blink/client'
import { dbToBlogPost } from '@/lib/db'
import type { BlogPost } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Images */}
        {post.images.length > 0 && (
          <div className="relative aspect-video bg-secondary rounded-t-2xl overflow-hidden">
            <img src={post.images[imgIdx]} alt={post.titre} className="w-full h-full object-cover" />
            {post.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + post.images.length) % post.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % post.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold text-foreground leading-tight">
              {post.titre}
            </h2>
            <button onClick={onClose} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.publishedAt)}
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.contenu}</p>

          {/* Vidéos */}
          {post.videos.length > 0 && (
            <div className="mt-6 space-y-3">
              {post.videos.map((v, i) => (
                <video key={i} src={v} controls className="w-full rounded-xl bg-secondary" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BlogPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<BlogPost | null>(null)

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('published_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(dbToBlogPost)
    },
  })

  const filtered = posts.filter((p) =>
    p.titre.toLowerCase().includes(search.toLowerCase()) ||
    p.contenu.toLowerCase().includes(search.toLowerCase())
  )

  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#16181D] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Notre <span className="text-primary">Blog</span>
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Actualités, conseils et nouveautés de First Class Auto
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-secondary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="h-3 bg-secondary rounded" />
                  <div className="h-3 bg-secondary rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {posts.length === 0 ? 'Aucun article publié pour le moment.' : 'Aucun résultat pour cette recherche.'}
          </div>
        ) : (
          <>
            {/* Article vedette */}
            {featured && !search && (
              <div
                className="mb-10 rounded-2xl overflow-hidden border border-border bg-card cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setSelected(featured)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {featured.images.length > 0 ? (
                    <div className="aspect-video md:aspect-auto bg-secondary overflow-hidden">
                      <img src={featured.images[0]} alt={featured.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-video md:aspect-auto bg-secondary flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 w-fit">
                      À la une
                    </span>
                    <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-foreground mb-3 leading-tight">
                      {featured.titre}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 mb-4">
                      {featured.contenu}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featured.publishedAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grille */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search ? filtered : rest).map((post) => (
                <article
                  key={post.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  onClick={() => setSelected(post)}
                >
                  <div className="aspect-video bg-secondary overflow-hidden">
                    {post.images.length > 0 ? (
                      <img src={post.images[0]} alt={post.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📰</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-base line-clamp-2 mb-2">
                      {post.titre}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.contenu}</p>
                    {(post.videos.length > 0 || post.images.length > 1) && (
                      <div className="flex gap-2 mt-3">
                        {post.images.length > 1 && (
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {post.images.length} photos
                          </span>
                        )}
                        {post.videos.length > 0 && (
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {post.videos.length} vidéo{post.videos.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ThumbsUp, MessageCircle, Share2, Search, Send } from 'lucide-react'
import { api } from '@/blink/client'
import { dbToBlogPost } from '@/lib/db'
import { setPageSEO, PAGE_SEO } from '@/lib/seo'
import type { BlogPost } from '@/types'

// Session ID persistant pour identifier l'utilisateur anonyme
function getSessionId(): string {
  let id = localStorage.getItem('fca_session')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('fca_session', id) }
  return id
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MediaGallery({ images, videos }: { images: string[]; videos: string[] }) {
  const allMedia = [...images]

  if (videos.length > 0) {
    return (
      <div className="w-full bg-black">
        {videos.map((v, i) => (
          <video key={i} src={v} controls className="w-full max-h-[500px] object-contain" />
        ))}
        {images.length > 0 && (
          <div className={`grid gap-0.5 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {images.map((img, i) => (
              <img key={i} src={img} className="w-full aspect-square object-cover" />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (allMedia.length === 0) return null

  if (allMedia.length === 1) {
    return <img src={allMedia[0]} className="w-full max-h-[500px] object-cover" />
  }

  if (allMedia.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {allMedia.map((img, i) => <img key={i} src={img} className="w-full aspect-square object-cover" />)}
      </div>
    )
  }

  if (allMedia.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <img src={allMedia[0]} className="w-full row-span-2 aspect-square object-cover" style={{ gridRow: 'span 2' }} />
        <img src={allMedia[1]} className="w-full aspect-square object-cover" />
        <img src={allMedia[2]} className="w-full aspect-square object-cover" />
      </div>
    )
  }

  if (allMedia.length === 4) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {allMedia.map((img, i) => <img key={i} src={img} className="w-full aspect-square object-cover" />)}
      </div>
    )
  }

  // 5+
  return (
    <div className="grid grid-cols-2 gap-0.5">
      <img src={allMedia[0]} className="w-full aspect-square object-cover" />
      <img src={allMedia[1]} className="w-full aspect-square object-cover" />
      <img src={allMedia[2]} className="w-full aspect-square object-cover" />
      <div className="relative">
        <img src={allMedia[3]} className="w-full aspect-square object-cover" />
        {allMedia.length > 4 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">+{allMedia.length - 4}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CommentsSection({ postId, open }: { postId: string; open: boolean }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const data = await api.getComments(postId)
      return data as { id: string; author_name: string; content: string; created_at: string }[]
    },
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () => api.addComment({ post_id: postId, author_name: name.trim() || 'Anonyme', content: text.trim() }),
    onSuccess: () => { setText(''); qc.invalidateQueries({ queryKey: ['comments', postId] }) },
  })

  return (
    <div className="border-t border-border">
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Existing comments */}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                {c.author_name[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-secondary rounded-2xl px-3 py-2">
                <p className="text-xs font-semibold text-foreground">{c.author_name}</p>
                <p className="text-sm text-foreground/80 mt-0.5">{c.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(c.created_at)}</p>
              </div>
            </div>
          ))}

          {/* Input */}
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">?</div>
            <div className="flex-1 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom (optionnel)"
                className="w-full h-8 px-3 rounded-full bg-secondary text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) mutation.mutate() }}
                  placeholder="Écrire un commentaire…"
                  className="flex-1 h-9 px-3 rounded-full bg-secondary text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => text.trim() && mutation.mutate()}
                  disabled={!text.trim() || mutation.isPending}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const qc = useQueryClient()
  const sessionId = getSessionId()
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const isLong = post.contenu.length > 200

  const { data: stats } = useQuery({
    queryKey: ['post-stats', post.id],
    queryFn: () => api.getPostStats(post.id),
  })

  const { data: likeStatus } = useQuery({
    queryKey: ['like-status', post.id, sessionId],
    queryFn: () => api.getLikeStatus(post.id, sessionId),
  })

  const liked = likeStatus?.liked ?? false
  const likes = stats?.likes ?? 0
  const commentCount = stats?.comments ?? 0

  const likeMutation = useMutation({
    mutationFn: () => api.toggleLike(post.id, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-stats', post.id] })
      qc.invalidateQueries({ queryKey: ['like-status', post.id, sessionId] })
    },
  })

  function handleShare() {
    if (navigator.share) navigator.share({ title: post.titre, text: post.contenu })
    else navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">FCA</span>
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-sm leading-tight">
            First Class Auto
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)} · 🌍</p>
        </div>
      </div>

      {/* Text */}
      <div className="px-4 pb-3">
        {post.titre && (
          <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-base mb-1">{post.titre}</p>
        )}
        <p className="text-foreground text-sm leading-relaxed">
          {isLong && !expanded ? post.contenu.slice(0, 200) + '…' : post.contenu}
        </p>
        {isLong && (
          <button onClick={() => setExpanded((e) => !e)} className="text-primary text-sm font-medium mt-0.5">
            {expanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>

      {/* Media */}
      <MediaGallery images={post.images} videos={post.videos} />

      {/* Stats */}
      {(likes > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-1">
            {likes > 0 && (
              <>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs text-muted-foreground">{likes}</span>
              </>
            )}
          </div>
          {commentCount > 0 && (
            <button onClick={() => setShowComments(s => !s)} className="text-xs text-muted-foreground hover:underline">
              {commentCount} commentaire{commentCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-secondary ${liked ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-primary' : ''}`} />
          <span>J'aime</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Commenter</span>
        </button>
        <button onClick={handleShare} className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Partager</span>
        </button>
      </div>

      <CommentsSection postId={post.id} open={showComments} />
    </div>
  )
}

export function BlogPage() {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const s = PAGE_SEO.blog
    setPageSEO(s.title, s.description, s.path)
  }, [])

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-public'],
    queryFn: async () => {
      try {
        const res = await api.getBlog()
        return res.data.map(dbToBlogPost)
      } catch { return [] }
    },
  })

  const filtered = posts.filter((p) =>
    p.titre.toLowerCase().includes(search.toLowerCase()) ||
    p.contenu.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">FCA</span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-9 pl-9 pr-3 rounded-full bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-0 sm:px-4 py-4">
        {/* Page title card */}
        <div className="bg-card border border-border rounded-xl p-4 mb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold">FCA</span>
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground">First Class Auto</p>
            <p className="text-xs text-muted-foreground">Page · Automobile · Bénin</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary rounded w-1/3" />
                    <div className="h-2 bg-secondary rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-secondary rounded" />
                  <div className="h-3 bg-secondary rounded w-5/6" />
                </div>
                <div className="aspect-video bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
            {posts.length === 0 ? 'Aucune publication pour le moment.' : 'Aucun résultat.'}
          </div>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  LayoutDashboard, Car, FileText,
  Plus, Pencil, Trash2, Check, X, Eye, LogOut, Lock, Users,
  ImageIcon, VideoIcon, Search, ArrowUpRight, Newspaper, Store,
} from 'lucide-react'
import {
  Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle,
  DataTable, StatGroup, Stat, toast, Skeleton,
} from '@blinkdotnew/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { supabase } from '@/blink/client'
import { dbToVehicle, dbToListing, dbToBlogPost } from '@/lib/db'
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, LOCATIONS, formatPrice, parseImages, DEFAULT_CAR_IMAGE } from '@/lib/utils'
import type { Vehicle, Listing, BlogPost } from '@/types'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  password: string
  createdAt: string
}

// ──────────── Password Gate ────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw === 'admin123') {
      localStorage.setItem('fca_admin', 'true')
      onUnlock()
    } else {
      setError(true)
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-[#16181D] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold text-foreground">
            Administration
          </h1>
          <p className="text-muted-foreground text-sm mt-1">First Class Auto</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false) }}
              placeholder="••••••••"
              className={`w-full h-10 px-3 rounded-lg border ${error ? 'border-destructive' : 'border-input'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              autoFocus
            />
            {error && <p className="text-destructive text-xs mt-1">Mot de passe incorrect</p>}
          </div>
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 font-semibold">
            Accéder
          </Button>
        </form>
      </div>
    </div>
  )
}

// ──────────── Vehicle Form ─────────────────────────────────────────────────

interface VehicleFormData {
  brand: string; model: string; year: string; price: string
  pricePerDay: string; type: string; status: string; fuel: string
  transmission: string; mileage: string; seats: string; color: string
  location: string; description: string; images: string; videos: string; featured: string
}

const EMPTY_VF: VehicleFormData = {
  brand: '', model: '', year: String(new Date().getFullYear()),
  price: '', pricePerDay: '', type: 'sale', status: 'available',
  fuel: 'essence', transmission: 'automatique', mileage: '',
  seats: '5', color: '', location: 'Cotonou', description: '', images: '', videos: '', featured: '0',
}

const inputClass = "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
const selectClass = "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"

function VehicleForm({ initial, onSave, onCancel, loading }: {
  initial?: VehicleFormData
  onSave: (d: VehicleFormData) => void
  onCancel: () => void
  loading?: boolean
}) {
  const [d, setD] = useState<VehicleFormData>(initial || EMPTY_VF)
  const [uploading, setUploading] = useState(false)
  const set = (k: keyof VehicleFormData, v: string) => setD((p) => ({ ...p, [k]: v }))

  async function uploadFiles(files: File[], bucket: string, folder: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls = await uploadFiles(files, 'vehicles-images', 'photos')
    const existing = d.images ? d.images.split('\n').filter(Boolean) : []
    set('images', [...existing, ...urls].join('\n'))
    setUploading(false)
  }

  async function handleVideos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls = await uploadFiles(files, 'vehicles-videos', 'videos')
    const existing = d.videos ? d.videos.split('\n').filter(Boolean) : []
    set('videos', [...existing, ...urls].join('\n'))
    setUploading(false)
  }

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Marque *</label>
          <select value={d.brand} onChange={(e) => set('brand', e.target.value)} className={selectClass}>
            <option value="">Choisir</option>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Modèle *</label>
          <input value={d.model} onChange={(e) => set('model', e.target.value)} placeholder="Modèle" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Année</label>
          <input value={d.year} onChange={(e) => set('year', e.target.value)} type="number" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Type</label>
          <select value={d.type} onChange={(e) => set('type', e.target.value)} className={selectClass}>
            <option value="sale">Vente</option>
            <option value="rental">Location</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Statut</label>
          <select value={d.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
            <option value="available">Disponible</option>
            <option value="sold">Vendu</option>
            <option value="rented">Loué</option>
            <option value="reserved">Réservé</option>
          </select>
        </div>
      </div>
      <div>
        {d.type === 'sale' ? (
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Prix de vente (FCFA) *</label>
            <input value={d.price} onChange={(e) => set('price', e.target.value)} type="number" placeholder="ex: 15000000" className={inputClass} />
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Prix par jour (FCFA) *</label>
            <input value={d.pricePerDay} onChange={(e) => { set('pricePerDay', e.target.value); set('price', e.target.value) }} type="number" placeholder="ex: 50000" className={inputClass} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Carburant</label>
          <select value={d.fuel} onChange={(e) => set('fuel', e.target.value)} className={selectClass}>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Transmission</label>
          <select value={d.transmission} onChange={(e) => set('transmission', e.target.value)} className={selectClass}>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Kilométrage</label>
          <input value={d.mileage} onChange={(e) => set('mileage', e.target.value)} type="number" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Places</label>
          <input value={d.seats} onChange={(e) => set('seats', e.target.value)} type="number" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Couleur</label>
          <input value={d.color} onChange={(e) => set('color', e.target.value)} placeholder="Blanc" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Ville</label>
          <select value={d.location} onChange={(e) => set('location', e.target.value)} className={selectClass}>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Vedette</label>
        <select value={d.featured} onChange={(e) => set('featured', e.target.value)} className={selectClass}>
          <option value="0">Non</option>
          <option value="1">Oui</option>
        </select>
      </div>
      {/* Photos */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Photos</label>
        <label className={`flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-dashed border-input bg-background text-xs cursor-pointer hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'text-muted-foreground'}`}>
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>{uploading ? 'Upload en cours...' : d.images ? `${d.images.split('\n').filter(Boolean).length} photo(s)` : 'Sélectionner des photos'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </label>
        {d.images && (
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {d.images.split('\n').filter(Boolean).map((url, i) => (
              <div key={i} className="relative group aspect-square">
                <img src={url} className="w-full h-full object-cover rounded-lg" />
                <button type="button" onClick={() => { const imgs = d.images.split('\n').filter(Boolean); imgs.splice(i, 1); set('images', imgs.join('\n')) }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vidéos */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Vidéos <span className="text-muted-foreground font-normal">(optionnel)</span></label>
        <label className={`flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-dashed border-input bg-background text-xs cursor-pointer hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'text-muted-foreground'}`}>
          <VideoIcon className="w-4 h-4 shrink-0" />
          <span>{uploading ? 'Upload en cours...' : d.videos ? `${d.videos.split('\n').filter(Boolean).length} vidéo(s)` : 'Sélectionner des vidéos'}</span>
          <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideos} />
        </label>
        {d.videos && (
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {d.videos.split('\n').filter(Boolean).map((url, i) => (
              <div key={i} className="relative group">
                <video src={url} className="w-full h-20 object-cover rounded-lg bg-secondary" />
                <button type="button" onClick={() => { const vids = d.videos.split('\n').filter(Boolean); vids.splice(i, 1); set('videos', vids.join('\n')) }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
        <textarea
          value={d.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary/90"
          onClick={() => onSave(d)}
          disabled={loading || uploading || !d.brand || !d.model || (d.type === 'sale' ? !d.price : !d.pricePerDay)}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

// ──────────── Blog Tab ────────────────────────────────────────────────────

interface BlogFormData {
  titre: string
  contenu: string
  images: string
  videos: string
  publishedAt: string
}

const EMPTY_BF: BlogFormData = {
  titre: '', contenu: '', images: '', videos: '',
  publishedAt: new Date().toISOString().slice(0, 16),
}

function BlogForm({ initial, onSave, onCancel, loading }: {
  initial?: BlogFormData
  onSave: (d: BlogFormData) => void
  onCancel: () => void
  loading?: boolean
}) {
  const [d, setD] = useState<BlogFormData>(initial || EMPTY_BF)
  const [uploading, setUploading] = useState(false)
  const set = (k: keyof BlogFormData, v: string) => setD((p) => ({ ...p, [k]: v }))

  async function uploadFiles(files: File[], bucket: string, folder: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file)
      if (!error) urls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
    }
    return urls
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls = await uploadFiles(files, 'vehicles-images', 'blog')
    const existing = d.images ? d.images.split('\n').filter(Boolean) : []
    set('images', [...existing, ...urls].join('\n'))
    setUploading(false)
  }

  async function handleVideos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls = await uploadFiles(files, 'vehicles-videos', 'blog')
    const existing = d.videos ? d.videos.split('\n').filter(Boolean) : []
    set('videos', [...existing, ...urls].join('\n'))
    setUploading(false)
  }

  return (
    <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Titre *</label>
        <input value={d.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Titre de l'article" className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Contenu *</label>
        <textarea
          value={d.contenu}
          onChange={(e) => set('contenu', e.target.value)}
          rows={6}
          placeholder="Rédigez votre article..."
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Images <span className="text-muted-foreground font-normal">(optionnel)</span></label>
        <label className={`flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-dashed border-input bg-background text-xs cursor-pointer hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'text-muted-foreground'}`}>
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>{uploading ? 'Upload...' : d.images ? `${d.images.split('\n').filter(Boolean).length} image(s)` : 'Sélectionner des images'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </label>
        {d.images && (
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {d.images.split('\n').filter(Boolean).map((url, i) => (
              <div key={i} className="relative group aspect-square">
                <img src={url} className="w-full h-full object-cover rounded-lg" />
                <button type="button" onClick={() => { const imgs = d.images.split('\n').filter(Boolean); imgs.splice(i, 1); set('images', imgs.join('\n')) }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Vidéos <span className="text-muted-foreground font-normal">(optionnel)</span></label>
        <label className={`flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-dashed border-input bg-background text-xs cursor-pointer hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'text-muted-foreground'}`}>
          <VideoIcon className="w-4 h-4 shrink-0" />
          <span>{uploading ? 'Upload...' : d.videos ? `${d.videos.split('\n').filter(Boolean).length} vidéo(s)` : 'Sélectionner des vidéos'}</span>
          <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideos} />
        </label>
        {d.videos && (
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {d.videos.split('\n').filter(Boolean).map((url, i) => (
              <div key={i} className="relative group">
                <video src={url} className="w-full h-20 object-cover rounded-lg bg-secondary" />
                <button type="button" onClick={() => { const vids = d.videos.split('\n').filter(Boolean); vids.splice(i, 1); set('videos', vids.join('\n')) }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Date & heure de publication *</label>
        <input
          type="datetime-local"
          value={d.publishedAt}
          onChange={(e) => set('publishedAt', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary/90"
          onClick={() => onSave(d)}
          disabled={loading || uploading || !d.titre || !d.contenu || !d.publishedAt}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

function BlogTab({ posts, refetch }: { posts: BlogPost[]; refetch: () => void }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editPost, setEditPost] = useState<BlogPost | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async (d: BlogFormData) => {
      const imgs = d.images.split('\n').map((s) => s.trim()).filter(Boolean)
      const vids = d.videos.split('\n').map((s) => s.trim()).filter(Boolean)
      const { error } = await supabase.from('blog').insert({
        titre: d.titre, contenu: d.contenu,
        images: JSON.stringify(imgs), videos: JSON.stringify(vids),
        published_at: new Date(d.publishedAt).toISOString(),
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => { toast.success('Article publié !'); setAddOpen(false); refetch() },
    onError: (e: unknown) => toast.error('Erreur : ' + (e instanceof Error ? e.message : String(e))),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, d }: { id: string; d: BlogFormData }) => {
      const imgs = d.images.split('\n').map((s) => s.trim()).filter(Boolean)
      const vids = d.videos.split('\n').map((s) => s.trim()).filter(Boolean)
      const { error } = await supabase.from('blog').update({
        titre: d.titre, contenu: d.contenu,
        images: JSON.stringify(imgs), videos: JSON.stringify(vids),
        published_at: new Date(d.publishedAt).toISOString(),
      }).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => { toast.success('Article mis à jour !'); setEditPost(null); refetch() },
    onError: (e: unknown) => toast.error('Erreur : ' + (e instanceof Error ? e.message : String(e))),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Article supprimé'); setDeleteId(null); refetch() },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  function postToForm(p: BlogPost): BlogFormData {
    return {
      titre: p.titre, contenu: p.contenu,
      images: p.images.join('\n'), videos: p.videos.join('\n'),
      publishedAt: new Date(p.publishedAt).toISOString().slice(0, 16),
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground">
          {posts.length} article(s)
        </h3>
        <Button size="sm" onClick={() => setAddOpen(true)} className="bg-primary text-white hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Nouvel article
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Aucun article</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              {p.images.length > 0 && (
                <div className="aspect-video bg-secondary">
                  <img src={p.images[0]} alt={p.titre} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-sm line-clamp-2 mb-1">{p.titre}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(p.publishedAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                {p.images.length > 1 && (
                  <p className="text-xs text-muted-foreground mb-1">{p.images.length} images</p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{p.contenu}</p>
                {p.videos.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {p.videos.map((v, i) => (
                      <video key={i} src={v} className="w-full h-20 object-cover rounded-lg bg-secondary" controls />
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditPost(p)}
                    className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-border hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Modifier
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Nouvel article</DialogTitle></DialogHeader>
          <BlogForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setAddOpen(false)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Modifier l'article</DialogTitle></DialogHeader>
          {editPost && (
            <BlogForm
              initial={postToForm(editPost)}
              onSave={(d) => updateMutation.mutate({ id: editPost.id, d })}
              onCancel={() => setEditPost(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">Cet article sera supprimé définitivement.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Annuler</Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ──────────── Tabs ─────────────────────────────────────────────────────────

function DashboardTab({ vehicles, listings }: {
  vehicles: Vehicle[]; listings: Listing[]
}) {
  return (
    <div className="space-y-6">
      <StatGroup>
        <Stat label="Total Véhicules" value={String(vehicles.length)} icon={<Car />} />
        <Stat label="À Vendre" value={String(vehicles.filter((v) => v.type === 'sale').length)} />
        <Stat label="À Louer" value={String(vehicles.filter((v) => v.type === 'rental').length)} />
        <Stat label="Annonces en attente" value={String(listings.filter((l) => l.status === 'pending').length)} />
      </StatGroup>

      <div>
        <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground mb-3">
          Annonces récentes en attente
        </h3>
        {listings.filter((l) => l.status === 'pending').length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Aucune annonce en attente</div>
        ) : (
          <div className="space-y-3">
            {listings.filter((l) => l.status === 'pending').slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
                <div>
                  <p className="font-semibold text-foreground text-sm">{l.brand} {l.model} ({l.year})</p>
                  <p className="text-xs text-muted-foreground">{l.sellerName} · {l.sellerPhone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{formatPrice(l.price)}</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">En attente</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VehicleShowDialog({ vehicle, onEdit, onDelete, onClose }: {
  vehicle: Vehicle
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const imgs = parseImages(vehicle.images as unknown as string | string[])
  const [imgIdx, setImgIdx] = useState(0)
  const statusMap: Record<string, string> = { available: 'Disponible', sold: 'Vendu', rented: 'Loué', reserved: 'Réservé' }
  const statusColor: Record<string, string> = { available: 'bg-green-100 text-green-800', sold: 'bg-gray-100 text-gray-600', rented: 'bg-blue-100 text-blue-800', reserved: 'bg-yellow-100 text-yellow-800' }

  return (
    <div className="space-y-4">
      {/* Galerie */}
      {imgs.length > 0 && (
        <div className="space-y-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
            <img src={imgs[imgIdx]} alt="" className="w-full h-full object-cover" />
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {imgs.map((url, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}>
                  <img src={url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Infos */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {([
          ['Marque', vehicle.brand],
          ['Modèle', vehicle.model],
          ['Année', String(vehicle.year)],
          ['Prix', formatPrice(vehicle.price)],
          vehicle.pricePerDay ? ['Prix/jour', formatPrice(vehicle.pricePerDay)] : null,
          ['Type', vehicle.type === 'sale' ? 'Vente' : 'Location'],
          ['Statut', statusMap[vehicle.status] || vehicle.status],
          ['Carburant', vehicle.fuel],
          ['Transmission', vehicle.transmission],
          ['Kilométrage', `${Number(vehicle.mileage).toLocaleString('fr-FR')} km`],
          ['Places', String(vehicle.seats)],
          vehicle.color ? ['Couleur', vehicle.color] : null,
          ['Ville', vehicle.location],
          ['Vedette', vehicle.featured ? 'Oui' : 'Non'],
          ['Vues', String(vehicle.viewCount)],
        ] as ([string, string] | null)[]).filter(Boolean).map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {vehicle.description && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-foreground">{vehicle.description}</p>
        </div>
      )}

      {/* Badges statut */}
      <div className="flex gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vehicle.type === 'sale' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground'}`}>
          {vehicle.type === 'sale' ? 'Vente' : 'Location'}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[vehicle.status] || 'bg-gray-100 text-gray-600'}`}>
          {statusMap[vehicle.status] || vehicle.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onClose} className="flex-1">Fermer</Button>
        <Button onClick={() => { onClose(); onEdit() }} className="flex-1 bg-secondary text-foreground hover:bg-secondary/80">
          <Pencil className="w-3.5 h-3.5 mr-1" /> Modifier
        </Button>
        <Button onClick={() => { onClose(); onDelete() }} className="flex-1 bg-destructive text-white hover:bg-destructive/90">
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer
        </Button>
      </div>
    </div>
  )
}

function VehiclesTab({ vehicles, refetch }: { vehicles: Vehicle[]; refetch: () => void }) {
  const [addOpen, setAddOpen] = useState(false)
  const [showVehicle, setShowVehicle] = useState<Vehicle | null>(null)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

  const filtered = vehicles
    .filter((v) => {
      const q = search.toLowerCase()
      if (q && !`${v.brand} ${v.model}`.toLowerCase().includes(q)) return false
      if (filterType && v.type !== filterType) return false
      if (filterStatus && v.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'brand') return a.brand.localeCompare(b.brand)
      return 0
    })

  const createMutation = useMutation({
    mutationFn: async (d: VehicleFormData) => {
      const imgs = d.images.split('\n').map((s) => s.trim()).filter(Boolean)
      const vids = d.videos.split('\n').map((s) => s.trim()).filter(Boolean)
      const finalPrice = d.type === 'rental' ? Number(d.pricePerDay) : Number(d.price)
      const { error } = await supabase.from('vehicles').insert({
        brand: d.brand, model: d.model, year: Number(d.year),
        price: finalPrice,
        price_per_day: d.type === 'rental' ? finalPrice : (d.pricePerDay ? Number(d.pricePerDay) : null),
        type: d.type, status: d.status,
        fuel: d.fuel, transmission: d.transmission,
        mileage: Number(d.mileage), seats: Number(d.seats),
        color: d.color || null, location: d.location,
        description: d.description || null,
        images: JSON.stringify(imgs), videos: JSON.stringify(vids),
        featured: Number(d.featured), view_count: 0,
      })
      if (error) throw new Error(error.message + ' | ' + (error.details ?? '') + ' | code:' + error.code)
    },
    onSuccess: () => { toast.success('Véhicule ajouté !'); setAddOpen(false); refetch() },
    onError: (e: unknown) => toast.error('Erreur lors de l\'ajout : ' + (e instanceof Error ? e.message : String(e))),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, d }: { id: string; d: VehicleFormData }) => {
      const imgs = d.images.split('\n').map((s) => s.trim()).filter(Boolean)
      const vids = d.videos.split('\n').map((s) => s.trim()).filter(Boolean)
      const finalPrice = d.type === 'rental' ? Number(d.pricePerDay) : Number(d.price)
      const { error } = await supabase.from('vehicles').update({
        brand: d.brand, model: d.model, year: Number(d.year),
        price: finalPrice,
        price_per_day: d.type === 'rental' ? finalPrice : (d.pricePerDay ? Number(d.pricePerDay) : null),
        type: d.type, status: d.status,
        fuel: d.fuel, transmission: d.transmission,
        mileage: Number(d.mileage), seats: Number(d.seats),
        color: d.color || null, location: d.location,
        description: d.description || null,
        images: JSON.stringify(imgs), videos: JSON.stringify(vids),
        featured: Number(d.featured),
      }).eq('id', id)
      if (error) throw new Error(error.message + ' | ' + (error.details ?? '') + ' | code:' + error.code)
    },
    onSuccess: () => { toast.success('Véhicule mis à jour !'); setEditVehicle(null); refetch() },
    onError: (e: unknown) => toast.error('Erreur mise à jour : ' + (e instanceof Error ? e.message : String(e))),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Véhicule supprimé'); setDeleteId(null); refetch() },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  function vehicleToForm(v: Vehicle): VehicleFormData {
    const imgs = parseImages(v.images as unknown as string | string[])
    return {
      brand: v.brand, model: v.model, year: String(v.year),
      price: String(v.price), pricePerDay: v.pricePerDay ? String(v.pricePerDay) : (v.type === 'rental' ? String(v.price) : ''),
      type: v.type, status: v.status, fuel: v.fuel, transmission: v.transmission,
      mileage: String(v.mileage), seats: String(v.seats), color: v.color || '',
      location: v.location, description: v.description || '',
      images: imgs.join('\n'), videos: (v.videos ?? []).join('\n'), featured: String(v.featured),
    }
  }

  const statusMap: Record<string, string> = { available: 'Disponible', sold: 'Vendu', rented: 'Loué', reserved: 'Réservé' }
  const statusColor: Record<string, string> = { available: 'bg-green-100 text-green-800', sold: 'bg-gray-100 text-gray-600', rented: 'bg-blue-100 text-blue-800', reserved: 'bg-yellow-100 text-yellow-800' }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground">
          {filtered.length} / {vehicles.length} véhicule(s)
        </h3>
        <Button size="sm" onClick={() => setAddOpen(true)} className="bg-primary text-white hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Barre recherche + filtres */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher marque, modèle…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tous types</option>
          <option value="sale">Vente</option>
          <option value="rental">Location</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tous statuts</option>
          <option value="available">Disponible</option>
          <option value="sold">Vendu</option>
          <option value="rented">Loué</option>
          <option value="reserved">Réservé</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="date_desc">Plus récent</option>
          <option value="date_asc">Plus ancien</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="brand">Marque A→Z</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {vehicles.length === 0 ? 'Aucun véhicule' : 'Aucun résultat pour cette recherche'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => {
            const imgs = parseImages(v.images as unknown as string | string[])
            return (
              <div key={v.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] bg-secondary">
                  <img
                    src={imgs[0] || DEFAULT_CAR_IMAGE}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.type === 'sale' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground'}`}>
                      {v.type === 'sale' ? 'Vente' : 'Location'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[v.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusMap[v.status] || v.status}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-sm">{v.brand} {v.model}</p>
                  <p className="text-xs text-muted-foreground mb-2">{v.year} · {v.location}</p>
                  <p className="text-primary font-bold text-sm mb-3">{formatPrice(v.price)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowVehicle(v)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditVehicle(v)}
                      className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-border hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Modifier
                    </button>
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Show dialog */}
      <Dialog open={!!showVehicle} onOpenChange={(o) => !o && setShowVehicle(null)}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{showVehicle?.brand} {showVehicle?.model} ({showVehicle?.year})</DialogTitle>
          </DialogHeader>
          {showVehicle && (
            <VehicleShowDialog
              vehicle={showVehicle}
              onEdit={() => setEditVehicle(showVehicle)}
              onDelete={() => setDeleteId(showVehicle.id)}
              onClose={() => setShowVehicle(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Ajouter un véhicule</DialogTitle></DialogHeader>
          <VehicleForm
            onSave={(d) => createMutation.mutate(d)}
            onCancel={() => setAddOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editVehicle} onOpenChange={(o) => !o && setEditVehicle(null)}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Modifier le véhicule</DialogTitle></DialogHeader>
          {editVehicle && (
            <VehicleForm
              initial={vehicleToForm(editVehicle)}
              onSave={(d) => updateMutation.mutate({ id: editVehicle.id, d })}
              onCancel={() => setEditVehicle(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">Cette action est irréversible. Le véhicule sera supprimé définitivement.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Annuler</Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ListingsTab({ listings, refetch }: { listings: Listing[]; refetch: () => void }) {
  const [detailListing, setDetailListing] = useState<Listing | null>(null)

  // Debug: log pour voir ce qui arrive
  useEffect(() => {
    console.log('[ListingsTab] listings count:', listings.length, listings)
  }, [listings])

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('listings').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Statut mis à jour'); refetch() },
    onError: () => toast.error('Erreur'),
  })

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approuvée',  cls: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejetée',    cls: 'bg-red-100 text-red-800' },
  }

  return (
    <div className="space-y-4">
      <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground">
        {listings.length} annonce(s)
      </h3>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Aucune annonce</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => {
            const imgs = Array.isArray(l.images) ? l.images : []
            const cfg = statusConfig[l.status] ?? { label: l.status, cls: 'bg-gray-100 text-gray-600' }
            return (
              <div key={l.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-secondary">
                  <img
                    src={imgs[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                    alt={`${l.brand} ${l.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.type === 'sale' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground'}`}>
                      {l.type === 'sale' ? 'Vente' : 'Location'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-3">
                  <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground text-sm">{l.brand} {l.model} ({l.year})</p>
                  <p className="text-xs text-muted-foreground mb-1">{l.sellerName} · {l.sellerPhone}</p>
                  <p className="text-primary font-bold text-sm mb-3">{formatPrice(l.price)}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetailListing(l)}
                      className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border border-border hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Détail
                    </button>
                    {l.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: l.id, status: 'approved' })}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-green-200 hover:bg-green-50 text-green-600 transition-colors"
                          title="Approuver"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: l.id, status: 'rejected' })}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 transition-colors"
                          title="Rejeter"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detailListing} onOpenChange={(o) => !o && setDetailListing(null)}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Détail de l'annonce</DialogTitle></DialogHeader>
          {detailListing && (
            <div className="space-y-3 text-sm">
              {[
                ['Vendeur', detailListing.sellerName],
                ['Téléphone', detailListing.sellerPhone],
                ['Email', detailListing.sellerEmail || '—'],
                ['Véhicule', `${detailListing.brand} ${detailListing.model} ${detailListing.year}`],
                ['Prix', formatPrice(detailListing.price)],
                ['Type', detailListing.type === 'sale' ? 'Vente' : 'Location'],
                ['Carburant', detailListing.fuel],
                ['Km', `${Number(detailListing.mileage).toLocaleString('fr-FR')} km`],
                ['Ville', detailListing.location],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
              {detailListing.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-foreground">{detailListing.description}</p>
                </div>
              )}
              {detailListing.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    onClick={() => { updateMutation.mutate({ id: detailListing.id, status: 'approved' }); setDetailListing(null) }}>
                    <Check className="w-4 h-4 mr-1" /> Approuver
                  </Button>
                  <Button size="sm" className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => { updateMutation.mutate({ id: detailListing.id, status: 'rejected' }); setDetailListing(null) }}>
                    <X className="w-4 h-4 mr-1" /> Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BookingsTab({ bookings, refetch }: { bookings: Booking[]; refetch: () => void }) {
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Statut mis à jour'); refetch() },
    onError: () => toast.error('Erreur'),
  })

  const columns: ColumnDef<Booking>[] = [
    {
      id: 'customer',
      header: 'Client',
      cell: ({ row: { original: b } }) => (
        <div>
          <p className="font-semibold text-foreground text-sm">{b.userName}</p>
          <p className="text-xs text-muted-foreground">{b.userPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => (
        <Badge className="text-xs border-0 bg-secondary text-foreground">
          {getValue() === 'rental' ? 'Location' : 'Achat'}
        </Badge>
      ),
    },
    {
      id: 'dates',
      header: 'Dates',
      cell: ({ row: { original: b } }) => (
        <span className="text-xs text-muted-foreground">
          {b.startDate && b.endDate ? `${b.startDate} → ${b.endDate}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Montant',
      cell: ({ getValue }) => {
        const v = getValue()
        return v ? <span className="font-bold text-primary text-sm">{formatPrice(Number(v))}</span> : <span className="text-muted-foreground text-sm">—</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ getValue }) => {
        const s = getValue() as string
        const map: Record<string, [string, string]> = {
          pending: ['En attente', 'bg-yellow-100 text-yellow-800'],
          confirmed: ['Confirmée', 'bg-blue-100 text-blue-800'],
          completed: ['Terminée', 'bg-green-100 text-green-800'],
          cancelled: ['Annulée', 'bg-gray-100 text-gray-600'],
        }
        const [label, cls] = map[s] || [s, 'bg-gray-100 text-gray-600']
        return <Badge className={`text-xs border-0 ${cls}`}>{label}</Badge>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original: b } }) => (
        <div className="flex gap-1">
          {b.status === 'pending' && (
            <button
              onClick={() => updateMutation.mutate({ id: b.id, status: 'confirmed' })}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              Confirmer
            </button>
          )}
          {b.status === 'confirmed' && (
            <button
              onClick={() => updateMutation.mutate({ id: b.id, status: 'completed' })}
              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            >
              Terminer
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground">
        {bookings.length} réservation(s)
      </h3>
      <DataTable columns={columns} data={bookings} />
    </div>
  )
}

interface UserFormData {
  nom: string; prenom: string; email: string; password: string
}

const iClass = "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"

function UserForm({ form, setForm, onSave, onCancel, saving }: {
  form: UserFormData
  setForm: React.Dispatch<React.SetStateAction<UserFormData>>
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Prénom *</label>
          <input value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} placeholder="Jean" className={iClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Nom *</label>
          <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} placeholder="Dupont" className={iClass} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Email *</label>
        <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jean@email.com" className={iClass} />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Mot de passe *</label>
        <input type="text" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" className={iClass} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary/90"
          onClick={onSave}
          disabled={saving || !form.nom || !form.prenom || !form.email || !form.password}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}

function UsersTab({ users, refetch }: { users: User[]; refetch: () => void }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<UserFormData>({ nom: '', prenom: '', email: '', password: '' })

  function openAdd() { setForm({ nom: '', prenom: '', email: '', password: '' }); setAddOpen(true) }
  function openEdit(u: User) { setEditUser(u); setForm({ nom: u.nom, prenom: u.prenom, email: u.email, password: u.password }) }

  const iClass = "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const { error } = await supabase.from('users').insert({
        nom: data.nom, prenom: data.prenom, email: data.email, password: data.password,
      })
      if (error) throw error
    },
    onSuccess: () => { toast.success('Utilisateur ajouté !'); setAddOpen(false); refetch() },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserFormData }) => {
      const { error } = await supabase.from('users').update({
        nom: data.nom, prenom: data.prenom, email: data.email, password: data.password,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Utilisateur mis à jour !'); setEditUser(null); refetch() },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Utilisateur supprimé'); setDeleteId(null); refetch() },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      header: 'Nom complet',
      cell: ({ row: { original: u } }) => (
        <span className="font-semibold text-foreground text-sm">{u.prenom} {u.nom}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Inscription',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(getValue() as string).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original: u } }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-foreground">
          {users.length} utilisateur(s)
        </h3>
        <Button size="sm" onClick={openAdd} className="bg-primary text-white hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      <DataTable columns={columns} data={users} searchable searchColumn="email" />

      {/* Add */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Ajouter un utilisateur</DialogTitle></DialogHeader>
          <UserForm form={form} setForm={setForm} onSave={() => createMutation.mutate(form)} onCancel={() => setAddOpen(false)} saving={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle></DialogHeader>
          {editUser && <UserForm form={form} setForm={setForm} onSave={() => updateMutation.mutate({ id: editUser.id, data: form })} onCancel={() => setEditUser(null)} saving={updateMutation.isPending} />}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Annuler</Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RevenueTab({ bookings }: { bookings: Booking[] }) {
  const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed')
  const total = confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0)
  const pending = bookings.filter((b) => b.status === 'pending').length
  const completed = bookings.filter((b) => b.status === 'completed').length

  return (
    <div className="space-y-6">
      <StatGroup>
        <Stat label="Revenus confirmés" value={formatPrice(total)} />
        <Stat label="Réservations actives" value={String(confirmed.length)} />
        <Stat label="En attente" value={String(pending)} />
        <Stat label="Terminées" value={String(completed)} />
      </StatGroup>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground mb-4">
          Dernières transactions
        </h3>
        {confirmed.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Aucune transaction confirmée</p>
        ) : (
          <div className="space-y-3">
            {confirmed.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.userName}</p>
                  <p className="text-xs text-muted-foreground">{b.type === 'rental' ? 'Location' : 'Achat'} · {b.startDate || b.createdAt?.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{b.totalPrice ? formatPrice(b.totalPrice) : '—'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{b.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────── Main AdminPage ───────────────────────────────────────────────

type AdminTab = 'dashboard' | 'vehicles' | 'listings' | 'users' | 'blog'

const TABS: { id: AdminTab; label: string; Icon: typeof Car }[] = [
  { id: 'dashboard', label: 'Tableau de bord', Icon: LayoutDashboard },
  { id: 'vehicles', label: 'Véhicules', Icon: Car },
  { id: 'listings', label: 'Annonces', Icon: FileText },
  { id: 'users', label: 'Utilisateurs', Icon: Users },
  { id: 'blog', label: 'Blog', Icon: Newspaper },
]

export function AdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('fca_admin') === 'true')

  const activeTab = ((): AdminTab => {
    const path = location.pathname
    if (path.endsWith('/vehicles')) return 'vehicles'
    if (path.endsWith('/listings')) return 'listings'
    if (path.endsWith('/users')) return 'users'
    if (path.endsWith('/blog')) return 'blog'
    return 'dashboard'
  })()

  function goTo(tab: AdminTab) {
    const paths: Record<AdminTab, string> = {
      dashboard: '/admin',
      vehicles: '/admin/vehicles',
      listings: '/admin/listings',
      users: '/admin/users',
      blog: '/admin/blog',
    }
    navigate({ to: paths[tab] })
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: vehicles = [], isLoading: vLoading, refetch: refetchV } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false }).limit(200)
      if (error) throw new Error(error.message)
      return (data ?? []).map(dbToVehicle)
    },
    enabled: unlocked,
    retry: 1,
  })

  const { data: listings = [], isLoading: lLoading, refetch: refetchL } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(200)
      if (error) throw new Error(error.message)
      return (data ?? []).map(dbToListing)
    },
    enabled: unlocked,
    retry: 1,
  })

  const { data: posts = [], isLoading: bLoading, refetch: refetchB } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog').select('*').order('published_at', { ascending: false }).limit(200)
      if (error) throw new Error(error.message)
      return (data ?? []).map(dbToBlogPost)
    },
    enabled: unlocked,
  })

  const { data: users = [], isLoading: uLoading, refetch: refetchU } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(200)
      return (data ?? []).map((r) => ({
        id: r.id,
        nom: r.nom,
        prenom: r.prenom,
        email: r.email,
        password: r.password,
        createdAt: r.created_at,
      })) as User[]
    },
    enabled: unlocked,
  })

  const isLoading = (
    activeTab === 'dashboard' ? (vLoading || lLoading) :
    activeTab === 'vehicles'  ? vLoading :
    activeTab === 'listings'  ? lLoading :
    activeTab === 'users'     ? uLoading :
    activeTab === 'blog'      ? bLoading : false
  )

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-sm text-sidebar-foreground">
            <span className="text-primary">FCA</span> Admin
          </span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { goTo(id); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
        <button
                onClick={() => navigate({ to: '/' })}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
              >
                <Store className="w-4 h-4" />
                Voir la boutique
              </button>
      <div className="p-3 border-t border-sidebar-border space-y-1">
      
        <button
          onClick={() => { localStorage.removeItem('fca_user'); navigate({ to: '/login' }) }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-sidebar flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-sidebar flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-foreground" />
            </button>
            <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-xs">Admin</Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab vehicles={vehicles} listings={listings} />}
              {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} refetch={refetchV} />}
              {activeTab === 'listings' && <ListingsTab listings={listings} refetch={refetchL} />}
              {activeTab === 'users' && <UsersTab users={users} refetch={refetchU} />}
              {activeTab === 'blog' && <BlogTab posts={posts} refetch={refetchB} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

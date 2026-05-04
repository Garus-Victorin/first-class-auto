import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, ChevronRight, ChevronLeft, Car, MessageCircle, ImageIcon } from 'lucide-react'
import { Button, toast } from '@blinkdotnew/ui'
import { api, uploadFiles } from '@/blink/client'
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, LOCATIONS, formatPrice, WHATSAPP_NUMBER } from '@/lib/utils'

interface FormData {
  sellerName: string; sellerPhone: string; sellerEmail: string
  brand: string; model: string; year: string; type: 'sale' | 'rental'
  price: string; fuel: string; transmission: string; mileage: string
  color: string; location: string; description: string; images: string
}

const INITIAL: FormData = {
  sellerName: '', sellerPhone: '', sellerEmail: '',
  brand: '', model: '', year: String(new Date().getFullYear()),
  type: 'sale', price: '', fuel: 'essence', transmission: 'automatique',
  mileage: '', color: '', location: 'Cotonou', description: '', images: '[]',
}

const inputClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
const selectClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < current ? 'bg-primary text-white' : i === current ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-secondary text-muted-foreground'}`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-10 sm:w-20 transition-all ${i < current ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  )
}

export function PublierPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  function buildWhatsappMessage() {
    const type = data.type === 'sale' ? 'À vendre' : 'À louer'
    const price = data.price ? formatPrice(Number(data.price)) : 'N/A'
    const mileage = data.mileage ? `${Number(data.mileage).toLocaleString('fr-FR')} km` : 'N/A'
    return encodeURIComponent(
      `Bonjour First Class Auto,\n\nJe souhaite publier une annonce :\n` +
      `🚗 Véhicule : ${data.brand} ${data.model} ${data.year}\n` +
      `📋 Type : ${type}\n` +
      `💰 Prix : ${price}\n` +
      `⛽ Carburant : ${data.fuel}\n` +
      `⚙️ Transmission : ${data.transmission}\n` +
      `📍 Ville : ${data.location}\n` +
      `🛣️ Kilométrage : ${mileage}\n` +
      `👤 Vendeur : ${data.sellerName}\n` +
      `📞 Téléphone : ${data.sellerPhone}\n` +
      (data.description ? `📝 Description : ${data.description}\n` : '') +
      `\nMerci de valider mon annonce.`
    )
  }

  const mutation = useMutation({
    mutationFn: async () => {
      // Upload images sur Cloudinary d'abord
      let uploadedUrls: string[] = []
      if (imageFiles.length > 0) {
        setUploading(true)
        try {
          uploadedUrls = await uploadFiles(imageFiles)
        } finally {
          setUploading(false)
        }
      }
      await api.createListing({
        seller_name: data.sellerName,
        seller_phone: data.sellerPhone,
        seller_email: data.sellerEmail || null,
        brand: data.brand,
        model: data.model,
        year: Number(data.year),
        type: data.type,
        price: Number(data.price),
        fuel: data.fuel,
        transmission: data.transmission,
        mileage: Number(data.mileage),
        color: data.color || null,
        location: data.location,
        description: data.description || null,
        images: uploadedUrls,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Annonce soumise !', { description: 'Elle sera validée sous 24h.' })
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${buildWhatsappMessage()}`
      window.open(waUrl, '_blank')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      toast.error('Erreur', { description: msg })
    },
  })

  function set(key: keyof FormData, value: string) { setData((p) => ({ ...p, [key]: value })) }

  const steps = [
    { title: 'Vos coordonnées', subtitle: 'Comment vous contacter' },
    { title: 'Votre véhicule', subtitle: 'Détails techniques' },
    { title: 'Description', subtitle: 'Photos et description' },
    { title: 'Confirmation', subtitle: 'Vérifiez avant d\'envoyer' },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-foreground">Annonce soumise !</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Merci ! L'équipe First Class Auto va examiner votre annonce et la publier sous <strong>24 heures</strong>.
          </p>
          <div className="mt-6 space-y-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-[#1ea852] transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Suivre sur WhatsApp
            </a>
            <Button className="w-full bg-primary text-white hover:bg-primary/90" onClick={() => navigate({ to: '/catalogue' })}>Voir le catalogue</Button>
            <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setData(INITIAL); setStep(0) }}>Publier une autre annonce</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#16181D] text-white py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold">Publier une annonce</h1>
          </div>
          <p className="text-white/60 text-sm">Étape {step + 1} sur {steps.length} — {steps[step].title}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <StepIndicator current={step} total={steps.length} />

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold text-foreground mb-1">{steps[step].title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{steps[step].subtitle}</p>

          {step === 0 && (
            <div className="space-y-4">
              <FieldGroup label="Votre nom complet" required>
                <input value={data.sellerName} onChange={(e) => set('sellerName', e.target.value)} placeholder="Jean Dupont" className={inputClass} />
              </FieldGroup>
              <FieldGroup label="Numéro de téléphone" required>
                <input value={data.sellerPhone} onChange={(e) => set('sellerPhone', e.target.value)} placeholder="+229 67 00 00 00" type="tel" className={inputClass} />
              </FieldGroup>
              <FieldGroup label="Email (optionnel)">
                <input value={data.sellerEmail} onChange={(e) => set('sellerEmail', e.target.value)} placeholder="votre@email.com" type="email" className={inputClass} />
              </FieldGroup>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Marque" required>
                  <select value={data.brand} onChange={(e) => set('brand', e.target.value)} className={selectClass}>
                    <option value="">Choisir</option>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Modèle" required>
                  <input value={data.model} onChange={(e) => set('model', e.target.value)} placeholder="Corolla, Classe E..." className={inputClass} />
                </FieldGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Année" required>
                  <input value={data.year} onChange={(e) => set('year', e.target.value)} type="number" min="1990" max="2025" className={inputClass} />
                </FieldGroup>
                <FieldGroup label="Type d'annonce" required>
                  <select value={data.type} onChange={(e) => set('type', e.target.value as 'sale' | 'rental')} className={selectClass}>
                    <option value="sale">À vendre</option>
                    <option value="rental">À louer</option>
                  </select>
                </FieldGroup>
              </div>
              <FieldGroup label="Prix (FCFA)" required>
                <input value={data.price} onChange={(e) => set('price', e.target.value)} type="number" placeholder="ex: 15000000" className={inputClass} />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Carburant" required>
                  <select value={data.fuel} onChange={(e) => set('fuel', e.target.value)} className={selectClass}>
                    {FUEL_TYPES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Transmission" required>
                  <select value={data.transmission} onChange={(e) => set('transmission', e.target.value)} className={selectClass}>
                    {TRANSMISSIONS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </FieldGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Kilométrage" required>
                  <input value={data.mileage} onChange={(e) => set('mileage', e.target.value)} type="number" placeholder="ex: 45000" className={inputClass} />
                </FieldGroup>
                <FieldGroup label="Couleur">
                  <input value={data.color} onChange={(e) => set('color', e.target.value)} placeholder="Blanc, Noir..." className={inputClass} />
                </FieldGroup>
              </div>
              <FieldGroup label="Ville" required>
                <input list="locations-list" value={data.location} onChange={(e) => set('location', e.target.value)} placeholder="Cotonou, Porto-Novo..." className={inputClass} />
                <datalist id="locations-list">{LOCATIONS.map((l) => <option key={l} value={l} />)}</datalist>
              </FieldGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FieldGroup label="Description">
                <textarea value={data.description} onChange={(e) => set('description', e.target.value)} placeholder="Décrivez votre véhicule..." rows={6} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </FieldGroup>
              <FieldGroup label="Photos">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm font-medium">
                      {uploading ? 'Upload en cours...' : 'Cliquez pour sélectionner des photos'}
                    </span>
                    <span className="text-xs">JPG, PNG, WEBP — max 10 fichiers</span>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (!files.length) return
                    setImageFiles((prev) => [...prev, ...files])
                    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
                  }} />
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} className="w-full h-full object-cover rounded-lg" />
                        <button type="button" onClick={() => {
                          setImageFiles((prev) => prev.filter((_, j) => j !== i))
                          setImagePreviews((prev) => prev.filter((_, j) => j !== i))
                        }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
                <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground">Récapitulatif</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Vendeur', value: data.sellerName },
                    { label: 'Téléphone', value: data.sellerPhone },
                    { label: 'Email', value: data.sellerEmail || '—' },
                    { label: 'Véhicule', value: `${data.brand} ${data.model} ${data.year}` },
                    { label: 'Type', value: data.type === 'sale' ? 'À vendre' : 'À louer' },
                    { label: 'Prix', value: data.price ? formatPrice(Number(data.price)) : '—' },
                    { label: 'Carburant', value: data.fuel },
                    { label: 'Transmission', value: data.transmission },
                    { label: 'Kilométrage', value: data.mileage ? `${Number(data.mileage).toLocaleString('fr-FR')} km` : '—' },
                    { label: 'Ville', value: data.location },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-muted-foreground text-xs">{item.label}</p>
                      <p className="font-medium text-foreground capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground">En soumettant cette annonce, vous acceptez que l'équipe First Class Auto la vérifie et la publie dans les 24h.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
            </Button>
            {step < steps.length - 1 ? (
              <Button className="bg-primary text-white hover:bg-primary/90" onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && (!data.sellerName || !data.sellerPhone)) || (step === 1 && (!data.brand || !data.model || !data.price))}>
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-primary text-white hover:bg-primary/90 font-bold px-8" onClick={() => mutation.mutate()} disabled={mutation.isPending || uploading}>
                {uploading ? 'Upload images...' : mutation.isPending ? 'Envoi en cours...' : 'Soumettre l\'annonce'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

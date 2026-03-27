import { useState } from 'react'
import { MessageCircle, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button, toast } from '@blinkdotnew/ui'
import { WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/utils'

export function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function sendToWhatsApp() {
    const text = encodeURIComponent(
      `Bonjour First Class Auto,\n\n` +
      `👤 Nom : ${form.name}\n` +
      `📞 Téléphone : ${form.phone}\n` +
      (form.email ? `📧 Email : ${form.email}\n` : '') +
      `\n💬 Message :\n${form.message}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${text}`, '_blank')
    setSent(true)
    toast.success('Redirection WhatsApp !', { description: 'Votre message est prêt à envoyer.' })
  }

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const inputClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"

  const contactItems = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: WHATSAPP_NUMBER,
      href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`,
      color: 'text-[#25D366]',
      bg: 'bg-[#25D366]/10',
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: PHONE_NUMBER,
      href: `tel:${PHONE_NUMBER}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Cotonou, Bénin',
      href: undefined,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun – Sam : 8h – 19h',
      href: undefined,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative bg-[#16181D] py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-4xl font-extrabold text-white">
            Contactez-nous
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-foreground mb-6">
              Envoyez-nous un message
            </h2>

            {sent ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold text-foreground">
                  Message envoyé !
                </h3>
                <p className="text-muted-foreground mt-2">
                  Nous vous répondrons dans les plus brefs délais par téléphone ou WhatsApp.
                </p>
                <Button
                  className="mt-5 bg-primary text-white hover:bg-primary/90"
                  onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '' }) }}
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nom complet <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Votre nom"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+229 67 00 00 00"
                    type="tel"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email (optionnel)</label>
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="votre@email.com"
                    type="email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Votre message..."
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90 font-semibold"
                  onClick={() => sendToWhatsApp()}
                  disabled={!form.name || !form.phone || !form.message}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {'Envoyer le message'}
                </Button>
              </div>
            )}
          </div>

          {/* Contact info */}
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-foreground mb-6">
              Nos coordonnées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {contactItems.map((item) => (
                <div key={item.label} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={`text-sm font-semibold ${item.color} hover:underline`}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-5 mb-8">
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-foreground mb-1">
                Réponse instantanée sur WhatsApp
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Pour une réponse rapide, contactez-nous directement sur WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=Bonjour First Class Auto, j'ai une question.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1ea852] transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Ouvrir WhatsApp
              </a>
            </div>

            {/* Google Maps */}
            <a
              href="https://maps.app.goo.gl/119PuqM78Rmt6kZV6"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
            >
              <iframe
                title="First Class Auto - Localisation"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252643.37956282395!2d2.1231413!3d6.3680088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1024a9025d5e619b%3A0x822022abde78adcc!2sCotonou%2C%20B%C3%A9nin!5e0!3m2!1sfr!2s!4v1700000000000!5m2!1sfr!2s"
                width="100%"
                height="280"
                style={{ border: 0, display: 'block', pointerEvents: 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from '@tanstack/react-router'
import { Car, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'
import { WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/utils'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#16181D] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-lg">
                <span className="text-primary">FIRST</span>
                <span className="text-white"> CLASS AUTO</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Le premier marché automobile du Bénin. Achetez, louez ou vendez votre véhicule
              en toute confiance avec First Class Auto.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#1ea852] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Appeler
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/catalogue', label: 'Catalogue' },
                { to: '/publier', label: 'Publier une annonce' },
                { to: '/contact', label: 'Contact' },
                { to: '/admin', label: 'Administration' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif' }} className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{WHATSAPP_NUMBER}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{PHONE_NUMBER}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">Cotonou, Bénin</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">Lun–Sam : 8h–19h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {year} First Class Auto. Tous droits réservés.
          </p>
          <p className="text-white/40 text-xs">
            Le N°1 du marché automobile au Bénin
          </p>
        </div>
      </div>
    </footer>
  )
}

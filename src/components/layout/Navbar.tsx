import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Car, Menu, X } from 'lucide-react'
import { Button } from '@blinkdotnew/ui'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#16181D] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-lg tracking-tight">
              <span className="text-primary">FIRST</span>
              <span className="text-white"> CLASS AUTO</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors [&.active]:text-primary"
            >
              Accueil
            </Link>
            <Link
              to="/catalogue"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors [&.active]:text-primary"
            >
              Catalogue
            </Link>
            <Link
              to="/catalogue"
              search={{ type: 'rental' }}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Location
            </Link>
            <Link
              to="/contact"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors [&.active]:text-primary"
            >
              Contact
            </Link>
            <Link to="/publier">
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm"
              >
                Publier une annonce
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#16181D] border-t border-white/10 px-4 pb-4 space-y-1 animate-fade-in">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-white/80 hover:text-white text-sm font-medium border-b border-white/5"
          >
            Accueil
          </Link>
          <Link
            to="/catalogue"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-white/80 hover:text-white text-sm font-medium border-b border-white/5"
          >
            Catalogue
          </Link>
          <Link
            to="/catalogue"
            search={{ type: 'rental' }}
            onClick={() => setOpen(false)}
            className="block py-2.5 text-white/80 hover:text-white text-sm font-medium border-b border-white/5"
          >
            Location
          </Link>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-white/80 hover:text-white text-sm font-medium border-b border-white/5"
          >
            Contact
          </Link>
          <div className="pt-2">
            <Link to="/publier" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full bg-primary text-white hover:bg-primary/90 font-semibold">
                Publier une annonce
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

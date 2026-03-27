import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/blink/client'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!email) newErrors.email = 'Veuillez saisir votre adresse email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Adresse email invalide.'
    if (!password) newErrors.password = 'Veuillez saisir votre mot de passe.'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, nom, prenom')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()
    setLoading(false)

    if (error || !data) {
      setErrors({ global: 'Email ou mot de passe incorrect.' })
    } else {
      localStorage.setItem('fca_user', JSON.stringify(data))
      navigate({ to: '/admin' })
    }
  }

  return (
    <div className="min-h-screen bg-[#16181D] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">

        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-extrabold text-foreground">
            Connexion
          </h1>
          <p className="text-muted-foreground text-sm mt-1">First Class Auto — Administration</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
              placeholder="exemple@email.com"
              autoFocus
              className={`w-full h-11 px-4 rounded-lg border text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-primary'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
              className={`w-full h-11 px-4 rounded-lg border text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-primary'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>}
          </div>

          {errors.global && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">⚠ {errors.global}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

        </form>
      </div>
    </div>
  )
}

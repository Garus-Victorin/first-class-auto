const SITE = 'First Class Auto'
const BASE_URL = 'https://first-classauto.com'

export function setPageSEO(title: string, description: string, path = '/') {
  document.title = `${title} | ${SITE}`

  setMeta('description', description)
  setMeta('og:title', `${title} | ${SITE}`, true)
  setMeta('og:description', description, true)
  setMeta('og:url', `${BASE_URL}${path}`, true)
  setMeta('twitter:title', `${title} | ${SITE}`)
  setMeta('twitter:description', description)

  // Canonical
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `${BASE_URL}${path}`
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

export const PAGE_SEO = {
  home: {
    title: 'Achat, Vente & Location de Voitures au Bénin',
    description: 'First Class Auto — N°1 de l\'automobile au Bénin. Achetez, vendez ou louez votre voiture à Cotonou. Plus de 100 véhicules disponibles. Réponse rapide sur WhatsApp.',
    path: '/',
  },
  catalogue: {
    title: 'Catalogue Véhicules — Voitures à Vendre & Louer au Bénin',
    description: 'Parcourez notre catalogue de voitures à vendre et à louer au Bénin. Toyota, Mercedes, BMW, Hyundai et plus. Filtrez par marque, prix, carburant.',
    path: '/catalogue',
  },
  catalogueSale: {
    title: 'Voitures à Vendre au Bénin — Achat Auto Cotonou',
    description: 'Achetez votre voiture au Bénin. Large choix de véhicules d\'occasion et neufs à Cotonou, Porto-Novo. Prix transparents en FCFA.',
    path: '/catalogue?type=sale',
  },
  catalogueRental: {
    title: 'Location de Voitures à Cotonou — Bénin',
    description: 'Louez une voiture à Cotonou et partout au Bénin. Location courte et longue durée. Avec ou sans chauffeur. Réservation rapide sur WhatsApp.',
    path: '/catalogue?type=rental',
  },
  publier: {
    title: 'Publier une Annonce — Vendez Votre Voiture au Bénin',
    description: 'Publiez votre annonce automobile gratuitement sur First Class Auto. Touchez des milliers d\'acheteurs au Bénin. Validation sous 24h.',
    path: '/publier',
  },
  blog: {
    title: 'Blog Auto Bénin — Actualités & Conseils Automobile',
    description: 'Actualités, conseils et nouveautés de l\'automobile au Bénin. Suivez First Class Auto pour rester informé du marché auto béninois.',
    path: '/blog',
  },
  contact: {
    title: 'Contactez-Nous — First Class Auto Cotonou',
    description: 'Contactez First Class Auto à Cotonou. Disponible sur WhatsApp, téléphone et email. Réponse rapide 7j/7.',
    path: '/contact',
  },
}

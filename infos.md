# First Class Auto — Documentation

Plateforme de vente et location de véhicules au Bénin.

## Stack technique

- **React 18** + **TypeScript** + **Vite 7**
- **TanStack Router** — routing type-safe
- **TanStack Query** — fetching / cache
- **Blink SDK** (`@blinkdotnew/sdk`) — base de données cloud
- **Blink UI** (`@blinkdotnew/ui`) — composants UI
- **Tailwind CSS 3** + **Shadcn/ui**
- **Framer Motion** — animations
- **Lucide React** — icônes

## Structure du projet

```
src/
├── blink/client.ts          # Client Blink (DB + auth)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── vehicles/
│       ├── VehicleCard.tsx
│       └── VehicleCardSkeleton.tsx
├── lib/utils.ts             # Helpers, constantes (BRANDS, LOCATIONS…)
├── pages/
│   ├── HomePage.tsx         # Hero + recherche + véhicules vedettes
│   ├── CataloguePage.tsx    # Liste filtrée des véhicules
│   ├── VehiculeDetailPage.tsx # Fiche véhicule + réservation
│   ├── PublierPage.tsx      # Formulaire multi-étapes pour vendre
│   ├── ContactPage.tsx      # Formulaire de contact + carte
│   └── AdminPage.tsx        # Back-office (protégé par mot de passe)
├── types/index.ts           # Types Vehicle, Listing, Booking
├── App.tsx                  # Routeur TanStack
└── main.tsx                 # Point d'entrée React
```

## Routes

| URL | Page | Description |
|-----|------|-------------|
| `/` | HomePage | Accueil avec hero, recherche rapide, véhicules vedettes |
| `/catalogue` | CataloguePage | Catalogue filtrable (type, marque, prix, carburant…) |
| `/vehicule/:id` | VehiculeDetailPage | Détail + galerie + contact WhatsApp + réservation |
| `/publier` | PublierPage | Formulaire 4 étapes pour soumettre une annonce |
| `/contact` | ContactPage | Formulaire de contact + coordonnées + carte |
| `/admin` | AdminPage | Back-office (mot de passe : `admin123`) |

## Modèles de données (Blink DB)

### Vehicle
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique |
| brand / model / year | string / number | Marque, modèle, année |
| price | number | Prix en FCFA |
| pricePerDay | number? | Prix/jour (location) |
| type | `sale` \| `rental` | Vente ou location |
| status | `available` \| `sold` \| `rented` \| `reserved` | Disponibilité |
| fuel | string | Carburant |
| transmission | string | Boîte de vitesses |
| mileage / seats | number | Kilométrage / places |
| images | string (JSON) | Tableau d'URLs sérialisé |
| featured | number | 1 = véhicule vedette |
| location | string | Ville au Bénin |

### Listing (annonces soumises par les vendeurs)
Même champs véhicule + `sellerName`, `sellerPhone`, `sellerEmail`, `status: pending | approved | rejected`

### Booking (réservations)
`vehicleId`, `userName`, `userPhone`, `type: rental | purchase`, `startDate`, `endDate`, `totalPrice`, `status: pending | confirmed | completed | cancelled`

## Variables d'environnement

Fichier `.env.local` :
```
VITE_BLINK_PROJECT_ID=...
VITE_BLINK_PUBLISHABLE_KEY=...
```

## Commandes

```bash
# Démarrer en développement
npm run dev

# Build production
npm run build

# Linting complet (types + JS + CSS + variables CSS)
npm run lint
```

## Admin

Accès via `/admin` — mot de passe : **`admin123`**

Fonctionnalités :
- Tableau de bord (stats globales)
- Gestion des véhicules (CRUD complet)
- Modération des annonces (approuver / rejeter)
- Gestion des réservations (confirmer / terminer)
- Suivi des revenus

## Constantes utiles (`src/lib/utils.ts`)

- `BRANDS` — 15 marques disponibles
- `FUEL_TYPES` — essence, diesel, hybride, électrique
- `TRANSMISSIONS` — automatique, manuelle
- `LOCATIONS` — Cotonou, Porto-Novo, Parakou, Abomey-Calavi, Bohicon
- `WHATSAPP_NUMBER` / `PHONE_NUMBER` — numéro de contact
- `formatPrice(n)` — formate en FCFA
- `parseImages(v)` — parse le champ images (JSON string ou array)

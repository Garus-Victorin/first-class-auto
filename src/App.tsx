import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { CataloguePage } from './pages/CataloguePage'
import { VehiculeDetailPage } from './pages/VehiculeDetailPage'
import { PublierPage } from './pages/PublierPage'
import { ContactPage } from './pages/ContactPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'

function isLoggedIn() {
  return !!localStorage.getItem('fca_user')
}

async function requireAuth() {
  if (!isLoggedIn()) throw redirect({ to: '/login' })
}

async function redirectIfLoggedIn() {
  if (isLoggedIn()) throw redirect({ to: '/admin' })
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Outlet />
    </div>
  ),
})

// Public layout wrapper (Navbar + Footer)
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: () => (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  ),
})

// Routes
const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/',
  component: HomePage,
})

const catalogueRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/catalogue',
  component: CataloguePage,
  validateSearch: (search: Record<string, unknown>) => ({
    type: search.type as string | undefined,
    brand: search.brand as string | undefined,
    minPrice: search.minPrice as string | undefined,
    maxPrice: search.maxPrice as string | undefined,
    fuel: search.fuel as string | undefined,
    transmission: search.transmission as string | undefined,
    sort: search.sort as string | undefined,
  }),
})

const vehiculeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/vehicule/$id',
  component: VehiculeDetailPage,
})

const publierRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/publier',
  component: PublierPage,
})

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/contact',
  component: ContactPage,
})

// Admin (no Navbar/Footer) — protégé
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: requireAuth,
  component: AdminPage,
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
})

const adminVehiclesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/vehicles',
})

const adminListingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/listings',
})

const adminBookingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/bookings',
})

const adminRevenueRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/revenue',
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
})

// Login — redirige vers /admin si déjà connecté
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfLoggedIn,
  component: LoginPage,
})

// Build the route tree
const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    catalogueRoute,
    vehiculeRoute,
    publierRoute,
    contactRoute,
  ]),
  adminRoute.addChildren([
    adminDashboardRoute,
    adminVehiclesRoute,
    adminListingsRoute,
    adminBookingsRoute,
    adminRevenueRoute,
    adminUsersRoute,
  ]),
  loginRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}

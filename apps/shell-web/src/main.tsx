import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ItemDetailPage,
  ItemsPage,
  OverviewPage,
  ServerItemsPage,
  SettingsPage,
} from './pages'
import { Shell } from './shell'
import './index.css'

const root = createRootRoute({ component: Shell })
const routeTree = root.addChildren([
  createRoute({
    getParentRoute: () => root,
    path: '/',
    component: OverviewPage,
  }),
  createRoute({
    getParentRoute: () => root,
    path: '/items',
    component: ItemsPage,
  }),
  createRoute({
    getParentRoute: () => root,
    path: '/items/server',
    component: ServerItemsPage,
  }),
  createRoute({
    getParentRoute: () => root,
    path: '/items/$id',
    component: ItemDetailPage,
  }),
  createRoute({
    getParentRoute: () => root,
    path: '/settings',
    component: () => <SettingsPage title="General" />,
  }),
  createRoute({
    getParentRoute: () => root,
    path: '/settings/members',
    component: () => <SettingsPage title="Members" />,
  }),
])
const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

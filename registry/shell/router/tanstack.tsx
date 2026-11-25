'use client'

import type { LinkProps } from '@tanstack/react-router'
import { createLink, useNavigate, useRouterState } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { useCallback } from 'react'

export type ShellLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string
}

const NO_ACTIVE_PROPS = {}

function target(href: string) {
  const url = new URL(href, 'http://shell')
  return {
    to: url.pathname as LinkProps['to'],
    search: Object.fromEntries(url.searchParams) as never,
    hash: url.hash.slice(1),
  }
}

/**
 * TanStack marks a link current against the router's `location`, which names a pending
 * navigation's target while the old page still renders, and it writes `aria-current` /
 * `data-status` over the caller's. The anchor drops both and keeps the caller's `current`.
 */
function Anchor({
  current,
  'aria-current': _router,
  'data-status': _status,
  ...props
}: ComponentProps<'a'> & {
  current?: ComponentProps<'a'>['aria-current']
  'data-status'?: string
}) {
  return <a {...props} aria-current={current} />
}

const RouterLink = createLink(Anchor)

/** A link to an app path; `href` may carry a query and a hash. Only `aria-current` marks it current. */
export function ShellLink({
  href,
  'aria-current': current,
  ...props
}: ShellLinkProps) {
  // TanStack's anchor props reject an explicit `undefined`, which it ignores at runtime.
  return (
    <RouterLink
      {...target(href)}
      activeProps={NO_ACTIVE_PROPS}
      current={current}
      {...(props as object)}
    />
  )
}

/**
 * The current path, without the router's base path. It is the path of the page on screen:
 * `location` already names a pending navigation's target while the old page still renders,
 * so the rail and panel would switch before the page does; `resolvedLocation` moves with it.
 */
export function useShellPathname(): string {
  return useRouterState({
    select: (s) => (s.resolvedLocation ?? s.location).pathname,
  })
}

/** Navigates to an app path. */
export function useShellNavigate(): (href: string) => void {
  const navigate = useNavigate()
  return useCallback((href) => void navigate(target(href)), [navigate])
}

/** Whether a navigation is pending. */
export function useShellNavigating(): boolean {
  return useRouterState({ select: (s) => s.isLoading })
}

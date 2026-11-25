'use client'

import type { LinkProps } from '@tanstack/react-router'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { useCallback } from 'react'

export type ShellLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string
}

const EXACT = { exact: true }

function target(href: string) {
  const url = new URL(href, 'http://shell')
  return {
    to: url.pathname as LinkProps['to'],
    search: Object.fromEntries(url.searchParams) as never,
    hash: url.hash.slice(1),
  }
}

/** A link to an app path; `href` may carry a query and a hash. */
export function ShellLink({ href, ...props }: ShellLinkProps) {
  // TanStack's anchor props reject an explicit `undefined`, which it ignores at runtime.
  return <Link {...target(href)} activeOptions={EXACT} {...(props as object)} />
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

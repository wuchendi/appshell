import { describe, expect, it } from 'bun:test'
import { Link2 } from 'lucide-react'
import type { ShellSpace } from '@/shell/core/spaces'
import { isActivePath, railEntryFolds, spaceFor } from '@/shell/core/spaces'

const home: ShellSpace = {
  key: 'home',
  href: '/app',
  label: 'Home',
  icon: Link2,
  exact: true,
}
const links: ShellSpace = {
  key: 'links',
  href: '/app/links',
  label: 'Links',
  icon: Link2,
}
const stats: ShellSpace = {
  key: 'stats',
  href: '/app/stats',
  label: 'Stats',
  icon: Link2,
  match: ['/app/live'],
}
const spaces = [home, links, stats]

describe('isActivePath', () => {
  it('matches exact entries only on their own path', () => {
    expect(isActivePath('/app', home)).toBe(true)
    expect(isActivePath('/app/links', home)).toBe(false)
  })

  it('matches nested paths but not a shared prefix', () => {
    expect(isActivePath('/app/links/abc', links)).toBe(true)
    expect(isActivePath('/app/linksx', links)).toBe(false)
  })
})

describe('spaceFor', () => {
  it('finds the space, including extra prefixes', () => {
    expect(spaceFor(spaces, '/app/live')?.key).toBe('stats')
    expect(spaceFor(spaces, '/elsewhere')).toBeUndefined()
  })
})

describe('railEntryFolds', () => {
  it('folds only a space with a panel, on its own href', () => {
    expect(railEntryFolds('/app/links', links, true)).toBe(true)
  })

  it('navigates from a detail page back to the space', () => {
    expect(railEntryFolds('/app/links/42', links, true)).toBe(false)
    expect(railEntryFolds('/app/live', stats, true)).toBe(false)
  })

  it('never folds a space without a panel', () => {
    expect(railEntryFolds('/app', home, false)).toBe(false)
    expect(railEntryFolds('/app/links', links, false)).toBe(false)
  })
})

import { describe, expect, it } from 'bun:test'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { ShellPagerState } from '@/shell/collection/use-collection-page'
import { useCollectionPage } from '@/shell/collection/use-collection-page'

// biome-ignore lint/suspicious/noExplicitAny: React's act environment flag
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

type Seen = { rows: number[]; pager: ShellPagerState }

function Probe({
  rows,
  pageSize,
  seen,
}: {
  rows: number[]
  pageSize?: number
  seen: Seen
}) {
  Object.assign(seen, useCollectionPage(rows, pageSize ? { pageSize } : {}))
  return null
}

function mount(initial: number[], pageSize?: number) {
  const seen: Seen = { rows: [], pager: {} as ShellPagerState }
  const root = createRoot(document.createElement('div'))
  const render = (rows: number[]) =>
    act(() =>
      root.render(
        createElement(Probe, { rows, seen, ...(pageSize ? { pageSize } : {}) }),
      ),
    )
  render(initial)
  return { seen, render, unmount: () => act(() => root.unmount()) }
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('useCollectionPage', () => {
  it('starts on page 1 with 50 rows a page', () => {
    const { seen, unmount } = mount(range(120))
    expect(seen.pager).toMatchObject({ page: 1, pageSize: 50, total: 120 })
    expect(seen.rows).toHaveLength(50)
    unmount()
  })

  it('moves between pages and clamps past the end', () => {
    const { seen, unmount } = mount(range(120))
    act(() => seen.pager.onPageChange(3))
    expect(seen.rows).toEqual(range(120).slice(100))
    act(() => seen.pager.onPageChange(9))
    expect(seen.pager.page).toBe(3)
    unmount()
  })

  it('clamps when the rows shrink', () => {
    const { seen, render, unmount } = mount(range(120))
    act(() => seen.pager.onPageChange(3))
    render(range(30))
    expect(seen.pager.page).toBe(1)
    expect(seen.rows).toEqual(range(30))
    unmount()
  })

  it('restarts from page 1 on a new page size', () => {
    const { seen, unmount } = mount(range(120), 20)
    act(() => seen.pager.onPageChange(4))
    act(() => seen.pager.onPageSizeChange?.(100))
    expect(seen.pager).toMatchObject({ page: 1, pageSize: 100 })
    expect(seen.rows).toHaveLength(100)
    unmount()
  })
})

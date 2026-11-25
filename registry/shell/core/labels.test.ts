import { describe, expect, it } from 'bun:test'
import { formatLabel, shellLabelsEn, shellLabelsZh } from '@/shell/core/labels'

describe('labels', () => {
  it('ship the same keys in every language', () => {
    expect(Object.keys(shellLabelsZh).sort()).toEqual(
      Object.keys(shellLabelsEn).sort(),
    )
  })

  it('fill placeholders and keep unknown ones', () => {
    expect(formatLabel(shellLabelsEn.filterActive, { count: 3 })).toBe(
      'Filter · 3',
    )
    expect(formatLabel('{a} {b}', { a: 1 })).toBe('1 {b}')
  })
})

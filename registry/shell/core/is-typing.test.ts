import { describe, expect, it } from 'bun:test'
import { isBareKeyBlocked, isTypingTarget } from '@/shell/core/is-typing'

describe('isTypingTarget', () => {
  it('is true for fields and editable content', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true)
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true)
    const div = document.createElement('div')
    div.contentEditable = 'true'
    expect(isTypingTarget(div)).toBe(div.isContentEditable)
  })

  it('is false elsewhere', () => {
    expect(isTypingTarget(document.createElement('button'))).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})

describe('isBareKeyBlocked', () => {
  const inside = (html: string) => {
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    return host.querySelector('button')!
  }

  it('lets a bare key through on the page', () => {
    expect(
      isBareKeyBlocked({ isComposing: false, target: document.body }),
    ).toBe(false)
    expect(
      isBareKeyBlocked({
        isComposing: false,
        target: inside('<button></button>'),
      }),
    ).toBe(false)
  })

  it('blocks during IME composition and while typing', () => {
    expect(isBareKeyBlocked({ isComposing: true, target: document.body })).toBe(
      true,
    )
    const input = document.createElement('input')
    expect(isBareKeyBlocked({ isComposing: false, target: input })).toBe(true)
  })

  it('blocks inside a modal dialog or an alert dialog', () => {
    const modal = inside(
      '<div role="dialog" aria-modal="true"><button></button></div>',
    )
    expect(isBareKeyBlocked({ isComposing: false, target: modal })).toBe(true)
    const alert = inside('<div role="alertdialog"><button></button></div>')
    expect(isBareKeyBlocked({ isComposing: false, target: alert })).toBe(true)
  })

  it('does not block inside a non-modal dialog', () => {
    const plain = inside('<div role="dialog"><button></button></div>')
    expect(isBareKeyBlocked({ isComposing: false, target: plain })).toBe(false)
  })
})

import { describe, expect, it } from 'bun:test'
import {
  readShellPrefs,
  SHELL_PREFS_COOKIE,
  shellPrefsCookie,
} from '@/shell/core/prefs'

describe('shell prefs', () => {
  it('defaults to an open panel without a cookie', () => {
    expect(readShellPrefs('')).toEqual({ panelOpen: true })
    expect(readShellPrefs('theme=dark; other=1')).toEqual({ panelOpen: true })
  })

  it('reads the open state and the panel size among other cookies', () => {
    expect(readShellPrefs(`a=1; ${SHELL_PREFS_COOKIE}=0:22.5; b=2`)).toEqual({
      panelOpen: false,
      panelSize: 22.5,
    })
    expect(readShellPrefs(`${SHELL_PREFS_COOKIE}=1`)).toEqual({
      panelOpen: true,
    })
  })

  it("reads a URL-encoded value, as Next's cookies().toString() writes it", () => {
    expect(readShellPrefs(`${SHELL_PREFS_COOKIE}=0%3A30`)).toEqual({
      panelOpen: false,
      panelSize: 30,
    })
  })

  it("does not match a cookie whose name only ends with the shell's", () => {
    expect(readShellPrefs(`x${SHELL_PREFS_COOKIE}=0`)).toEqual({
      panelOpen: true,
    })
  })

  it('ignores malformed values', () => {
    expect(readShellPrefs(`${SHELL_PREFS_COOKIE}=yes:abc`)).toEqual({
      panelOpen: true,
    })
    expect(readShellPrefs(`${SHELL_PREFS_COOKIE}=0:0`)).toEqual({
      panelOpen: false,
    })
    expect(readShellPrefs(`${SHELL_PREFS_COOKIE}=1:100`)).toEqual({
      panelOpen: true,
    })
  })

  it('writes a cookie it reads back', () => {
    const cookie = shellPrefsCookie({ panelOpen: false, panelSize: 18.25 })
    expect(cookie).toStartWith(`${SHELL_PREFS_COOKIE}=0:18.25;`)
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('SameSite=Lax')
    expect(readShellPrefs(cookie.slice(0, cookie.indexOf(';')))).toEqual({
      panelOpen: false,
      panelSize: 18.25,
    })
    expect(shellPrefsCookie({ panelOpen: true })).toStartWith(
      `${SHELL_PREFS_COOKIE}=1;`,
    )
  })
})

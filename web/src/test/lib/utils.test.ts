import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('deduplicates conflicting tailwind classes', () => {
    const result = cn('px-4 px-8')
    expect(result).toBe('px-8')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'end')
    expect(result).toContain('base')
    expect(result).not.toContain('hidden')
    expect(result).toContain('end')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    const result = cn('foo', undefined, null)
    expect(result).toBe('foo')
  })
})

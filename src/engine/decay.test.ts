import { describe, expect, it } from 'vitest'
import { applyDecay, elapsedCleanDays } from './decay'

describe('risk decay', () => {
  it('applies one clean day at lambda 0.90', () => expect(applyDecay(60, 1)).toBe(54))
  it('applies multiple clean days exponentially', () => expect(applyDecay(60, 3)).toBe(43.74))
  it('never produces a negative score', () => expect(applyDecay(0, 365)).toBe(0))
  it('uses whole elapsed days', () => expect(applyDecay(50, 1.9)).toBe(45))
  it('keeps score unchanged for zero days', () => expect(applyDecay(48.567, 0)).toBe(48.57))
  it('calculates elapsed full days', () => {
    expect(elapsedCleanDays('2026-08-20T10:00:00.000Z', '2026-08-23T09:59:59.000Z')).toBe(2)
  })
  it('does not return negative elapsed days', () => {
    expect(elapsedCleanDays('2026-08-23T10:00:00.000Z', '2026-08-20T10:00:00.000Z')).toBe(0)
  })
})

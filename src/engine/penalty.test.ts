import { describe, expect, it } from 'vitest'
import { detectExpressions } from './detector'
import { calculatePenalty } from './penalty'

describe('penalty engine', () => {
  it('returns zero for a clean comment', () => {
    expect(calculatePenalty([]).points).toBe(0)
  })

  it('uses the configured base points', () => {
    const matches = detectExpressions('Sen adi herif').matches
    expect(calculatePenalty(matches).points).toBe(8)
  })

  it('uses highest severity as primary and bounded extras', () => {
    const matches = detectExpressions('defol aptal şerefsiz pislik').matches
    const penalty = calculatePenalty(matches)
    expect(penalty.primary?.id).toBe('serefsiz')
    expect(penalty.additionalPoints).toBe(4)
    expect(penalty.points).toBe(16)
  })

  it('does not escalate repeated copies of one term', () => {
    const matches = detectExpressions('aptal aptal aptal').matches
    expect(calculatePenalty(matches).points).toBe(7)
  })

  it('caps one-comment penalty at policy maximum', () => {
    const matches = detectExpressions('orospu piç şerefsiz gerizekalı aptal pislik defol salak').matches
    expect(calculatePenalty(matches).points).toBeLessThanOrEqual(25)
  })
})

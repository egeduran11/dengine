import { describe, expect, it } from 'vitest'
import { getRiskTier } from './policy'

describe('intervention policy boundaries', () => {
  it.each([
    [39, 'normal'],
    [40, 'warning'],
    [59, 'warning'],
    [60, 'cooldown'],
    [79, 'cooldown'],
    [80, 'comment_restriction'],
    [99, 'comment_restriction'],
    [100, 'interaction_restriction'],
  ] as const)('maps %i to %s', (score, expected) => {
    expect(getRiskTier(score).id).toBe(expected)
  })
})

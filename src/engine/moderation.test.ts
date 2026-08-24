import { describe, expect, it } from 'vitest'
import { applyModerationDecision, proposeModeration } from './moderation'

describe('pre-send transparency logic', () => {
  it('calculates a warning before applying any penalty', () => {
    const proposal = proposeModeration('Sen adi herif', 32)
    expect(proposal.requiresWarning).toBe(true)
    expect(proposal.currentRisk).toBe(32)
    expect(proposal.projectedRisk).toBe(40)
  })

  it('edit path applies no penalty and does not publish', () => {
    const result = applyModerationDecision(proposeModeration('Sen aptal', 20), 'edit')
    expect(result).toEqual({ appliedPenalty: false, published: false, newRisk: 20 })
  })

  it('confirmation path publishes and applies penalty', () => {
    const result = applyModerationDecision(proposeModeration('Sen adi herif', 32), 'confirm')
    expect(result).toEqual({ appliedPenalty: true, published: true, newRisk: 40 })
  })

  it('clean path publishes with unchanged risk', () => {
    const proposal = proposeModeration('Birlikte çözelim.', 32)
    expect(applyModerationDecision(proposal, 'publish-clean')).toEqual({
      appliedPenalty: false,
      published: true,
      newRisk: 32,
    })
  })

  it('rejects bypassing a required warning via clean path', () => {
    expect(() => applyModerationDecision(proposeModeration('Sen aptal', 0), 'publish-clean')).toThrow()
  })

  it('reports an exact threshold transition', () => {
    const proposal = proposeModeration('Sen adi herif', 32)
    expect(proposal.currentTier.id).toBe('normal')
    expect(proposal.projectedTier.id).toBe('warning')
    expect(proposal.crossesTier).toBe(true)
  })

  it('caps projected risk at 100', () => {
    expect(proposeModeration('orospu', 95).projectedRisk).toBe(100)
  })
})

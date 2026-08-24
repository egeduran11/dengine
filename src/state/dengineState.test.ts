import { describe, expect, it } from 'vitest'
import { proposeModeration } from '../engine'
import {
  applyElapsedDecay,
  confirmViolation,
  createInitialState,
  isRestrictionActive,
  publishCleanComment,
  resetDemoState,
  setDemoRisk,
  simulateCleanDays,
} from './dengineState'

const NOW = '2026-08-24T09:00:00.000Z'

describe('demo state', () => {
  it('starts with seeded content and zero risk', () => {
    const state = createInitialState(NOW)
    expect(state.risk).toBe(0)
    expect(state.posts).toHaveLength(3)
    expect(state.history).toHaveLength(0)
  })

  it('publishes a clean comment without risk history', () => {
    const state = createInitialState(NOW)
    const next = publishCleanComment(state, 'post-1', 'Katılıyorum.', NOW)
    expect(next.risk).toBe(0)
    expect(next.history).toHaveLength(0)
    expect(next.posts[0].comments.at(-1)?.text).toBe('Katılıyorum.')
  })

  it('records confirmed violation and posts the comment', () => {
    const state = createInitialState(NOW)
    const proposal = proposeModeration('Sen adi herif', state.risk)
    const next = confirmViolation(state, 'post-1', proposal, NOW)
    expect(next.risk).toBe(8)
    expect(next.history[0].type).toBe('violation')
    expect(next.history[0].metadata.confirmedByUser).toBe(true)
    expect(next.posts[0].comments.at(-1)?.text).toBe('Sen adi herif')
  })

  it('applies and records demo decay', () => {
    const state = setDemoRisk(createInitialState(NOW), 60, NOW)
    const next = simulateCleanDays(state, 1, NOW)
    expect(next.risk).toBe(54)
    expect(next.history[0].type).toBe('decay')
    expect(next.history[0].delta).toBe(-6)
  })

  it('applies elapsed real-day decay on load', () => {
    const state = setDemoRisk(createInitialState('2026-08-20T09:00:00.000Z'), 50, '2026-08-20T09:00:00.000Z')
    const next = applyElapsedDecay(state, '2026-08-22T09:00:00.000Z')
    expect(next.risk).toBe(40.5)
    expect(next.history[0].metadata.simulated).toBe(false)
  })

  it('activates high-tier temporary restriction in demo', () => {
    const next = setDemoRisk(createInitialState(NOW), 85, NOW)
    expect(isRestrictionActive(next, new Date(NOW).getTime())).toBe(true)
  })

  it('sets cooldown only after a confirmed violation', () => {
    const state = setDemoRisk(createInitialState(NOW), 59, NOW)
    const proposal = proposeModeration('Sen aptal', state.risk)
    const next = confirmViolation(state, 'post-1', proposal, NOW)
    expect(next.risk).toBe(66)
    expect(isRestrictionActive(next, new Date(NOW).getTime())).toBe(true)
  })

  it('reset restores seeded data, zero risk, and records reset', () => {
    const modified = setDemoRisk(createInitialState(NOW), 79, NOW)
    const reset = resetDemoState(modified, NOW)
    expect(reset.risk).toBe(0)
    expect(reset.posts).toHaveLength(3)
    expect(reset.history).toHaveLength(1)
    expect(reset.history[0].type).toBe('reset')
  })
})

import { POLICY } from '../config/policy'
import { cloneSeededPosts, DEMO_USER, type FeedPost } from '../data/seed'
import {
  applyDecay,
  applyModerationDecision,
  clampRisk,
  elapsedCleanDays,
  getRiskTier,
  roundRisk,
  type ModerationProposal,
} from '../engine'

export type RiskEventType = 'violation' | 'decay' | 'reset' | 'manual_demo_adjustment'

export interface RiskEvent {
  id: string
  timestamp: string
  type: RiskEventType
  reason: string
  previousRisk: number
  delta: number
  newRisk: number
  metadata: Record<string, string | number | boolean>
}

export interface DengineState {
  version: 1
  risk: number
  history: RiskEvent[]
  posts: FeedPost[]
  lastDecayBaseAt: string
  lastViolationAt: string | null
  restrictionUntil: string | null
}

let eventCounter = 0

function eventId(type: RiskEventType, timestamp: string): string {
  eventCounter += 1
  return `${type}-${new Date(timestamp).getTime()}-${eventCounter}`
}

export function createInitialState(nowIso = new Date().toISOString()): DengineState {
  return {
    version: 1,
    risk: 0,
    history: [],
    posts: cloneSeededPosts(),
    lastDecayBaseAt: nowIso,
    lastViolationAt: null,
    restrictionUntil: null,
  }
}

function addComment(posts: FeedPost[], postId: string, text: string, timestamp: string): FeedPost[] {
  return posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `comment-${new Date(timestamp).getTime()}-${post.comments.length}`,
              username: DEMO_USER.username,
              handle: DEMO_USER.handle,
              text,
              timestamp: 'şimdi',
              isDemoUser: true,
            },
          ],
        }
      : post,
  )
}

export function publishCleanComment(
  state: DengineState,
  postId: string,
  text: string,
  nowIso = new Date().toISOString(),
): DengineState {
  return {
    ...state,
    posts: addComment(state.posts, postId, text, nowIso),
  }
}

export function confirmViolation(
  state: DengineState,
  postId: string,
  proposal: ModerationProposal,
  nowIso = new Date().toISOString(),
): DengineState {
  const decision = applyModerationDecision(proposal, 'confirm')
  const tier = getRiskTier(decision.newRisk)
  const restrictionUntil =
    tier.restrictionSeconds > 0
      ? new Date(new Date(nowIso).getTime() + tier.restrictionSeconds * 1000).toISOString()
      : null
  const event: RiskEvent = {
    id: eventId('violation', nowIso),
    timestamp: nowIso,
    type: 'violation',
    reason: `${proposal.penalty.primary?.category ?? 'İhlal'} — Seviye ${proposal.penalty.primary?.severity ?? 1}`,
    previousRisk: state.risk,
    delta: roundRisk(decision.newRisk - state.risk),
    newRisk: decision.newRisk,
    metadata: {
      confirmedByUser: true,
      detectedCount: proposal.detection.matches.length,
      primaryCategory: proposal.penalty.primary?.category ?? 'Bilinmiyor',
      severity: proposal.penalty.primary?.severity ?? 1,
      policyPoints: proposal.penalty.points,
    },
  }

  return {
    ...state,
    risk: decision.newRisk,
    posts: addComment(state.posts, postId, proposal.text, nowIso),
    history: [event, ...state.history],
    lastDecayBaseAt: nowIso,
    lastViolationAt: nowIso,
    restrictionUntil,
  }
}

export function simulateCleanDays(
  state: DengineState,
  cleanDays: number,
  nowIso = new Date().toISOString(),
): DengineState {
  const days = Math.max(0, Math.floor(cleanDays))
  if (days === 0 || state.risk === 0) {
    return { ...state, restrictionUntil: null, lastDecayBaseAt: nowIso }
  }

  const newRisk = applyDecay(state.risk, days)
  const delta = roundRisk(newRisk - state.risk)
  const event: RiskEvent = {
    id: eventId('decay', nowIso),
    timestamp: nowIso,
    type: 'decay',
    reason: `${days} günlük ihlalsiz kullanım`,
    previousRisk: state.risk,
    delta,
    newRisk,
    metadata: {
      cleanDays: days,
      lambda: POLICY.cleanDayLambda,
      simulated: true,
    },
  }

  return {
    ...state,
    risk: newRisk,
    history: [event, ...state.history],
    lastDecayBaseAt: nowIso,
    restrictionUntil: null,
  }
}

export function applyElapsedDecay(state: DengineState, nowIso = new Date().toISOString()): DengineState {
  const days = elapsedCleanDays(state.lastDecayBaseAt, nowIso)
  if (days < 1 || state.risk <= 0) return state
  const decayed = simulateCleanDays(state, days, nowIso)
  const [event, ...rest] = decayed.history
  return {
    ...decayed,
    history: [{ ...event, metadata: { ...event.metadata, simulated: false } }, ...rest],
  }
}

export function setDemoRisk(
  state: DengineState,
  requestedRisk: number,
  nowIso = new Date().toISOString(),
): DengineState {
  const newRisk = clampRisk(requestedRisk)
  const tier = getRiskTier(newRisk)
  const restrictionUntil =
    tier.id === 'comment_restriction' || tier.id === 'interaction_restriction'
      ? new Date(new Date(nowIso).getTime() + tier.restrictionSeconds * 1000).toISOString()
      : null
  const event: RiskEvent = {
    id: eventId('manual_demo_adjustment', nowIso),
    timestamp: nowIso,
    type: 'manual_demo_adjustment',
    reason: `Demo seviyesi: ${tier.label}`,
    previousRisk: state.risk,
    delta: roundRisk(newRisk - state.risk),
    newRisk,
    metadata: { demoOnly: true, requestedRisk },
  }

  return {
    ...state,
    risk: newRisk,
    history: [event, ...state.history],
    restrictionUntil,
    lastDecayBaseAt: nowIso,
  }
}

export function clearDemoRestriction(state: DengineState): DengineState {
  return { ...state, restrictionUntil: null }
}

export function resetDemoState(state: DengineState, nowIso = new Date().toISOString()): DengineState {
  const initial = createInitialState(nowIso)
  const resetEvent: RiskEvent = {
    id: eventId('reset', nowIso),
    timestamp: nowIso,
    type: 'reset',
    reason: 'Demo başlangıç durumuna döndürüldü',
    previousRisk: state.risk,
    delta: roundRisk(-state.risk),
    newRisk: 0,
    metadata: { demoOnly: true },
  }
  return { ...initial, history: [resetEvent] }
}

export function isRestrictionActive(state: DengineState, now = Date.now()): boolean {
  return state.restrictionUntil !== null && new Date(state.restrictionUntil).getTime() > now
}

export function restrictionSecondsRemaining(state: DengineState, now = Date.now()): number {
  if (!state.restrictionUntil) return 0
  return Math.max(0, Math.ceil((new Date(state.restrictionUntil).getTime() - now) / 1000))
}

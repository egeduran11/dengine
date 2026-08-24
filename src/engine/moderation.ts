import { detectExpressions } from './detector'
import { calculatePenalty } from './penalty'
import { getRiskTier } from './policy'
import { addRisk } from './risk'
import type { ModerationProposal } from './types'

export type ModerationDecision = 'edit' | 'confirm' | 'publish-clean'

export interface DecisionResult {
  appliedPenalty: boolean
  published: boolean
  newRisk: number
}

export function proposeModeration(text: string, currentRisk: number): ModerationProposal {
  const detection = detectExpressions(text)
  const penalty = calculatePenalty(detection.matches)
  const projectedRisk = addRisk(currentRisk, penalty.points)
  const currentTier = getRiskTier(currentRisk)
  const projectedTier = getRiskTier(projectedRisk)

  return {
    text,
    detection,
    penalty,
    requiresWarning: penalty.points > 0,
    currentRisk,
    projectedRisk,
    currentTier,
    projectedTier,
    crossesTier: currentTier.id !== projectedTier.id,
  }
}

export function applyModerationDecision(
  proposal: ModerationProposal,
  decision: ModerationDecision,
): DecisionResult {
  if (decision === 'edit') {
    return { appliedPenalty: false, published: false, newRisk: proposal.currentRisk }
  }

  if (decision === 'publish-clean' && proposal.requiresWarning) {
    throw new Error('Uyarı gerektiren yorum temiz yorum yolu ile yayınlanamaz.')
  }

  if (decision === 'confirm' && !proposal.requiresWarning) {
    return { appliedPenalty: false, published: true, newRisk: proposal.currentRisk }
  }

  return {
    appliedPenalty: decision === 'confirm' && proposal.requiresWarning,
    published: true,
    newRisk: decision === 'confirm' ? proposal.projectedRisk : proposal.currentRisk,
  }
}

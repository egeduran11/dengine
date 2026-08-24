import { POLICY } from '../config/policy'
import type { DetectionMatch, PenaltyProposal } from './types'

export function calculatePenalty(matches: readonly DetectionMatch[]): PenaltyProposal {
  if (matches.length === 0) {
    return {
      points: 0,
      primary: null,
      additionalDistinctCount: 0,
      additionalPoints: 0,
      explanation: 'İhlal tespit edilmedi; risk puanı değişmez.',
    }
  }

  const sorted = [...matches].sort((left, right) => right.severity - left.severity || right.points - left.points)
  const primary = sorted[0]
  const additionalDistinctCount = Math.max(0, sorted.length - 1)
  const additionalPoints = Math.min(
    additionalDistinctCount * POLICY.additionalDistinctViolationPoints,
    POLICY.maxAdditionalViolationPoints,
  )
  const points = Math.min(primary.points + additionalPoints, POLICY.maxPenaltyPerComment)

  return {
    points,
    primary,
    additionalDistinctCount,
    additionalPoints,
    explanation:
      additionalPoints > 0
        ? `${primary.category} temel puanı ${primary.points}; ${additionalDistinctCount} ek farklı ihlal için +${additionalPoints} (sınırlı).`
        : `${primary.category} için yapılandırılmış temel puan ${primary.points}.`,
  }
}

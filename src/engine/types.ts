export type SeverityLevel = 1 | 2 | 3 | 4

export interface LexiconEntry {
  id: string
  canonical: string
  severity: SeverityLevel
  points: number
  category: string
  explanation: string
}

export interface DetectionMatch extends LexiconEntry {
  rawFragment: string
  normalizedFragment: string
}

export interface DetectionResult {
  input: string
  normalizedText: string
  matches: DetectionMatch[]
}

export interface PenaltyProposal {
  points: number
  primary: DetectionMatch | null
  additionalDistinctCount: number
  additionalPoints: number
  explanation: string
}

export type RiskTierId = 'normal' | 'warning' | 'cooldown' | 'comment_restriction' | 'interaction_restriction'

export interface RiskTier {
  id: RiskTierId
  label: string
  min: number
  max: number
  explanation: string
  recovery: string
  restrictionSeconds: number
}

export interface ModerationProposal {
  text: string
  detection: DetectionResult
  penalty: PenaltyProposal
  requiresWarning: boolean
  currentRisk: number
  projectedRisk: number
  currentTier: RiskTier
  projectedTier: RiskTier
  crossesTier: boolean
}

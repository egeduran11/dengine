import { POLICY } from '../config/policy'
import type { RiskTier } from './types'

export function getRiskTier(risk: number): RiskTier {
  const clamped = Math.min(POLICY.riskMax, Math.max(POLICY.riskMin, risk))
  return POLICY.tiers.find((tier) => clamped >= tier.min && clamped <= tier.max) ?? POLICY.tiers[0]
}

export function getNextTier(risk: number): RiskTier | null {
  const current = getRiskTier(risk)
  const index = POLICY.tiers.findIndex((tier) => tier.id === current.id)
  return POLICY.tiers[index + 1] ?? null
}

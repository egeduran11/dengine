import { POLICY } from '../config/policy'
import { clampRisk } from './risk'

export function roundRisk(value: number): number {
  return Math.round(value * 100) / 100
}

export function applyDecay(currentRisk: number, cleanDays: number, lambda = POLICY.cleanDayLambda): number {
  if (cleanDays <= 0) return roundRisk(clampRisk(currentRisk))
  const decayed = clampRisk(currentRisk) * Math.pow(lambda, Math.floor(cleanDays))
  return roundRisk(clampRisk(decayed))
}

export function elapsedCleanDays(fromIso: string, toIso: string): number {
  const elapsed = new Date(toIso).getTime() - new Date(fromIso).getTime()
  return Math.max(0, Math.floor(elapsed / 86_400_000))
}

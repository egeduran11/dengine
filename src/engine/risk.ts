import { POLICY } from '../config/policy'

export function clampRisk(value: number): number {
  return Math.min(POLICY.riskMax, Math.max(POLICY.riskMin, value))
}

export function addRisk(currentRisk: number, penalty: number): number {
  return clampRisk(currentRisk + Math.max(0, penalty))
}

export function subtractRisk(currentRisk: number, amount: number): number {
  return clampRisk(currentRisk - Math.max(0, amount))
}

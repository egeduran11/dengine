import { describe, expect, it } from 'vitest'
import { addRisk, clampRisk, subtractRisk } from './risk'

describe('risk engine', () => {
  it('adds confirmed penalty', () => expect(addRisk(32, 8)).toBe(40))
  it('caps risk at 100', () => expect(addRisk(96, 20)).toBe(100))
  it('clamps below zero', () => expect(clampRisk(-12)).toBe(0))
  it('clamps above 100', () => expect(clampRisk(111)).toBe(100))
  it('ignores negative penalty input', () => expect(addRisk(20, -10)).toBe(20))
  it('subtracts without falling below zero', () => expect(subtractRisk(3, 8)).toBe(0))
})

import { applyElapsedDecay, createInitialState, type DengineState } from './dengineState'

export const STORAGE_KEY = 'dengine.prototype.state.v1'

export function loadState(): DengineState {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) return createInitialState()
    const parsed = JSON.parse(serialized) as Partial<DengineState>
    if (parsed.version !== 1 || typeof parsed.risk !== 'number' || !Array.isArray(parsed.posts)) {
      return createInitialState()
    }
    return applyElapsedDecay(parsed as DengineState)
  } catch {
    return createInitialState()
  }
}

export function saveState(state: DengineState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

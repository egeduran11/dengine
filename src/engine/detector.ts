import { LEXICON } from '../config/lexicon'
import { normalizeText, prepareForMatching } from './normalization'
import type { DetectionMatch, DetectionResult, LexiconEntry } from './types'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildExpressionPattern(entry: LexiconEntry): RegExp {
  const characters = [...prepareForMatching(entry.canonical)].filter((character) => /[\p{L}\p{N}]/u.test(character))
  const optionalSeparators = '(?:[^\\p{L}\\p{N}]{0,3})'
  const body = characters.map((character) => `${escapeRegExp(character)}+`).join(optionalSeparators)

  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'iu')
}

const COMPILED_LEXICON = LEXICON.map((entry) => ({
  entry,
  pattern: buildExpressionPattern(entry),
}))

export function detectExpressions(input: string): DetectionResult {
  const prepared = prepareForMatching(input)
  const matches: DetectionMatch[] = []

  for (const { entry, pattern } of COMPILED_LEXICON) {
    const match = pattern.exec(prepared)
    if (!match) continue

    matches.push({
      ...entry,
      rawFragment: match[0],
      normalizedFragment: normalizeText(match[0]),
    })
  }

  return {
    input,
    normalizedText: normalizeText(input),
    matches: matches.sort((left, right) => right.severity - left.severity || right.points - left.points),
  }
}

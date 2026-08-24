import { describe, expect, it } from 'vitest'
import { detectExpressions } from './detector'

describe('expression detector', () => {
  it('detects a direct lexicon match', () => {
    expect(detectExpressions('Sen aptal').matches.map((match) => match.id)).toEqual(['aptal'])
  })

  it('detects a configured phrase', () => {
    expect(detectExpressions('Sen adi herif').matches[0]?.id).toBe('adi-herif')
  })

  it('detects case variants', () => {
    expect(detectExpressions('ŞEREFSİZ').matches[0]?.id).toBe('serefsiz')
  })

  it('detects punctuation between letters', () => {
    expect(detectExpressions('a.d.i h.e.r.i.f').matches[0]?.id).toBe('adi-herif')
  })

  it('detects whitespace between letters', () => {
    expect(detectExpressions('p i s l i k').matches[0]?.id).toBe('pislik')
  })

  it('detects repeated letters', () => {
    expect(detectExpressions('şeeeerefsiz').matches[0]?.id).toBe('serefsiz')
  })

  it('detects numeric substitutions', () => {
    expect(detectExpressions('p1sl1k').matches[0]?.id).toBe('pislik')
  })

  it('detects symbol substitutions', () => {
    expect(detectExpressions('$@l@k').matches[0]?.id).toBe('salak')
  })

  it('returns no match for clean text', () => {
    expect(detectExpressions('Birlikte daha iyi bir çözüm bulabiliriz.').matches).toHaveLength(0)
  })

  it.each([
    'Bu masal akıcı ve keyifli.',
    'Yeni kap talebi yarın değerlendirilecek.',
    'Aptalca kelimesi morfolojik olarak sözlükteki tam token değildir.',
    'Pişmanlık bazen öğreticidir.',
  ])('protects clean similar-looking substrings: %s', (text) => {
    expect(detectExpressions(text).matches).toHaveLength(0)
  })

  it('reports multiple distinct expressions once each', () => {
    const ids = detectExpressions('aptal ve pislik, yine aptal').matches.map((match) => match.id)
    expect(ids).toEqual(['aptal', 'pislik'])
  })

  it('does not count repetition of the same expression more than once', () => {
    expect(detectExpressions('aptal aptal aptal').matches.filter((match) => match.id === 'aptal')).toHaveLength(1)
  })
})

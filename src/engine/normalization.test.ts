import { describe, expect, it } from 'vitest'
import { compactForDebug, normalizeText, prepareForMatching } from './normalization'

describe('normalization', () => {
  it('uses Turkish-aware lowercase', () => {
    expect(normalizeText('İYİ BİR FİKİR')).toBe('iyi bir fikir')
  })

  it('normalizes punctuation into conservative boundaries', () => {
    expect(normalizeText('a.d.i! herif')).toBe('a d i herif')
  })

  it('normalizes whitespace separated letters', () => {
    expect(normalizeText('a d i')).toBe('a d i')
    expect(compactForDebug('a d i')).toBe('adi')
  })

  it('compresses character extensions of three or more', () => {
    expect(normalizeText('şeeeerefsiz')).toBe('şerefsiz')
  })

  it('keeps ordinary double letters intact', () => {
    expect(normalizeText('Hissetmek güzeldir')).toBe('hissetmek güzeldir')
  })

  it('normalizes common number substitutions', () => {
    expect(normalizeText('p1sl1k ve 4pt4l')).toBe('pislik ve aptal')
  })

  it('normalizes common symbol substitutions', () => {
    expect(prepareForMatching('$@l@k')).toBe('salak')
  })

  it('removes zero-width formatting characters', () => {
    expect(normalizeText('sa\u200Blak')).toBe('salak')
  })

  it('preserves clean Turkish text meaningfully', () => {
    expect(normalizeText('Bugün, birlikte üretelim!')).toBe('bugün birlikte üretelim')
  })
})

const SUBSTITUTIONS: Readonly<Record<string, string>> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
}

export function prepareForMatching(input: string): string {
  return [...input.normalize('NFKC').toLocaleLowerCase('tr-TR')]
    .filter((character) => !/\p{Cf}/u.test(character))
    .map((character) => SUBSTITUTIONS[character] ?? character)
    .join('')
}

export function normalizeText(input: string): string {
  return prepareForMatching(input)
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function compactForDebug(input: string): string {
  return normalizeText(input).replace(/\s+/g, '')
}

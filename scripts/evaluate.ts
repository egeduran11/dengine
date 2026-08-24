import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { LEXICON } from '../src/config/lexicon'
import { detectExpressions } from '../src/engine/detector'

interface EvaluationCase {
  id: string
  text: string
  expectedMatchIds: string[]
}

interface CaseOutcome extends EvaluationCase {
  actualMatchIds: string[]
  detected: boolean
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const evaluationDirectory = resolve(scriptDirectory, '../evaluation')

async function loadCases(filename: string): Promise<EvaluationCase[]> {
  return JSON.parse(await readFile(resolve(evaluationDirectory, filename), 'utf8')) as EvaluationCase[]
}

function evaluateCase(testCase: EvaluationCase): CaseOutcome {
  const actualMatchIds = detectExpressions(testCase.text).matches.map((match) => match.id)
  const detected = testCase.expectedMatchIds.every((expected) => actualMatchIds.includes(expected))
  return { ...testCase, actualMatchIds, detected }
}

function percentage(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 10_000) / 100
}

const [cleanCases, directCases, obfuscatedCases] = await Promise.all([
  loadCases('clean.json'),
  loadCases('direct_violations.json'),
  loadCases('obfuscated_violations.json'),
])

const cleanOutcomes = cleanCases.map((testCase) => {
  const outcome = evaluateCase(testCase)
  return { ...outcome, detected: outcome.actualMatchIds.length === 0 }
})
const directOutcomes = directCases.map(evaluateCase)
const obfuscatedOutcomes = obfuscatedCases.map(evaluateCase)
const falsePositives = cleanOutcomes.filter((outcome) => !outcome.detected)
const directMisses = directOutcomes.filter((outcome) => !outcome.detected)
const obfuscatedMisses = obfuscatedOutcomes.filter((outcome) => !outcome.detected)
const truePositives = directOutcomes.length - directMisses.length + obfuscatedOutcomes.length - obfuscatedMisses.length
const falsePositiveCount = falsePositives.length
const falseNegativeCount = directMisses.length + obfuscatedMisses.length
const precision = percentage(truePositives, truePositives + falsePositiveCount)
const recall = percentage(truePositives, truePositives + falseNegativeCount)
const f1 = precision + recall === 0 ? 0 : Math.round(((2 * precision * recall) / (precision + recall)) * 100) / 100
const timestamp = new Date().toISOString()

const results = {
  generatedAt: timestamp,
  engine: {
    type: 'deterministic weighted lexicon',
    lexiconEntries: LEXICON.length,
    quotedTextHandling: false,
  },
  dataset: {
    clean: cleanCases.length,
    directViolations: directCases.length,
    obfuscatedViolations: obfuscatedCases.length,
    total: cleanCases.length + directCases.length + obfuscatedCases.length,
  },
  metrics: {
    falsePositives: falsePositiveCount,
    falsePositiveRatePercent: percentage(falsePositiveCount, cleanCases.length),
    directDetected: directCases.length - directMisses.length,
    directDetectionRatePercent: percentage(directCases.length - directMisses.length, directCases.length),
    obfuscatedDetected: obfuscatedCases.length - obfuscatedMisses.length,
    obfuscatedDetectionRatePercent: percentage(obfuscatedCases.length - obfuscatedMisses.length, obfuscatedCases.length),
    normalizationBypassCatchRatePercent: percentage(
      obfuscatedCases.length - obfuscatedMisses.length,
      obfuscatedCases.length,
    ),
    precisionPercent: precision,
    recallPercent: recall,
    f1Percent: f1,
  },
  falsePositives,
  misses: {
    direct: directMisses,
    obfuscated: obfuscatedMisses,
  },
}

await writeFile(resolve(evaluationDirectory, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8')

const summary = `# Dengine Evaluation Summary

Generated: ${timestamp}

## Dataset

- Clean comments: ${cleanCases.length}
- Direct violations: ${directCases.length}
- Obfuscated violations: ${obfuscatedCases.length}
- Total cases: ${results.dataset.total}

## Actual Metrics

- False positives: ${falsePositiveCount}/${cleanCases.length} (${results.metrics.falsePositiveRatePercent}%)
- Direct violation detection: ${results.metrics.directDetected}/${directCases.length} (${results.metrics.directDetectionRatePercent}%)
- Obfuscated violation detection: ${results.metrics.obfuscatedDetected}/${obfuscatedCases.length} (${results.metrics.obfuscatedDetectionRatePercent}%)
- Normalization bypass catch rate: ${results.metrics.normalizationBypassCatchRatePercent}%
- Case-level precision: ${precision}%
- Case-level recall: ${recall}%
- Case-level F1: ${f1}%

## Observed Errors

- Direct misses: ${directMisses.length}
- Obfuscated misses: ${obfuscatedMisses.length}
- False-positive case IDs: ${falsePositives.map((item) => item.id).join(', ') || 'none'}
- Direct miss IDs: ${directMisses.map((item) => item.id).join(', ') || 'none'}
- Obfuscated miss IDs: ${obfuscatedMisses.map((item) => item.id).join(', ') || 'none'}

The dataset is a small, synthetic prototype evaluation. It is not evidence of production effectiveness or scientific validation. See \`EVALUATION.md\` and \`evaluation/results.json\` for methodology and case-level details.
`

await writeFile(resolve(evaluationDirectory, 'summary.md'), summary, 'utf8')
console.log(summary)

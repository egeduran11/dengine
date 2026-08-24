import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEXICON } from '../src/config/lexicon'
import { detectExpressions } from '../src/engine/detector'
import { calculatePenalty } from '../src/engine/penalty'

type ExpectedLabel = 'violation' | 'clean'
type ExpectedSeverity = 'low' | 'medium' | 'high' | 'contextual' | 'n/a'

interface HardTestCase {
  id: string
  text: string
  category: string
  expected: ExpectedLabel
  expectedSeverity: ExpectedSeverity
  reason: string
}

interface HardDataset {
  datasetVersion: string
  authoredAt: string
  language: string
  purpose: string
  labelingRule: string
  cases: HardTestCase[]
}

interface Counts {
  totalCases: number
  violationCases: number
  cleanCases: number
  truePositives: number
  trueNegatives: number
  falsePositives: number
  falseNegatives: number
}

function percentage(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 10_000) / 100
}

function metricsFromCounts(counts: Counts) {
  const precision = percentage(counts.truePositives, counts.truePositives + counts.falsePositives)
  const recall = percentage(counts.truePositives, counts.truePositives + counts.falseNegatives)
  const specificity = percentage(counts.trueNegatives, counts.trueNegatives + counts.falsePositives)
  const falsePositiveRate = percentage(counts.falsePositives, counts.trueNegatives + counts.falsePositives)
  const f1 =
    precision + recall === 0 ? 0 : Math.round(((2 * precision * recall) / (precision + recall)) * 100) / 100

  return {
    ...counts,
    precisionPercent: precision,
    recallPercent: recall,
    f1Percent: f1,
    specificityPercent: specificity,
    falsePositiveRatePercent: falsePositiveRate,
  }
}

function classifyFailure(testCase: HardTestCase, detectedLabel: ExpectedLabel): string | null {
  if (testCase.expected === detectedLabel) return null

  if (testCase.expected === 'clean') {
    if (testCase.category === 'QUOTATION_CONTEXT_TRAP') return 'QUOTATION_FALSE_POSITIVE'
    if (testCase.id === 'H-005') return 'CONTEXT_REQUIRED'
    return 'FALSE_SUBSTRING_NORMALIZATION_COLLISION'
  }

  if (testCase.category === 'CREATIVE_COMPOSITIONAL_ABUSE') return 'COMPOSITIONAL_MEANING'
  if (testCase.category === 'INDIRECT_INSULT') return 'CONTEXT_REQUIRED'
  if (testCase.category === 'THREAT_VIOLENT_IMPLICATION') return 'THREAT_SEMANTICS'
  if (testCase.category === 'SARCASM_IRONY') return 'SARCASM_REQUIRED'

  if (['A-001', 'A-002', 'A-006', 'B-015'].includes(testCase.id)) return 'MORPHOLOGY_FAILURE'
  if (testCase.category === 'ORTHOGRAPHIC_EVASION' || testCase.id === 'A-015') return 'NORMALIZATION_FAILURE'
  if (testCase.category === 'DIRECT_KNOWN_ABUSE') return 'LEXICON_GAP'
  return 'OTHER'
}

function countOutcomes(outcomes: readonly CaseOutcome[]): Counts {
  return {
    totalCases: outcomes.length,
    violationCases: outcomes.filter((item) => item.expectedLabel === 'violation').length,
    cleanCases: outcomes.filter((item) => item.expectedLabel === 'clean').length,
    truePositives: outcomes.filter((item) => item.expectedLabel === 'violation' && item.detectedLabel === 'violation')
      .length,
    trueNegatives: outcomes.filter((item) => item.expectedLabel === 'clean' && item.detectedLabel === 'clean').length,
    falsePositives: outcomes.filter((item) => item.expectedLabel === 'clean' && item.detectedLabel === 'violation')
      .length,
    falseNegatives: outcomes.filter((item) => item.expectedLabel === 'violation' && item.detectedLabel === 'clean')
      .length,
  }
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const hardTestDirectory = resolve(scriptDirectory, '../evaluation/hard-user-test')
const expectedDatasetSha256 = '4ab2aa3866fad4bde560fbe1e6132388ce16dc26e094b7fafa35a29f7b62723a'
const datasetSource = await readFile(resolve(hardTestDirectory, 'dataset.json'), 'utf8')
const actualDatasetSha256 = createHash('sha256').update(datasetSource).digest('hex')

if (actualDatasetSha256 !== expectedDatasetSha256) {
  throw new Error(`Frozen hard dataset hash mismatch: ${actualDatasetSha256}`)
}

const expectedDetectorHashes: Readonly<Record<string, string>> = {
  'src/config/lexicon.ts': '15113e2211eeacd6d62ffd1c86a18f5f0925dae20e7ea4b28ee492246056d80d',
  'src/engine/normalization.ts': '6ede55b3788752c35ae04e2e20303de2eb4366a7286f6fda3580aea9ec13b226',
  'src/engine/detector.ts': '5ae1eb1be1b34bdabc3faf5fd4f0626f0aa25bd073a407f9c18b052b53385e49',
  'src/engine/penalty.ts': '1dd5017e63724b3f97f87db130ed911230ad5f532caa93313ad9072277726244',
  'src/engine/risk.ts': '58818b114107955f9c16dfca5dcb65bc536be5f64cb2eadfa2af3761ae831af1',
  'src/engine/policy.ts': '903b85a2d8f314f15e210a60c7e4941ff02d20f93d45aa24a5fbb8bcdb604a64',
}
interface DetectorFingerprint {
  expectedSha256: string
  actualSha256: string
  unchanged: boolean
}

const detectorFingerprints = Object.fromEntries(
  await Promise.all(
    Object.entries(expectedDetectorHashes).map(async ([file, expectedSha256]) => {
      const actualSha256 = createHash('sha256').update(await readFile(resolve(projectRoot, file))).digest('hex')
      return [file, { expectedSha256, actualSha256, unchanged: expectedSha256 === actualSha256 }]
    }),
  ),
) as Record<string, DetectorFingerprint>
const detectorChangedAfterFreeze = Object.values(detectorFingerprints).some((fingerprint) => !fingerprint.unchanged)

if (detectorChangedAfterFreeze) {
  throw new Error('Frozen production detector fingerprint mismatch; refusing to run hard evaluation.')
}

const dataset = JSON.parse(datasetSource) as HardDataset

if (dataset.cases.length !== 100) {
  throw new Error(`Frozen hard dataset must contain 100 cases; received ${dataset.cases.length}.`)
}

interface CaseOutcome {
  id: string
  category: string
  originalText: string
  normalizedText: string
  expectedLabel: ExpectedLabel
  expectedSeverity: ExpectedSeverity
  groundTruthReason: string
  detectedLabel: ExpectedLabel
  detectedExpressions: Array<{
    id: string
    canonical: string
    rawFragment: string
    normalizedFragment: string
    category: string
    severity: number
    configuredPoints: number
  }>
  detectedPrimarySeverity: number | null
  proposedPenalty: number
  pass: boolean
  failureTaxonomy: string | null
}

const outcomes: CaseOutcome[] = dataset.cases.map((testCase) => {
  const detection = detectExpressions(testCase.text)
  const penalty = calculatePenalty(detection.matches)
  const detectedLabel: ExpectedLabel = detection.matches.length > 0 ? 'violation' : 'clean'

  return {
    id: testCase.id,
    category: testCase.category,
    originalText: testCase.text,
    normalizedText: detection.normalizedText,
    expectedLabel: testCase.expected,
    expectedSeverity: testCase.expectedSeverity,
    groundTruthReason: testCase.reason,
    detectedLabel,
    detectedExpressions: detection.matches.map((match) => ({
      id: match.id,
      canonical: match.canonical,
      rawFragment: match.rawFragment,
      normalizedFragment: match.normalizedFragment,
      category: match.category,
      severity: match.severity,
      configuredPoints: match.points,
    })),
    detectedPrimarySeverity: penalty.primary?.severity ?? null,
    proposedPenalty: penalty.points,
    pass: testCase.expected === detectedLabel,
    failureTaxonomy: classifyFailure(testCase, detectedLabel),
  }
})

const overall = metricsFromCounts(countOutcomes(outcomes))
const categories = [...new Set(outcomes.map((item) => item.category))]
const perCategory = Object.fromEntries(
  categories.map((category) => {
    const categoryOutcomes = outcomes.filter((item) => item.category === category)
    return [category, metricsFromCounts(countOutcomes(categoryOutcomes))]
  }),
)

const failureTaxonomy = outcomes
  .filter((outcome) => outcome.failureTaxonomy !== null)
  .reduce<Record<string, { count: number; caseIds: string[] }>>((summary, outcome) => {
    const taxonomy = outcome.failureTaxonomy as string
    summary[taxonomy] ??= { count: 0, caseIds: [] }
    summary[taxonomy].count += 1
    summary[taxonomy].caseIds.push(outcome.id)
    return summary
  }, {})

const results = {
  generatedAt: new Date().toISOString(),
  baseline: {
    frozenProductionCommit: '1e32dd2c13587c4d56448272f1f73e45282dc23b',
    baselineRecordCommit: '2297fce',
    frozenDatasetCommit: '04108431e5de66d8a2e43b0416ebca56c28fc280',
    datasetSha256: actualDatasetSha256,
    detectorChangedAfterFreeze,
    detectorFingerprints,
  },
  engine: {
    type: 'deterministic weighted lexicon adapter',
    productionFunctions: ['detectExpressions', 'calculatePenalty'],
    lexiconEntries: LEXICON.length,
    quotedTextHandling: false,
  },
  dataset: {
    version: dataset.datasetVersion,
    authoredAt: dataset.authoredAt,
    totalCases: dataset.cases.length,
    violationCases: overall.violationCases,
    cleanCases: overall.cleanCases,
  },
  metrics: overall,
  perCategory,
  failureTaxonomy,
  failures: outcomes.filter((outcome) => !outcome.pass),
  cases: outcomes,
}

await writeFile(resolve(hardTestDirectory, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      generatedAt: results.generatedAt,
      metrics: results.metrics,
      perCategory: results.perCategory,
      failureTaxonomy: results.failureTaxonomy,
    },
    null,
    2,
  ),
)

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyModerationDecision, calculatePenalty, getRiskTier, proposeModeration } from '../src/engine'
import {
  confirmViolation,
  createInitialState,
  publishCleanComment,
  setDemoRisk,
  simulateCleanDays,
} from '../src/state/dengineState'

type ExpectedLabel = 'violation' | 'clean'
type JourneyAction = 'publish' | 'edit-only' | 'edit-then-confirm' | 'confirm-and-decay'

interface DatasetCase {
  id: string
  text: string
  category: string
  expected: ExpectedLabel
}

interface Dataset {
  cases: DatasetCase[]
}

interface JourneySpec {
  id: string
  datasetId: string
  purpose: string
  startingRisk: number
  action: JourneyAction
  cleanDays?: number
}

const journeySpecs: readonly JourneySpec[] = [
  {
    id: 'J-001',
    datasetId: 'H-009',
    purpose: 'Temiz yorum: uyarısız yayın ve değişmeyen risk',
    startingRisk: 0,
    action: 'publish',
  },
  {
    id: 'J-002',
    datasetId: 'A-003',
    purpose: 'Tespit edilen doğrudan kaba ifade: Düzenle ve sonra Yine de Gönder yolları',
    startingRisk: 0,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-003',
    datasetId: 'A-009',
    purpose: 'Tespit edilen ağır doğrudan hakaret: yüksek ceza ve geçmiş kaydı',
    startingRisk: 10,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-004',
    datasetId: 'B-001',
    purpose: 'Noktalı kaçınmanın tespit edilmesi ve onaylı yayın',
    startingRisk: 0,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-005',
    datasetId: 'B-005',
    purpose: 'Sembol aralıklı ağır hakaretin tespit edilmesi',
    startingRisk: 12,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-006',
    datasetId: 'A-002',
    purpose: 'Türkçe çekim eki nedeniyle kaçan doğrudan hakaret',
    startingRisk: 0,
    action: 'publish',
  },
  {
    id: 'J-007',
    datasetId: 'C-004',
    purpose: 'Kaçan yaratıcı/bileşimsel zekâ hakareti',
    startingRisk: 20,
    action: 'publish',
  },
  {
    id: 'J-008',
    datasetId: 'C-016',
    purpose: 'Kaçan yaratıcı varlık aşağılama metaforu',
    startingRisk: 20,
    action: 'publish',
  },
  {
    id: 'J-009',
    datasetId: 'D-009',
    purpose: 'Kaçan dolaylı ve bağlama bağlı hakaret',
    startingRisk: 35,
    action: 'publish',
  },
  {
    id: 'J-010',
    datasetId: 'E-004',
    purpose: 'Kaçan açık zarar tehdidi',
    startingRisk: 35,
    action: 'publish',
  },
  {
    id: 'J-011',
    datasetId: 'F-005',
    purpose: 'Kaçan sarkastik aşağılama',
    startingRisk: 35,
    action: 'publish',
  },
  {
    id: 'J-012',
    datasetId: 'G-002',
    purpose: 'Akademik alıntıda yanlış pozitif ve Düzenle ile cezasız çıkış',
    startingRisk: 7,
    action: 'edit-only',
  },
  {
    id: 'J-013',
    datasetId: 'H-005',
    purpose: 'Gerçek kir anlamında kullanılan kelimede yanlış pozitif',
    startingRisk: 7,
    action: 'edit-only',
  },
  {
    id: 'J-014',
    datasetId: 'A-004',
    purpose: '39 puandan Normal → Uyarı eşik geçişi',
    startingRisk: 39,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-015',
    datasetId: 'A-008',
    purpose: '59 puandan Uyarı → Bekleme Süresi geçişi ve kısıtlama',
    startingRisk: 59,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-016',
    datasetId: 'A-010',
    purpose: '95 puanda riskin 100 ile sınırlanması ve geçici etkileşim kısıtlaması',
    startingRisk: 95,
    action: 'edit-then-confirm',
  },
  {
    id: 'J-017',
    datasetId: 'A-007',
    purpose: 'Onaylı ihlalden sonra iki temiz gün decay ve Uyarı → Normal geri kazanımı',
    startingRisk: 30,
    action: 'confirm-and-decay',
    cleanDays: 2,
  },
]

function commentCount(state: ReturnType<typeof createInitialState>): number {
  return state.posts.reduce((total, post) => total + post.comments.length, 0)
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const hardTestDirectory = resolve(scriptDirectory, '../evaluation/hard-user-test')
const dataset = JSON.parse(await readFile(resolve(hardTestDirectory, 'dataset.json'), 'utf8')) as Dataset
const baseTime = Date.parse('2026-08-24T10:00:00.000Z')

const journeys = journeySpecs.map((spec, index) => {
  const testCase = dataset.cases.find((item) => item.id === spec.datasetId)
  if (!testCase) throw new Error(`Missing frozen dataset case: ${spec.datasetId}`)

  const startIso = new Date(baseTime + index * 600_000).toISOString()
  let state = createInitialState(startIso)
  if (spec.startingRisk !== 0) state = setDemoRisk(state, spec.startingRisk, startIso)

  const initialRisk = state.risk
  const initialHistoryCount = state.history.length
  const initialCommentCount = commentCount(state)
  const proposal = proposeModeration(testCase.text, state.risk)
  const independentPenalty = calculatePenalty(proposal.detection.matches)
  const detectedLabel: ExpectedLabel = proposal.requiresWarning ? 'violation' : 'clean'
  const detectionFailure = testCase.expected !== detectedLabel

  const editDecision = proposal.requiresWarning ? applyModerationDecision(proposal, 'edit') : null
  const editPath = {
    exercised: editDecision !== null,
    appliedPenalty: editDecision?.appliedPenalty ?? false,
    published: editDecision?.published ?? false,
    riskBefore: initialRisk,
    riskAfter: editDecision?.newRisk ?? initialRisk,
    noPenaltyVerified:
      editDecision === null ||
      (!editDecision.appliedPenalty && !editDecision.published && editDecision.newRisk === initialRisk),
  }

  let publicationMode: 'none' | 'clean-path' | 'send-anyway' = 'none'
  if (spec.action !== 'edit-only') {
    if (proposal.requiresWarning) {
      state = confirmViolation(state, 'post-1', proposal, new Date(baseTime + index * 600_000 + 1_000).toISOString())
      publicationMode = 'send-anyway'
    } else {
      state = publishCleanComment(
        state,
        'post-1',
        testCase.text,
        new Date(baseTime + index * 600_000 + 1_000).toISOString(),
      )
      publicationMode = 'clean-path'
    }
  }

  const riskAfterPublication = state.risk
  const tierAfterPublication = getRiskTier(state.risk)
  const historyAfterPublication = state.history.length
  const commentsAfterPublication = commentCount(state)
  const expectedPublicationRisk =
    publicationMode === 'send-anyway' ? proposal.projectedRisk : initialRisk
  const expectedHistoryIncrement = publicationMode === 'send-anyway' ? 1 : 0
  const violationEvent = publicationMode === 'send-anyway' ? state.history[0] : null

  const publicationChecks = {
    commentPublished: publicationMode === 'none' ? commentsAfterPublication === initialCommentCount : commentsAfterPublication === initialCommentCount + 1,
    riskMatchesProposal: riskAfterPublication === expectedPublicationRisk,
    historyCountCorrect: historyAfterPublication === initialHistoryCount + expectedHistoryIncrement,
    violationEventCorrect:
      violationEvent === null ||
      (violationEvent.type === 'violation' &&
        violationEvent.previousRisk === initialRisk &&
        violationEvent.newRisk === proposal.projectedRisk &&
        violationEvent.delta === proposal.projectedRisk - initialRisk &&
        violationEvent.metadata.policyPoints === proposal.penalty.points),
    policyTierCorrect: tierAfterPublication.id === getRiskTier(riskAfterPublication).id,
    restrictionCorrect:
      publicationMode !== 'send-anyway' ||
      (tierAfterPublication.restrictionSeconds === 0
        ? state.restrictionUntil === null
        : state.restrictionUntil !== null),
  }

  let decay = null
  if (spec.action === 'confirm-and-decay') {
    const beforeDecay = state.risk
    const beforeDecayHistoryCount = state.history.length
    const cleanDays = spec.cleanDays ?? 1
    state = simulateCleanDays(
      state,
      cleanDays,
      new Date(baseTime + index * 600_000 + cleanDays * 86_400_000).toISOString(),
    )
    const expectedRisk = Math.round(beforeDecay * Math.pow(0.9, cleanDays) * 100) / 100
    const decayEvent = state.history[0]
    decay = {
      cleanDays,
      riskBefore: beforeDecay,
      riskAfter: state.risk,
      expectedRisk,
      tierBefore: getRiskTier(beforeDecay).label,
      tierAfter: getRiskTier(state.risk).label,
      historyEvent: decayEvent,
      checks: {
        formulaCorrect: state.risk === expectedRisk,
        historyAdded: state.history.length === beforeDecayHistoryCount + 1,
        eventCorrect:
          decayEvent.type === 'decay' &&
          decayEvent.previousRisk === beforeDecay &&
          decayEvent.newRisk === expectedRisk &&
          decayEvent.metadata.cleanDays === cleanDays,
      },
    }
  }

  const interactionChecks = {
    warningMatchesActualDetector: proposal.requiresWarning === (proposal.detection.matches.length > 0),
    displayedPenaltyMatchesEngine: proposal.penalty.points === independentPenalty.points,
    projectedRiskMatchesEngine: proposal.projectedRisk === Math.min(100, initialRisk + proposal.penalty.points),
    editPathCorrect: editPath.noPenaltyVerified,
    ...publicationChecks,
    decayFormulaCorrect: decay?.checks.formulaCorrect ?? true,
    decayHistoryCorrect: (decay?.checks.historyAdded ?? true) && (decay?.checks.eventCorrect ?? true),
  }
  const interactionRiskFailure = Object.values(interactionChecks).some((value) => !value)

  return {
    journeyId: spec.id,
    datasetCaseId: testCase.id,
    purpose: spec.purpose,
    text: testCase.text,
    groundTruth: testCase.expected,
    detectedLabel,
    detectionOutcome: detectionFailure ? 'DETECTION_FAILURE' : 'DETECTION_PASS',
    interactionOutcome: interactionRiskFailure ? 'INTERACTION_RISK_FAILURE' : 'INTERACTION_RISK_PASS',
    initial: {
      risk: initialRisk,
      tier: getRiskTier(initialRisk).label,
    },
    warning: {
      appeared: proposal.requiresWarning,
      detectedExpressions: proposal.detection.matches.map((match) => match.canonical),
      displayedPenalty: proposal.penalty.points,
      projectedRisk: proposal.projectedRisk,
      projectedTier: proposal.projectedTier.label,
      crossesTier: proposal.crossesTier,
    },
    editPath,
    publication: {
      mode: publicationMode,
      riskAfter: riskAfterPublication,
      tierAfter: tierAfterPublication.label,
      historyEvent: violationEvent,
      checks: publicationChecks,
    },
    decay,
    interactionChecks,
  }
})

const summary = {
  totalJourneys: journeys.length,
  detectionPasses: journeys.filter((item) => item.detectionOutcome === 'DETECTION_PASS').length,
  detectionFailures: journeys.filter((item) => item.detectionOutcome === 'DETECTION_FAILURE').length,
  interactionRiskPasses: journeys.filter((item) => item.interactionOutcome === 'INTERACTION_RISK_PASS').length,
  interactionRiskFailures: journeys.filter((item) => item.interactionOutcome === 'INTERACTION_RISK_FAILURE').length,
  warningJourneys: journeys.filter((item) => item.warning.appeared).length,
  editPathsExercised: journeys.filter((item) => item.editPath.exercised).length,
  sendAnywayPathsExercised: journeys.filter((item) => item.publication.mode === 'send-anyway').length,
  cleanPublishPathsExercised: journeys.filter((item) => item.publication.mode === 'clean-path').length,
  decayPathsExercised: journeys.filter((item) => item.decay !== null).length,
}

const output = {
  generatedAt: new Date().toISOString(),
  methodology:
    'Logic-level simulation using the production proposeModeration/applyModerationDecision/state transition functions. Detection correctness is scored separately from interaction/risk correctness.',
  summary,
  journeys,
}

await writeFile(resolve(hardTestDirectory, 'interaction-results.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(summary, null, 2))

if (summary.interactionRiskFailures > 0) process.exitCode = 1

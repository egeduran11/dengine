# Dengine Hard Adversarial User Test

## Executive Summary

The frozen Dengine detector performed poorly when Turkish users deliberately avoided its ten-entry lexicon or relied on sentence-level meaning. On the separate 100-case hard set it produced **17 true positives, 8 true negatives, 12 false positives, and 63 false negatives**: **58.62% precision, 21.25% recall, 31.19% F1, and 40.00% specificity**.

Four violation categories had zero recall: creative/compositional abuse, indirect insults, threats/violent implications, and sarcasm/irony. Quotation/context traps produced a 90% false-positive rate. This is not a small robustness gap; it shows that the current deterministic detector cannot defensibly be presented as a general Turkish abuse or threat detector.

The broader Dengine interaction machinery behaved differently. Seventeen representative production-flow simulations produced **17/17 interaction/risk passes and 0 interaction/risk failures**, including Edit, Send Anyway, threshold transitions, risk history, a 100-point cap, restrictions, and decay. In eight of those journeys the detector itself was wrong, and the downstream system consistently acted on that wrong input. The hard test therefore damages the detector claim, not the conditional correctness of the transparent intervention and recovery flow.

## Test Objective

The test asks: **How well does Dengine survive realistic adversarial Turkish when users actively try to evade a deterministic lexicon?**

It is intentionally outside the comfort zone of the original evaluation. It tests direct abuse, undocumented orthographic evasions, compositional hostility, indirect insults, threats, sarcasm, quotation/context traps, and unusual but clean controls. It does not merge its score with the original 130-case result.

## Baseline

The production detector was frozen before the hard dataset was written:

| Baseline item | Value |
|---|---|
| Frozen production commit | `1e32dd2c13587c4d56448272f1f73e45282dc23b` |
| Baseline record commit | `2297fce` |
| Frozen lexicon size | 10 entries |
| Final dataset freeze commit | `04108431e5de66d8a2e43b0416ebca56c28fc280` |
| Final dataset SHA-256 | `4ab2aa3866fad4bde560fbe1e6132388ce16dc26e094b7fafa35a29f7b62723a` |
| Production detector changed during test | No |
| Original `evaluation/results.json` changed | No |

The production fingerprints recorded in `BASELINE.md` were rechecked after evaluation and remained identical. The detector was not tuned against misses, and no lexicon item was added.

The frozen pipeline applies NFKC and Turkish lowercase conversion, removes Unicode format characters, performs eight fixed character substitutions, and matches configured terms with Unicode boundaries. A compiled expression permits character repetition and up to three non-alphanumeric separators between canonical characters. It does not implement sentence semantics, morphology, conversational context, threat intent, sarcasm, or quotation handling.

## Methodology

1. Recorded the code commit, file hashes, lexicon size, normalization behavior, architecture, and existing standard metrics in `BASELINE.md`.
2. Authored and ground-truth-labelled 100 Turkish cases before running Dengine.
3. During post-run overlap verification, discovered that one text duplicated an original standard case. Invalidated that run, preserved its metrics in `DATASET_AUDIT.md`, and replaced only that text with a new pre-labelled case.
4. Revalidated all category counts and unique IDs, confirmed zero exact overlap with the three original datasets, then hashed and committed dataset v1.1.0 before evaluating its replacement.
5. Ran every final case through the actual production `detectExpressions` function.
6. Ran matches through the actual production `calculatePenalty` function.
7. Recorded the original text, production-normalized text, expected and detected labels, detected entries, severity, proposed penalty, pass/fail status, and failure taxonomy in `results.json`.
8. Ran 17 logic-level user journeys through the production moderation and state-transition functions and recorded them in `interaction-results.json`.

Ground truth was assigned by the evaluator, not by Dengine. “Violation” means the comment is directed abuse, humiliation, hostile insinuation, or threat in the supplied single-comment context. Contextual cases necessarily involve human judgement; this is documented as a test limitation rather than resolved after seeing results.

## Dataset

The hard set is separate from the original 130-case evaluation. It contains **80 violations and 20 clean cases**. It was designed to resemble spontaneous social-media language and includes slang, typos, colloquial grammar, metaphors, emoji, unusual punctuation, number substitutions, partial masking, inflection, quotation, and polysemous clean use.

The immutable source is `dataset.json`; its checksum is stored in `dataset.sha256`. No existing standard-evaluation case was copied into this dataset.

## Categories

| Category | Cases | Ground-truth violations | Ground-truth clean |
|---|---:|---:|---:|
| Direct known abuse | 15 | 15 | 0 |
| Orthographic evasion | 15 | 15 | 0 |
| Creative/compositional abuse | 20 | 20 | 0 |
| Indirect insults | 10 | 10 | 0 |
| Threats/violent implications | 10 | 10 | 0 |
| Sarcasm/irony | 10 | 10 | 0 |
| Quotation/context traps | 10 | 0 | 10 |
| Clean adversarial controls | 10 | 0 | 10 |
| **Total** | **100** | **80** | **20** |

## Overall Results

### Standard evaluation — original and unchanged

| Metric | Result |
|---|---:|
| Cases | 130 |
| Precision | 98.63% |
| Recall | 90.00% |
| F1 | 94.12% |
| Direct violation recall | 90.00% |
| Obfuscated violation recall | 90.00% |
| Clean false-positive rate | 2.00% |

### Hard adversarial evaluation — new

| Metric | Result |
|---|---:|
| Cases | 100 |
| Ground-truth violations | 80 |
| Ground-truth clean | 20 |
| True positives | 17 |
| True negatives | 8 |
| False positives | 12 |
| False negatives | 63 |
| Precision | **58.62%** |
| Recall | **21.25%** |
| F1 | **31.19%** |
| Specificity | **40.00%** |
| Clean false-positive rate | **60.00%** |

The two tables measure different distributions. The 94.12% standard F1 is an in-domain result; the 31.19% hard F1 measures deliberately hostile and context-sensitive language. Combining them would conceal the exact weakness this test was designed to expose.

## Per-Category Results

For violation-only categories, recall is the relevant category score. For clean-only categories, false-positive rate is relevant; precision and recall are not defined usefully within those clean-only slices.

| Category | TP | TN | FP | FN | Recall | False-positive rate |
|---|---:|---:|---:|---:|---:|---:|
| Direct known abuse | 7 | 0 | 0 | 8 | **46.67%** | n/a |
| Orthographic evasion | 10 | 0 | 0 | 5 | **66.67%** | n/a |
| Creative/compositional abuse | 0 | 0 | 0 | 20 | **0.00%** | n/a |
| Indirect insults | 0 | 0 | 0 | 10 | **0.00%** | n/a |
| Threats/violent implications | 0 | 0 | 0 | 10 | **0.00%** | n/a |
| Sarcasm/irony | 0 | 0 | 0 | 10 | **0.00%** | n/a |
| Quotation/context traps | 0 | 1 | 9 | 0 | n/a | **90.00%** |
| Clean adversarial controls | 0 | 7 | 3 | 0 | n/a | **30.00%** |

The detector caught several designed normalization forms—single punctuation or emoji separators, spaces, repeated characters, mixed casing, `@` substitution, and symbol-separated known expressions. It failed beyond that bounded pattern and failed when Turkish suffixes made a lexicon term part of a longer token.

## False Positives

There were **12 false positives among 20 clean cases**.

- **9/10 quotation/context traps** were flagged. Reporting that someone used an abusive term, discussing the term in class, or explaining a moderation decision was treated the same as directing the term at another user.
- **3/10 clean adversarial controls** were flagged. These involved an ordinary literal “dirt” sense, an uppercase acronym that collided with a lexicon entry, and a punctuated character sequence discussed as a file code.

Representative cases are `G-002`, `G-007`, `H-005`, and `H-007`. These failures demonstrate lack of quotation, speech-act, polysemy, and acronym context; they are not evidence of a boundary-regex bug alone.

## False Negatives

There were **63 false negatives among 80 violations**.

- Eight of 15 direct-abuse cases were missed because of ordinary Turkish inflection, vocabulary gaps, or a spelling/diacritic variant.
- Five of 15 orthographic-evasion cases were missed by partial masking, a homoglyph, a number/letter ambiguity, or evasion combined with suffixes.
- All 20 creative/compositional cases were missed.
- All 10 indirect insults were missed.
- All 10 threats/violent implications were missed.
- All 10 sarcasm/irony cases were missed.

Representative failures include `A-002` (ordinary inflection), `B-011` (homoglyph), `C-004` (sentence-level metaphor), `D-009` (indirect humiliation), `E-004` (threat without profanity), and `F-005` (sarcastic hostility).

## Failure Taxonomy

The taxonomy counts every failed case exactly once.

| Failure class | Count | Interpretation |
|---|---:|---|
| `COMPOSITIONAL_MEANING` | 20 | Individual words appear permissible; the sentence is abusive as a whole. |
| `CONTEXT_REQUIRED` | 11 | Ten indirect insults were missed; one clean literal use was falsely flagged. |
| `THREAT_SEMANTICS` | 10 | Threat intent existed without a configured abusive term. |
| `SARCASM_REQUIRED` | 10 | Literal wording did not expose the hostile pragmatic meaning. |
| `QUOTATION_FALSE_POSITIVE` | 9 | Quoted, reported, or discussed abuse was treated as directly authored abuse. |
| `NORMALIZATION_FAILURE` | 5 | Diacritics, partial masking, homoglyphs, or malformed spelling escaped matching. |
| `MORPHOLOGY_FAILURE` | 4 | Turkish suffixes prevented exact token-boundary matching. |
| `LEXICON_GAP` | 4 | Direct hostile vocabulary was not represented in the ten-entry prototype lexicon. |
| `FALSE_SUBSTRING_NORMALIZATION_COLLISION` | 2 | A clean acronym or punctuated code normalized to a configured entry. |
| **Total failures** | **75** | **63 false negatives + 12 false positives.** |

## Most Important Failure Modes

1. **Sentence meaning is absent.** The detector sees configured character patterns, not hostility expressed through otherwise ordinary words. This caused the largest single block of misses.
2. **Threat detection is absent.** All ten threat cases passed without warning. This is the highest-safety-severity gap even though it is not the largest count.
3. **Context is symmetric in the wrong way.** The detector misses indirect context but over-flags quoted or discussed lexicon terms. It cannot distinguish use from mention.
4. **Turkish morphology breaks ordinary direct-abuse recall.** Even some non-creative, recognisable insults were missed after common suffixes.
5. **Normalization is bounded and bypassable.** It works for documented transformations but not arbitrary masking, homoglyphs, long separator runs, or combined transformations.

## Interaction Layer Validation

Seventeen representative cases were simulated with the production `proposeModeration`, `applyModerationDecision`, `confirmViolation`, `publishCleanComment`, `setDemoRisk`, and `simulateCleanDays` functions.

| Validation item | Actual result |
|---|---:|
| User journeys | 17 |
| Detector-ground-truth passes in selected journeys | 9 |
| Detector-ground-truth failures in selected journeys | 8 |
| Interaction/risk passes | **17** |
| Interaction/risk failures | **0** |
| Warning journeys | 10 |
| Edit paths exercised | 10 |
| Send Anyway paths exercised | 8 |
| Clean publish paths exercised | 7 |
| Decay paths exercised | 1 |

Verified behavior:

- A clean detector result published without a warning and did not change risk.
- A detected direct insult and detected bypass produced a pre-send proposal with the configured points.
- Edit published nothing and changed no risk.
- Send Anyway published the comment, applied exactly the proposed penalty, and added a structured violation event.
- Risk moved from 39/Normal to 45/Warning, from 59/Warning to 67/Cooldown, and from 95 to the 100-point cap/Temporary Interaction Restriction.
- After a confirmed violation moved risk from 30 to 43, two simulated clean days produced `43 × 0.9² = 34.83`, added a decay event, and returned the tier from Warning to Normal.
- Missed violations published through the clean path with no warning or risk change. These were recorded as **detection failures**, not interaction/risk failures.
- False positives raised warnings correctly according to the detector; Edit still provided a penalty-free exit. They remain detection failures.

These are logic-level production-flow simulations rather than a new visual browser study. Full case-level evidence is in `interaction-results.json`.

## What Dengine Handles Well

- Once a detection signal exists, the consequence preview is deterministic and internally consistent.
- Edit and Send Anyway preserve the intended user-agency distinction.
- Confirmed penalties, caps, event history, tier changes, temporary restrictions, and decay are coherent in the exercised flows.
- The normalizer catches several common low-complexity evasions around terms it already knows.
- Boundary logic avoids many innocent longer-token collisions; seven of ten adversarial clean controls stayed clean.

## What Dengine Does Not Handle Well

- It does not understand general Turkish abuse.
- It does not detect threat meaning without a lexicon hit.
- It does not understand compositional hostility, implication, or sarcasm.
- It does not distinguish quoting/reporting a term from targeting a person with it.
- It lacks Turkish morphology handling and broad hostile vocabulary coverage.
- It cannot support a production-safety claim from these results.

## Architectural Implications

The defensible architecture is:

```text
Detection adapter
       ↓
Dengine moderation interaction layer
       ↓
Risk engine
       ↓
Progressive intervention
       ↓
Decay / recovery
```

The current deterministic detector should be described as **“the current prototype detection adapter feeding the Dengine framework,”** not **“the Dengine moderation algorithm.”** The latter phrase incorrectly fuses a weak, replaceable signal source with the product's more general contribution.

The product thesis remains partially supported: Dengine demonstrates how an identified policy event can be previewed, accepted or edited, converted into proportional risk, escalated progressively, explained in history, and recovered through decay. The hard test does not establish that the current adapter can reliably identify the events that should enter that flow.

## Limitations of This Test

- The 100 cases are evaluator-authored and synthetic, not sampled from a representative NSosyal corpus.
- One evaluator assigned the labels; no inter-annotator agreement was measured.
- Many indirect and sarcastic cases are context-sensitive, and reasonable policy teams may label borderline examples differently.
- The dataset is adversarially enriched, so its precision, specificity, and false-positive rate should not be interpreted as expected platform prevalence metrics.
- No conversational thread, target identity, user history, or multimodal context was supplied.
- The journey validation exercised production logic, not a new accessibility, latency, or cross-browser UI study.
- The hard set is now visible in the repository; future claims require another held-out set rather than tuning until this one becomes perfect.
- Version 1.0.0 contained one accidental exact overlap with the standard set and was invalidated. The audit trail preserves that error and its metrics; final version 1.1.0 has zero exact textual overlap, but semantic similarity between two independently authored abuse sets is unavoidable.

## Recommended Next Engineering Steps

1. Reframe competition claims immediately: Dengine is the transparent, progressive, recoverable moderation interaction framework; the current deterministic detector is a prototype adapter.
2. Preserve this dataset as a regression set but create a new held-out set for every claimed detector improvement.
3. Add a stable detector-adapter interface so detection can evolve without changing the transparency/risk architecture.
4. Prioritize deterministic threat-intent phrase patterns, Turkish morphology handling, and quotation/use-versus-mention guards before merely expanding vocabulary.
5. Treat limited phrase templates as targeted coverage, not general semantic understanding; measure false-positive impact separately.
6. Add human review, appeal, privacy, and retention policy requirements to any production roadmap.
7. Do not claim production effectiveness until evaluation uses a larger, naturally occurring, independently annotated Turkish dataset.

No recommendation above was implemented during this test.

## Reproducibility

From the repository root:

```bash
npm ci
cd evaluation/hard-user-test
shasum -a 256 -c dataset.sha256
cd ../..
npx tsx scripts/evaluate-hard-user-test.ts
npx tsx scripts/simulate-hard-user-journeys.ts
```

Expected detector metrics are 17 TP, 8 TN, 12 FP, 63 FN, 58.62% precision, 21.25% recall, 31.19% F1, and 40.00% specificity. Expected journey summary is 17/17 interaction/risk passes with 0 interaction/risk failures. The evaluator rewrites only `evaluation/hard-user-test/results.json` and `interaction-results.json`; it does not rewrite the original standard-evaluation artifacts.

Final repository quality gate on `2026-08-24`:

| Command | Actual result |
|---|---|
| `npx tsx scripts/evaluate-hard-user-test.ts` | Success; final metrics above |
| `npx tsx scripts/simulate-hard-user-journeys.ts` | Success; 17/17 interaction/risk passes |
| `npm run lint` | Success; 0 warnings/errors |
| `npm run typecheck` | Success |
| `npm test` | Success; 8/8 files, 65/65 tests |
| `npm run build` | Success; Vite production bundle generated |

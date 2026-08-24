# Dengine Hard-Test Improvement Plan

This plan was written only after the frozen dataset, detector results, technical report, and CEO report were complete. It proposes work; it does **not** implement or claim any detector improvement.

## Decision principle

Do not optimize the ten-entry lexicon until the 100 hard cases turn green. That would convert an adversarial evaluation into a memorized regression set. Preserve this set for regression, but judge every detector change on a second, unseen Turkish set with independently assigned labels.

## Ranked options

Scale: impact and competition relevance are `Low / Medium / High / Critical`; engineering complexity, explainability, and false-positive risk are `Low / Medium / High`.

| Rank | Improvement | Failure evidence | Impact | Complexity | Explainability | Competition relevance | False-positive risk |
|---:|---|---|---|---|---|---|---|
| 1 | Reframe architecture around a stable `DetectionAdapter` contract | Detector F1 31.19%, while interaction/risk flows passed 17/17 | Critical | Low | High | Critical | Low |
| 2 | Add deterministic Turkish suffix-aware matching with strict stem/ending rules | 4 morphology failures; direct recall only 46.67% | High | Medium | High | High | Medium |
| 3 | Add narrowly scoped threat-intent phrase rules and a separate threat category | Threat recall 0/10 | Critical | Medium | High | High | High |
| 4 | Add use-versus-mention guards for quotation/reporting/moderation language | Quotation false-positive rate 90% | High | Medium | Medium | High | Medium |
| 5 | Expand normalization for audited homoglyphs and partial masking with collision tests | 5 normalization failures | Medium | Medium | High | Medium | High |
| 6 | Expand vocabulary by concept families using an independently sourced list | 4 explicit lexicon gaps; only 10 entries exist | Medium | Low | High | Medium | Medium |
| 7 | Add bounded compositional phrase templates | Compositional recall 0/20 | High | High | Medium | Medium | High |
| 8 | Introduce a pluggable context-sensitive classifier as a future adapter option | Indirect, compositional, threat, and sarcasm recall all 0% | Critical | High | Low–Medium | Medium | High |
| 9 | Add human review and appeal routing for high-impact or low-confidence actions | 12 FP and 63 FN demonstrate unavoidable uncertainty | High | High | High | Medium | Low |

## Recommended sequence

### P0 — competition framing, no detector tuning

1. Make the architecture explicit:

   ```text
   DetectionAdapter.analyze(text, context?)
              ↓
   Dengine transparency / decision layer
              ↓
   Risk / intervention / decay
   ```

2. State that the existing deterministic implementation is one prototype adapter.
3. Publish standard and hard results separately.
4. Make the interaction chain—not broad language understanding—the primary jury demo.

This has the highest competition value because it aligns the claim with the part that passed 17/17 journey checks.

### P1 — bounded deterministic improvements

#### Turkish morphology

- Define an allow-list of common Turkish inflectional suffix chains for configured roots.
- Preserve Unicode token boundaries after the accepted suffix rather than immediately after the root.
- Add clean near-root counterexamples for every suffix rule.
- Do not use unconditional `startsWith` matching.

Acceptance gate: improve direct-abuse recall on a new held-out set without materially worsening clean-control specificity.

#### Threat patterns

- Create a separate, centrally configured threat pattern module.
- Start with explicit future-harm and coercive-warning constructions, not a huge collection of keywords.
- Require target/future/harm evidence combinations where possible.
- Assign threat severity independently from profanity severity.

Acceptance gate: a separately authored threat set plus non-threatening future-tense and safety-warning controls. The current 10 threats may be regression cases, not the only target.

#### Quotation and reporting guards

- Identify explicit quote spans and common reporting/moderation constructions.
- Downgrade or route for review rather than automatically declaring all quoted content clean; hostile users can abuse quotation syntax.
- Test nested quotes, scare quotes, indirect quotation, and a quoted term followed by a direct target.

Acceptance gate: lower the held-out quotation false-positive rate while retaining detection of genuinely targeted abuse that happens to use quotation marks.

#### Normalization

- Audit a small, documented homoglyph map.
- Consider bounded masking recovery only when enough canonical characters remain.
- Keep separator limits explicit and measure collision cost before expanding them.

Acceptance gate: every new recovered evasion must ship with multiple clean collision controls.

### P2 — coverage and context research

#### Vocabulary expansion

Build concept families from external policy review and naturally occurring, privacy-safe examples—not by copying every miss from this dataset. Version the policy, record why each family exists, and validate annotator agreement on severity.

#### Compositional templates

Limited templates can cover repeated constructions such as negative capability comparisons or explicit dehumanization. They remain rules, not semantic understanding, and must be described that way. Their false-positive risk is high because ordinary criticism can share surface structure.

#### Pluggable classifier research

A context-sensitive adapter may eventually be necessary for compositional meaning, implication, and sarcasm. It is not required to demonstrate Dengine's competition UX thesis, and adding a remote AI service under deadline would weaken reproducibility, privacy, and explainability. If researched later, it must have calibrated confidence, local policy mapping, failure logging, appeal support, and direct comparison against deterministic baselines.

## Evaluation protocol for every change

1. Keep `dataset.json` and its ground-truth labels immutable.
2. Before implementation, author and hash a second held-out set that the implementer cannot tune against.
3. Report both violation recall and clean specificity; never ship a recall gain without its false-positive cost.
4. Report per-category results, especially threats and quotation.
5. Repeat the interaction simulations to prove adapter changes did not alter Edit, Send Anyway, risk, history, tiers, or decay.
6. Have at least two Turkish-speaking annotators label contextual cases and report disagreement.
7. Do not replace the standard or hard score with a blended headline metric.

## Recommended 24-hour scope

Implement **no rushed semantic detector**. Make the architectural reframe and claims correction first. If engineering time remains, prototype suffix-aware matching or a quotation guard behind the adapter boundary, but do not announce gains until a new held-out set exists. Threat handling is the most safety-important next detector project, but it deserves dedicated clean controls rather than a last-minute keyword list.

## Explicit non-recommendations

- Do not add the 64 missed sentences verbatim to the lexicon.
- Do not remove the 12 false-positive cases from the dataset.
- Do not enlarge separator tolerance globally without collision measurement.
- Do not claim sarcasm or contextual understanding from a handful of templates.
- Do not conceal the hard score behind the standard score.
- Do not automatically add an LLM or hosted AI API to the competition prototype.

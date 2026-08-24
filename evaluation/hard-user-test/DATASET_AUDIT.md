# Hard Dataset Audit Trail

## Version 1.0.0 — invalidated before final delivery

- Freeze commit: `2ff20658e181d4a3a51dfcb068854e686c2ebc53`
- SHA-256: `83c7556159236e62fb9a8a3f959de7f81d11c597807f0b5ad131d57fa2eca3f3`
- Cases: 100

During post-run dataset verification, case `B-013` was found to be an exact textual duplicate of `obf-037` in the existing standard evaluation: `a....p....t....a....l`. This violated the requirement that the hard dataset be completely separate. The first run is therefore **invalidated**, not presented as the final hard evaluation.

For transparency, its observed confusion matrix and metrics were:

| Metric | Invalidated v1 result |
|---|---:|
| TP | 16 |
| TN | 8 |
| FP | 12 |
| FN | 64 |
| Precision | 57.14% |
| Recall | 20.00% |
| F1 | 29.63% |
| Specificity | 40.00% |

No production detector or lexicon change was made after this run.

## Version 1.1.0 — replacement procedure

Only `B-013` was replaced. The replacement text is `4pt@l mısın la, ne anlatıyon?`, labelled `violation` / `medium` before it is evaluated. It tests combined number/symbol substitution in colloquial, deliberately malformed Turkish. The category count remains 15 orthographic-evasion cases and the full dataset remains 100 cases.

The other 99 texts, all 100 labels, categories, severities, and reasons remain unchanged except that `B-013`'s reason now describes its replacement text. Version 1.1.0 will be checked for exact overlap against all three original datasets, hashed, and committed before Dengine evaluates the replacement.

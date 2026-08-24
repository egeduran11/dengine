# Dengine Evaluation Summary

Generated: 2026-08-24T09:15:58.904Z

## Dataset

- Clean comments: 50
- Direct violations: 40
- Obfuscated violations: 40
- Total cases: 130

## Actual Metrics

- False positives: 1/50 (2%)
- Direct violation detection: 36/40 (90%)
- Obfuscated violation detection: 36/40 (90%)
- Normalization bypass catch rate: 90%
- Case-level precision: 98.63%
- Case-level recall: 90%
- Case-level F1: 94.12%

## Observed Errors

- Direct misses: 4
- Obfuscated misses: 4
- False-positive case IDs: clean-047
- Direct miss IDs: direct-037, direct-038, direct-039, direct-040
- Obfuscated miss IDs: obf-037, obf-038, obf-039, obf-040

The dataset is a small, synthetic prototype evaluation. It is not evidence of production effectiveness or scientific validation. See `EVALUATION.md` and `evaluation/results.json` for methodology and case-level details.

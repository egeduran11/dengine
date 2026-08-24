# Dengine Hard User Test — Frozen Baseline

This record was created **before** the separate hard-adversarial dataset was authored or evaluated. It freezes the detector inputs used by the hard test. No detector or lexicon change is permitted until `results.json`, `HARD_USER_TEST_REPORT.md`, and `CEO_HARD_TEST_REPORT.md` have been produced.

## Freeze identity

| Field | Value |
|---|---|
| Frozen at | `2026-08-24T12:47:04+03:00` |
| Git branch | `main` |
| Git commit | `1e32dd2c13587c4d56448272f1f73e45282dc23b` |
| Commit subject | `docs: confirm remote delivery status` |
| Remote | `git@github.com:egeduran11/dengine.git` |
| Remote `origin/main` at freeze | `1e32dd2c13587c4d56448272f1f73e45282dc23b` |
| Working tree at freeze | clean |

## Detector file fingerprints

SHA-256 fingerprints make any post-freeze production change detectable.

| File | SHA-256 |
|---|---|
| `src/config/lexicon.ts` | `15113e2211eeacd6d62ffd1c86a18f5f0925dae20e7ea4b28ee492246056d80d` |
| `src/engine/normalization.ts` | `6ede55b3788752c35ae04e2e20303de2eb4366a7286f6fda3580aea9ec13b226` |
| `src/engine/detector.ts` | `5ae1eb1be1b34bdabc3faf5fd4f0626f0aa25bd073a407f9c18b052b53385e49` |
| `src/engine/penalty.ts` | `1dd5017e63724b3f97f87db130ed911230ad5f532caa93313ad9072277726244` |
| `src/engine/risk.ts` | `58818b114107955f9c16dfca5dcb65bc536be5f64cb2eadfa2af3761ae831af1` |
| `src/engine/policy.ts` | `903b85a2d8f314f15e210a60c7e4941ff02d20f93d45aa24a5fbb8bcdb604a64` |

## Current lexicon

- Entry count: **10**.
- Each entry contains an id, canonical expression, integer severity (1–4), configured points, Turkish user-facing category, and explanation.
- The vocabulary is centrally configured in `src/config/lexicon.ts`.
- The test does not extend, tune, or otherwise change this vocabulary.

## Current normalization rules

The production pipeline in `src/engine/normalization.ts` performs:

1. Unicode NFKC normalization.
2. Turkish-locale lowercase conversion (`tr-TR`).
3. Removal of Unicode format characters (`Cf`).
4. Fixed substitutions: `0→o`, `1→i`, `3→e`, `4→a`, `5→s`, `7→t`, `@→a`, `$→s`.
5. For display/debug normalization, compression of three-or-more repeated Unicode letters to one.
6. For display/debug normalization, replacement of non-letter/non-number runs with a space and whitespace collapse.

Detection does not match against the display-normalized string alone. It uses the prepared NFKC/lowercase/substitution form with per-expression regular expressions.

## Current detection architecture

1. `prepareForMatching` produces a Turkish-aware, substitution-normalized input.
2. Each configured canonical expression is flattened to letters/numbers.
3. A Unicode regular expression allows repeated instances of each canonical character and zero to three non-alphanumeric separators between adjacent canonical characters.
4. Unicode alphanumeric boundaries on both sides prevent ordinary substring matches inside longer tokens.
5. All matching lexicon entries are returned and sorted by severity, then points.
6. `calculatePenalty` uses the highest-severity match as primary, adds 2 points for each additional distinct match, caps additional points at 4, and caps a comment at 25 points.

There is no semantic sentence model, Turkish morphological analyzer, sarcasm model, threat-intent model, conversational context model, or quotation handling. This hard test therefore evaluates both the detector's designed domain and behavior outside that domain.

## Existing standard evaluation — unchanged reference

Source: the already committed `evaluation/results.json`, generated at `2026-08-24T09:15:58.904Z`. This hard test will not rewrite it.

| Metric | Existing result |
|---|---:|
| Total cases | 130 |
| Clean cases | 50 |
| Direct violation cases | 40 |
| Obfuscated violation cases | 40 |
| False positives | 1 |
| Clean false-positive rate | 2.00% |
| Direct detection recall | 90.00% |
| Obfuscated detection recall | 90.00% |
| Precision | 98.63% |
| Recall | 90.00% |
| F1 | 94.12% |

These figures describe the original, mostly in-domain 130-case dataset. They must not be combined with the hard-adversarial metrics into one headline score.

## Existing automated test baseline

Command executed after the freeze identity was recorded:

```text
npm test
```

Actual result on `2026-08-24`: **8/8 test files passed; 65/65 tests passed; 0 failed**.

## Freeze rule

The files fingerprinted above are the production detector/policy baseline. Dataset labels will be authored before Dengine is run against the new cases, and the dataset will be hashed and committed before detector outputs are generated.

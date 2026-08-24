# Dengine Final Status

## GitHub Repository

- Remote URL: `https://github.com/egeduran11/dengine`
- Visibility: Private (GitHub UI’da doğrulandı)
- Branch name: `main`
- Remote push: **Complete**
- Local repository: Complete

## Last Commit

- Verified remote source/merge commit: `cefd2fd4488d1a162318543eda42cd1363859e38` (`chore: connect initialized GitHub repository`)
- Branch: `main`
- Remote ref verification: `origin/main` matched `cefd2fd4488d1a162318543eda42cd1363859e38` before this status-only metadata refresh

The commit containing this final status update necessarily follows the hash recorded inside the file; use `git log -1 --oneline` for that metadata commit. All source, tests, evaluation outputs, screenshots and documentation were already present in the verified commit above.

## Build Status

**Success**

- `npm run typecheck`: passed
- `npm run build`: passed
- Vite 7 production bundle created under `dist/`

## Test Status

**Success**

- Test files: 8 passed / 8 total
- Tests: 65 passed / 65 total
- Failed: 0
- ESLint: 0 errors, 0 warnings
- Browser console: 0 errors, 0 warnings

## Evaluation Status

**Completed with real, non-perfect results**

- Total: 130
- Clean false positives: 1/50 (%2)
- Direct detection: 36/40 (%90)
- Obfuscated detection: 36/40 (%90)
- Precision: %98,63
- Recall: %90
- F1: %94,12

## Implemented Features

- React/Vite/TypeScript responsive social feed prototype
- One demo user, three seeded posts and comments
- Central 10-entry weighted Turkish lexicon
- Severity 1–4 and configurable points
- Unicode NFKC and Turkish lowercase
- Space/punctuation/repetition/number/symbol bypass handling
- Unicode word-boundary false-positive protection
- Highest-severity + bounded additional distinct penalty
- Transparent pre-send warning dialog
- Detected category, reason, severity, points, current/projected score/tier
- Tier-crossing consequence preview
- Edit path with no publish and no penalty
- Send Anyway path with publication then penalty
- 0–100 clamped dynamic risk
- 0.90 per clean day exponential decay
- Automatic full-day decay on state load
- 1/3/7-day demo simulation
- Five intervention tiers and temporary restrictions
- Structured risk event history
- localStorage prototype persistence
- Demo reset, threshold setup and restriction clearing
- Live normalized text / canonical match debug display
- Accessible focus-managed modal and keyboard flow
- 65 automated tests
- 130-case adversarial evaluation with saved outputs
- Real browser manual scenarios
- Five saved screenshots
- Complete documentation/report support files

## Not Implemented

- Real authentication or multi-user accounts
- Backend/database/API
- Production-grade persistence
- Admin/moderator console
- Human review and appeal workflow
- Real NSosyal integration
- Full social graph, feed ranking, messaging, media upload or notifications
- Machine learning / LLM moderation (intentionally excluded)
- Repeat-violation time multiplier
- Turkish morphology analyzer
- Quotation/sarcasm/semantic context detection
- Hosted deployment
- User study or scientific validation

## Known Limitations

- Small deterministic lexicon
- Severity and thresholds are prototype policy parameters
- One quoted clean sentence creates a false positive
- Turkish suffix, long-separator, homograph and vowel-deletion misses
- Synthetic evaluation set is small
- Browser-local state and behavioral-history privacy policy are prototype-only

## How To Run

```bash
git clone https://github.com/egeduran11/dengine.git
cd dengine
npm install
npm run dev
```

Quality gate:

```bash
npm run verify
```

## How To Demo

1. `Demoyu sıfırla`
2. `Temiz örnek` → `Gönder` → risk stays 0
3. `+8 doğrudan örnek` → `Gönder` → show warning
4. `Düzenle` → no penalty
5. Repeat → `Yine de Gönder` → risk/history update
6. `Obfuscated örnek` → show detection
7. Set `39` → send +8 → show `Normal → Uyarı`
8. `+1 gün` → show decay and negative history event

## Important Files

- `README.md`
- `ARCHITECTURE.md`
- `EVALUATION.md`
- `LIMITATIONS.md`
- `TEST_RESULTS.md`
- `TECHNICAL_REPORT_INPUT.md`
- `FINAL_STATUS.md`
- `evaluation/results.json`
- `evaluation/summary.md`
- `src/config/lexicon.ts`
- `src/config/policy.ts`

## Submission Readiness

| Criterion | Status |
|---|---|
| Runnable | Yes |
| Tested | Yes |
| Production build | Yes |
| Evaluation saved | Yes |
| Documented | Yes |
| Local commits | Yes |
| Private GitHub repository created | Yes |
| Final remote source push | Yes |
| Hosted | No (optional, not attempted) |

The prototype implementation is runnable, tested, documented, committed and pushed to the private GitHub repository. Hosted deployment remains optional and was not attempted.

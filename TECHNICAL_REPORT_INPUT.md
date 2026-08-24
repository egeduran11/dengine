# Technical Report Input — Verified Facts Only

## Project Name

Dengine

## Problem

Geleneksel sosyal platform moderasyonu, kullanıcının hangi davranışın hangi sonucu doğuracağını gönderimden önce anlamadığı, gönderim sonrası ikili ve opak bir ceza deneyimi oluşturabilir. Kalıcı ihlal geçmişi de iyileşmeyi yeterince görünür kılmayabilir.

## Proposed Solution

Dengine; ağırlıklı deterministic ifade tespiti, bypass normalizasyonu, gönderim öncesi sonuç önizlemesi, kullanıcı kararı, dinamik risk, decay, kademeli müdahale ve açıklanabilir geçmişi tek yorum akışında birleştiren React/Vite/TypeScript prototipidir.

## Category Positioning

2026 TEKNOFEST NSosyal İnovasyon Yarışması  
Ana konumlandırma: **Kullanıcı Katılımı ve Arayüz / Kullanıcı Deneyimi**

Dengine end-user moderasyonunda LLM, generative AI, remote AI API veya makine öğrenmesi kullanmaz.

## Core Innovation

Doğrulanmış uygulama bileşimi:

- Severity-weighted moderation
- Transparent pre-send consequence preview
- Edit veya Send Anyway kullanıcı seçimi
- Yalnız onaylı yayın sonrası risk
- Progressive intervention
- Recoverable dynamic risk + clean-day decay
- Deterministic simple-bypass resistance
- Explainable risk history

Konsept çerçevesi:

```text
Retrospective punishment → informed pre-action choice
Permanent violation history → recoverable dynamic risk
```

Bu rapor “ilk”, “benzersiz”, “bilimsel olarak doğrulanmış” veya “küfür filtrelemeyi icat etti” iddiası içermemelidir.

## Architecture

```text
Comment Input
↓
Normalization Engine
↓
Weighted Lexicon Detector
↓
Penalty Proposal
↓
Transparency Layer
├── Edit → no penalty, no publication
└── Send Anyway
       ↓
   Risk Engine
       ↓
   Intervention Policy
       ↓
   Updated UI + Structured History
```

Core logic `src/engine/`, policy/lexicon `src/config/`, state transitions `src/state/`, presentation `src/components/` altında ayrıdır.

## Normalization Rules

Uygulanan sıraya göre:

1. Unicode NFKC
2. Turkish locale lowercase
3. Unicode format karakterlerini kaldırma
4. `0/o`, `1/i`, `3/e`, `4/a`, `5/s`, `7/t`, `@/a`, `$/s`
5. Debug görünümü için punctuation/whitespace standardizasyonu
6. Üç veya daha fazla karakter uzatmasını sıkıştırma
7. Tespit için her kanonik harf arasında en fazla üç ayırıcı ve tekrarlı harf izni
8. Alt dizi false positive’ine karşı Unicode token sınırı

## Lexicon Design

Merkezi TypeScript yapılandırmasında 10 prototip ifade bulunur. Her kayıt `id`, `canonical`, `severity (1–4)`, `points`, `category`, `explanation` içerir. Puanlar prototip parametreleridir.

## Scoring

Çoklu ihlal stratejisi:

```text
P = min(25, HighestSeverityBase + min(2 × AdditionalDistinctCount, 4))
```

Aynı terimin tekrarı ek distinct ceza oluşturmaz. Repeat-time multiplier uygulanmamıştır.

Risk:

```text
R_new = min(100, max(0, R_old + P))
```

Yalnız `Yine de Gönder` ile yayınlanan ihlal risk artırır.

## Decay Formula

```text
R(t+d) = round2(clamp(R(t)) × λ ^ floor(d))
λ = 0.90 / clean day
```

İçeride iki ondalık tutulur; ana UI tam sayıya yuvarlar. Demo 1/3/7 temiz gün simüle eder.

## Thresholds

| Risk | Tier |
|---:|---|
| 0–39 | Normal |
| 40–59 | Uyarı |
| 60–79 | Bekleme Süresi |
| 80–99 | Geçici Yorum Kısıtlaması |
| 100 | Geçici Etkileşim Kısıtlaması |

## Intervention Policy

- Normal: kısıtlama yok
- Uyarı: etkileşim devam eder, durum görünür
- Bekleme Süresi: onaylı ihlal sonrası 15 saniye
- Geçici Yorum Kısıtlaması: 45 saniye
- Geçici Etkileşim Kısıtlaması: 90 saniye
- Kalıcı silme/ban yok

Süreler demo parametresidir.

## User Flow

1. Kullanıcı yorum yazar; yazma risk değiştirmez.
2. Gönder ile saf proposal hesaplanır.
3. Temizse yorum yayınlanır, risk değişmez.
4. İhlal varsa kategori, seviye, puan, current/projected risk ve tier gösterilir.
5. Düzenle: modal kapanır, taslak korunur, risk değişmez.
6. Yine de Gönder: yorum yayınlanır, risk ve geçmiş güncellenir.
7. İhlalsiz tam günlerde risk decay olur.

## Technology Stack

- React 19.1.x
- Vite 7.3.x
- TypeScript 5.9.x
- Vitest 3.2.x
- lucide-react ikonları
- Responsive token tabanlı CSS
- Browser localStorage
- Node/tsx evaluation script

No backend, no paid service, no external AI moderation.

## Test Methodology

65 Vitest testi şu modülleri kapsar: normalization, detection, penalty, risk, decay, policy boundaries, pre-send decision logic, state/reset/restriction.

Ek manuel browser testi gerçek Vite dev server üzerinde clean, edit, confirm, obfuscated, threshold, decay, restriction, mobile, focus trap ve console senaryolarını çalıştırdı.

## Real Test Results

- 8/8 test file passed
- 65/65 tests passed
- ESLint passed with 0 warnings
- TypeScript passed
- Vite production build passed
- Browser console: 0 error / 0 warning

## Real Evaluation Results

130 synthetic cases:

- Clean: 50; false positives 1 (%2)
- Direct: 36/40 detected (%90)
- Obfuscated: 36/40 detected (%90)
- Precision: %98,63
- Recall: %90
- F1: %94,12

Known misses: Turkish suffixes, >3 separators, Cyrillic homograph, vowel deletion. Known false positive: quoted term in a report sentence.

## Limitations

- Small deterministic lexicon
- No semantic context, sarcasm, quotation handling or target resolution
- Limited Turkish morphology/dialect coverage
- Possible false positives and false negatives
- Subjective unvalidated severity/threshold/decay parameters
- Synthetic small evaluation
- No human review/appeal
- Behavioral history privacy policy not implemented
- Browser-local prototype persistence
- Not integrated with NSosyal infrastructure
- No user study or real-world effectiveness claim

## Future Work

- Turkish morphology-aware but explainable token expansion
- Quotation/reporting context controls
- Versioned policy authoring and audit
- Human review and appeal workflow
- Privacy-preserving server storage with retention controls
- Broader independently labeled Turkish dataset
- Category/segment fairness analysis
- NSosyal sandbox integration if an official interface becomes available
- User study comparing informed choice with retrospective warnings

## Repository Information

- Repository: `https://github.com/egeduran11/dengine`
- Visibility: Private
- Default branch: `main`
- Hosted deployment: Not created
- Reproduction commands: `npm install`, `npm run verify`

Final remote commit hash and push confirmation are recorded in [FINAL_STATUS.md](FINAL_STATUS.md).

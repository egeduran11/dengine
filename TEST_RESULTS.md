# Dengine Test Results

## Özet

Bu dosya terminal çıktısının kaybolmaması için gerçek kalite kapısı ve tarayıcı senaryolarını kaydeder.

Test tarihi: 24 Ağustos 2026, 12:15 (Europe/Istanbul)

## Komutlar ve Sonuçlar

| Komut | Sonuç |
|---|---|
| `npm install` | Başarılı; 210 package eklendi, 0 vulnerability |
| `npm run lint` | Başarılı; 0 error, 0 warning |
| `npm run typecheck` | Başarılı |
| `npm test` | Başarılı; 8/8 test dosyası, 65/65 test |
| `npm run build` | Başarılı; Vite production bundle oluştu |
| `npm run evaluation` | Başarılı; 130 vaka işlendi |

## Otomatik Test Dağılımı

| Dosya | Test | Sonuç |
|---|---:|---|
| `normalization.test.ts` | 9 | Geçti |
| `detector.test.ts` | 15 | Geçti |
| `penalty.test.ts` | 5 | Geçti |
| `risk.test.ts` | 6 | Geçti |
| `decay.test.ts` | 7 | Geçti |
| `policy.test.ts` | 8 | Geçti |
| `moderation.test.ts` | 7 | Geçti |
| `dengineState.test.ts` | 8 | Geçti |
| **Toplam** | **65** | **65 geçti, 0 kaldı** |

## Kapsanan Kritik Davranışlar

- Türkçe lowercase
- Noktalama ve whitespace ile ayrılmış harfler
- Tekrarlı harfler
- Sayı ve sembol ikameleri
- Temiz metin koruması
- Doğrudan ve phrase tespiti
- Benzer alt dizilerde false positive koruması
- Highest severity + bounded additional penalty
- Risk ekleme, 0/100 clamp
- Uyarının cezadan önce hesaplanması
- Düzenle yolunda sıfır ceza
- Onay yolunda yayın + ceza
- Bir ve çok günlük decay
- 39/40/59/60/79/80/99/100 sınırları
- Demo reset
- Geçici restriction state

## Production Build Çıktısı

```text
vite v7.3.6 building client environment for production...
✓ 1687 modules transformed.
dist/index.html                   0.67 kB │ gzip:  0.41 kB
dist/assets/index-biaplHou.css   19.14 kB │ gzip:  4.98 kB
dist/assets/index-DDSQIi8R.js   228.38 kB │ gzip: 72.11 kB
✓ built in 834ms
```

Hashli asset adları final rerun’da değişebilir; başarı durumu ve yaklaşık boyutlar doğrulanmıştır.

## Adversarial Evaluation

| Metrik | Gerçek sonuç |
|---|---:|
| Toplam vaka | 130 |
| Clean | 50 |
| Direct | 40 |
| Obfuscated | 40 |
| False positive | 1 (%2) |
| Direct detection | 36/40 (%90) |
| Obfuscated detection | 36/40 (%90) |
| Precision | %98,63 |
| Recall | %90 |
| F1 | %94,12 |

## Manuel Tarayıcı Doğrulaması

Gerçek Vite geliştirme sunucusu `http://127.0.0.1:5173/` üzerinde tarayıcı ile çalıştırıldı.

| Senaryo | Doğrulanan sonuç |
|---|---|
| A — Temiz yorum | Dialog yok; yorum 1 kez yayınlandı; risk `0` |
| B — İhlal / Düzenle | `+8` uyarısı; risk değişmedi; odak yorum alanına döndü |
| B — İhlal / Yine de Gönder | Dialog kapandı; yorum yayınlandı; risk `8`; ihlal geçmişi eklendi |
| C — Obfuscated | `a.d.i h.e.r.i.f` yakalandı; `+8` ve Doğrudan hakaret gösterildi |
| D — Eşik | `39 → 47`, `Normal → Uyarı` önizlendi ve onaylandı |
| E — Decay | `47 → 42.3`; Risk decay ve `1 günlük ihlalsiz kullanım` geçmişe yazıldı |
| Kısıtlama | Demo risk 85; iki görünür uyarı; composer disabled |
| Mobil | 375px viewport; scrollWidth 375; yatay taşma yok |
| Dokunma hedefi | Ana Gönder düğmesi 44px yüksekliğinde |
| Dialog focus | İlk odak Düzenle; Shift+Tab → Yine de Gönder; Tab → Düzenle |
| Mobil dialog | 682.67px dialog yüksekliği, 812px viewport içinde |
| Browser console | 0 error, 0 warning |

Manuel doğrulamada React Strict Mode’un geliştirme etkisiyle focus-return timer çakışması bulundu ve düzeltildi; senaryo düzeltmeden sonra tekrar geçmiştir.

## Bilinen Başarısızlıklar

Otomatik kalite kapısında başarısız test yoktur. Evaluation miss’leri test başarısızlığı olarak saklanmamış; [EVALUATION.md](EVALUATION.md) içinde gerçek dil sınırlaması olarak raporlanmıştır.

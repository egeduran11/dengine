# Dengine Architecture

## Sistem Amacı

Dengine, moderasyon kararını kullanıcı eyleminden önce açıklayan ve yalnızca kullanıcının uyarıya rağmen gönderimi onaylaması halinde risk uygulayan frontend prototipidir. Çekirdek karar mantığı React bileşenlerinden bağımsız saf TypeScript modülleridir.

## Uçtan Uca Akış

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
    ↓
User Decision
    ├── Edit → no publication, no penalty
    └── Send Anyway
           ↓
       Risk Engine
           ↓
       Intervention Policy
           ↓
       Updated UI + Structured History
```

Temiz yorum yolu doğrudan yayınlanır ve risk olayı üretmez. Uyarı gereken yorumlarda `proposeModeration` yalnızca öneri döndürür; state değiştirmez. Risk, `confirmViolation` içinde kullanıcı onayından sonra güncellenir.

## Modül Yapısı

```text
src/
  components/       React sunum ve etkileşim bileşenleri
  config/
    lexicon.ts      Merkezi Türkçe prototip sözlüğü
    policy.ts       Ceza sınırları, lambda ve eşikler
  data/seed.ts      Tekrarlanabilir demo akışı
  engine/
    normalization.ts
    detector.ts
    penalty.ts
    risk.ts
    decay.ts
    policy.ts
    moderation.ts
    types.ts
  state/
    dengineState.ts Saf state dönüşümleri ve risk olayları
    persistence.ts  localStorage yükleme/kaydetme
  App.tsx           Akış orkestrasyonu
```

## Normalizasyon

`prepareForMatching` aşağıdaki sırayı uygular:

1. Unicode NFKC normalizasyonu
2. Türkçe locale ile küçük harf
3. Görünmez format karakterlerini kaldırma
4. Yaygın ikameleri normalize etme:
   - `0 → o`
   - `1 → i`
   - `3 → e`
   - `4 → a`
   - `5 → s`
   - `7 → t`
   - `@ → a`
   - `$ → s`

`normalizeText`, kullanıcıya/debug paneline gösterilen daha okunaklı sürüm için üç veya daha fazla aynı harfi tek harfe indirir, harf/rakam dışı karakterleri boşluğa çevirir ve boşlukları birleştirir.

Tespit motoru, kanonik ifadenin her karakteri arasında en fazla üç harf/rakam dışı ayırıcıya izin veren Unicode-aware regex üretir. Karakterlerin uzatılması `+` ile kabul edilir. Negatif lookbehind/lookahead, normal kelimenin içindeki alt diziyi eşleşme olarak kabul etmez.

Örnek olarak sözlükte `salak` bulunması `masal akıcı` ifadesini işaretlemez. Bu muhafazakârlık Türkçe ek alan bazı gerçek ihlalleri de kaçırır; bu bilinçli prototip trade-off’u değerlendirmede görünürdür.

## Sözlük Tasarımı

Her kayıt tek bir merkezi şemayı kullanır:

```ts
{
  id,
  canonical,
  severity,   // 1..4
  points,
  category,
  explanation
}
```

Puanlar prototip politika parametreleridir; bilimsel olarak doğrulanmış ölçüm olarak sunulmaz. Sözlükte şu an 10 kayıt vardır.

## Çoklu İhlal Stratejisi

Bir yorumda aynı kanonik terim birden fazla kez geçse bile tek farklı eşleşme sayılır. Birden fazla farklı ifade varsa:

```text
P = min(25, HighestSeverityBase + min(2 × AdditionalDistinctCount, 4))
```

Bu tasarım, tek bir uzun yorumun tekrarlı metinle makul olmayan biçimde 100’e sıçramasını engeller. Ana neden kullanıcıya en yüksek şiddetli eşleşmenin kategorisi olarak açıklanır; ek farklı eşleşme sayısı ve ek puan da görünürdür.

Repeat-violation zaman çarpanı bu MVP’de uygulanmamıştır. Gelecek çalışma olarak bırakılmıştır.

## Risk Motoru

Risk aralığı `[0, 100]` olarak clamp edilir.

```text
R_new = min(100, max(0, R_old + P))
```

Yalnızca onaylanıp yayınlanan ihlaller risk artırır. Yazma, analiz, modal açılması, iptal veya Düzenle yolu risk değiştirmez.

## Decay

Varsayılan temiz gün katsayısı merkezi yapılandırmada `λ = 0.90` değeridir.

```text
R(t+d) = round2(clamp(R(t)) × 0.90 ^ floor(d))
```

Risk içeride iki ondalık hassasiyetle saklanır; ana UI tam sayıya yuvarlar, geçmiş gerektiğinde ondalığı gösterir. Tarayıcı yüklemesinde son decay tabanından geçen tam günler hesaplanır. Demo paneli 1, 3 ve 7 gün simülasyonu yapar. Her decay yapılandırılmış olay üretir.

## Müdahale Politikası

| Risk | Durum | Prototip davranışı |
|---:|---|---|
| 0–39 | Normal | Kısıtlama yok |
| 40–59 | Uyarı | Durum görünür, yorum devam eder |
| 60–79 | Bekleme Süresi | Onaylı ihlalden sonra 15 saniye cooldown |
| 80–99 | Geçici Yorum Kısıtlaması | 45 saniye yorum kısıtlaması |
| 100 | Geçici Etkileşim Kısıtlaması | 90 saniye daha güçlü geçici kısıtlama |

Süreler jüri demosuna uygun prototip parametreleridir ve [src/config/policy.ts](src/config/policy.ts) içinde değiştirilebilir. Kalıcı hesap silme yoktur.

## State ve Olay Kaydı

Risk değiştiren her onay, decay veya demo ayarı şu yapıyı üretir:

```ts
{
  id,
  timestamp,
  type,
  reason,
  previousRisk,
  delta,
  newRisk,
  metadata
}
```

Olay tipleri:

- `violation`
- `decay`
- `reset`
- `manual_demo_adjustment`

Demo-only değişiklikler metadata içinde işaretlenir. Tarayıcı kalıcılığı `dengine.prototype.state.v1` anahtarını kullanır.

## Şeffaflık UI’si

Dialog aşağıdakileri birlikte gösterir:

- Uygulanacak kesin puan
- Seviye ve kategori
- Kullanıcı dilinde neden
- Mevcut ve projected risk
- Mevcut ve projected tier
- Yeni eşik geçilirse yeni durumun sonucu
- `Düzenle` ve `Yine de Gönder` seçenekleri

Ham/kanonik sözlük eşleşmesi ana uyarıda gösterilmez; yalnızca `Demo / Debug Paneli` teknik görünümünde bulunur.

## Erişilebilirlik Kararları

- Native `button`, `textarea`, `progress` ve semantik heading yapısı
- Görünür label ve helper text
- Dialogda `role="dialog"`, `aria-modal`, başlık/açıklama ilişkisi
- İlk odağın `Düzenle` düğmesine taşınması
- Tab/Shift+Tab odak trap’i
- Escape’in güvenli Düzenle yoluna eşlenmesi
- Kapanışta odağın yorum alanına dönmesi
- 44px ana hedefler, görünür focus ring ve reduced motion
- Risk/tier bilgisi renk yanında her zaman metinle belirtilir

## Gizlilik ve Güvenlik

Prototip gerçek kişisel veri toplamaz; tek demo kullanıcı ve seed içerik kullanır. Secret veya API anahtarı yoktur. Production sistemi; kimlik doğrulama, sunucu yetkilendirmesi, veri minimizasyonu, saklama/silme süresi, denetim erişimi, itiraz ve kullanıcı verisi dışa aktarma süreçleri gerektirir.

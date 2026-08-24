# Dengine Evaluation

## Amaç

Bu değerlendirme, küçük deterministik prototip sözlüğünün üç temel davranışını ölçer:

1. Temiz yorumlarda false positive
2. Doğrudan ihlal tespiti
3. Basit obfuscation/bypass tespiti

Sonuçlar production etkinliği, kullanıcı çalışması veya bilimsel doğrulama iddiası değildir.

## Veri Seti

| Dosya | Vaka | Amaç |
|---|---:|---|
| `evaluation/clean.json` | 50 | Normal Türkçe yorumlar, benzer alt diziler ve bir alıntı bağlamı |
| `evaluation/direct_violations.json` | 40 | Doğrudan sözlük/ifade örnekleri ve Türkçe ekli zor örnekler |
| `evaluation/obfuscated_violations.json` | 40 | Noktalama, boşluk, tekrar, sayı/sembol ikamesi ve ileri bypass örnekleri |
| **Toplam** | **130** | |

Veri seti elle hazırlanmış küçük sentetik bir prototip setidir. Aynı motorun çıktısına göre geriye dönük temizlenmemiştir; bilinçli zor vakalar ve gerçek miss’ler korunmuştur.

## Metodoloji

```bash
npm run evaluation
```

`scripts/evaluate.ts` her vakada gerçek `detectExpressions` fonksiyonunu çalıştırır. Pozitif vakada `expectedMatchIds` içindeki tüm kanonik eşleşmelerin bulunması gerekir. Temiz vakada herhangi bir eşleşme false positive sayılır.

Case-level metrikler:

- True positive: Direct/obfuscated vakada beklenen tüm eşleşmeler bulundu
- False positive: Clean vakada en az bir ifade bulundu
- False negative: Pozitif vakada beklenen eşleşmelerden en az biri bulunamadı
- Precision, recall ve F1 bu case-level sayılardan hesaplandı

## Gerçek Sonuçlar

Oluşturulma zamanı: `2026-08-24T09:06:50.474Z`

| Metrik | Sonuç |
|---|---:|
| Clean false positive | 1 / 50 (%2) |
| Direct detection | 36 / 40 (%90) |
| Obfuscated detection | 36 / 40 (%90) |
| Normalization bypass catch rate | %90 |
| Case-level precision | %98,63 |
| Case-level recall | %90 |
| Case-level F1 | %94,12 |

Makine-okunur tam çıktı: [evaluation/results.json](evaluation/results.json).

## False Positive

`clean-047`:

> Rapor, “aptal” kelimesinin kullanımını tartışıyor.

Motor alıntı/raporlama bağlamı uygulamadığı için tam tokenı işaretler. Bu, deterministic sözlük moderasyonunda bağlam katmanı veya insan incelemesi gereksinimini görünür kılar.

## Direct Miss’ler

- `direct-037`: `aptalsın`
- `direct-038`: `salaksın`
- `direct-039`: `şerefsizsin`
- `direct-040`: `pisliğin`

Sebep: False positive koruması için kullanılan tam token sınırı, Türkçe üretken ekleri analiz etmez. Morphological çözümleme bu MVP’nin kapsamı dışındadır.

## Obfuscated Miss’ler

- `obf-037`: Her harf arasında üçten fazla nokta
- `obf-038`: Her harf arasında dört emoji
- `obf-039`: Latin `a` yerine Kiril homograph `а`
- `obf-040`: Sesli harfleri silinmiş kısaltma

Sebep: Ayraç izni false positive riskini kontrol etmek için üç karakterle sınırlıdır; geniş homograph tablosu ve fuzzy/kısaltma tespiti uygulanmamıştır.

## Başarılı Bypass Sınıfları

- Büyük/küçük harf
- Harfler arasında tek/az sayıda boşluk
- Nokta, tire ve yaygın sembol ekleme
- Tekrarlı harf uzatma
- `0/o`, `1/i`, `3/e`, `4/a`, `5/s`, `7/t`
- `@/a`, `$/s`
- Görünmez format karakteri

## Yorumlama

%90 sonuç, bu küçük kontrollü veri setindeki davranışı gösterir; gerçek platform dilinin başarısını göstermez. Özellikle clean set yalnızca 50, pozitif set yalnızca 80 vakadır. Diyalekt, yaş grubu, bölge, reclaimed kullanım, kod değiştirme, ironi ve yeni bypass biçimleri yeterince temsil edilmez.

## Daha Geniş Doğrulama İçin Gerekenler

- Kimliksizleştirilmiş gerçek platform örnekleri
- Birden fazla Türkçe dil uzmanıyla bağımsız etiketleme
- Severity anlaşmazlığı ve annotator agreement ölçümü
- Yaş/bölge/diyalekt ve topluluk alt grupları
- Precision/recall’ın kategori ve seviye bazında raporlanması
- Alıntı, haber, eğitim ve öz-referans bağlamı
- İnsan itiraz/inceleme sonucuyla hata analizi
- Gizlilik, veri saklama ve adalet etki değerlendirmesi
- Adversarial red-team setinin periyodik yenilenmesi

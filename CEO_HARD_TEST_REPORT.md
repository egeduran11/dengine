# Dengine — CEO Hard Test Report

## 1. Sonuç Tek Cümlede

**Evet: Gerçek kullanıcı sözlükteki açık küfürlerden kaçındığında Dengine’ı kolayca kandırabiliyor; mevcut detector yaratıcı hakaret, tehdit, ima ve sarkazmı güvenilir biçimde yakalamıyor.**

## 2. Skor Tablosu

Bu iki değerlendirme aynı şey değildir ve tek skorda birleştirilmemelidir.

| Metrik | Standard evaluation | Hard adversarial evaluation |
|---|---:|---:|
| Vaka | 130 | 100 |
| Precision | %98,63 | **%58,62** |
| Recall | %90,00 | **%21,25** |
| F1 | %94,12 | **%31,19** |
| False positive | 1/50 temiz vaka | **12/20 temiz vaka** |
| False negative | 8/80 ihlal | **63/80 ihlal** |
| Specificity | Eski raporda hesaplanmadı | **%40,00** |

Hard test kategori özeti:

| Kategori | Sonuç |
|---|---:|
| Doğrudan hakaret recall | %46,67 |
| Yazımsal kaçınma recall | %66,67 |
| Yaratıcı/bileşimsel hakaret recall | **%0,00** |
| Dolaylı hakaret recall | **%0,00** |
| Tehdit recall | **%0,00** |
| Sarkazm recall | **%0,00** |
| Alıntı/context yanlış pozitif oranı | **%90,00** |
| Temiz adversarial control yanlış pozitif oranı | **%30,00** |

Standard test, detector’ın bildiği on ifadeye ve belgelenmiş kaçınma biçimlerine yakın vakalarda çalıştığını gösteriyor. Hard test ise kullanıcının sözlükten kaçması veya anlamı cümle içine saklaması durumunda sonucun çöktüğünü gösteriyor.

Veri notu: İlk v1 koşusunda eski standard setle birebir aynı olan bir vaka sonradan fark edildi. O koşu geçersiz sayıldı ve metrikleri audit kaydında tutuldu; yerine yeni vaka önceden etiketlenip dataset v1.1.0 hashlenerek GitHub’a commit edildikten sonra final test çalıştırıldı. Final sette eski 130 vakayla birebir metin tekrarı yoktur.

## 3. Nerede İyiyiz?

- Detector doğru sinyal ürettiğinde ön-gönderim uyarısı doğru puanı ve yeni risk seviyesini gösteriyor.
- **Düzenle** yolu yorum yayınlamıyor ve ceza uygulamıyor.
- **Yine de Gönder** yolu yorumu yayınlıyor, tam önerilen cezayı uyguluyor ve doğru geçmiş kaydını oluşturuyor.
- 39→45 Normal/Uyarı, 59→67 Uyarı/Bekleme Süresi ve 95→100 geçişleri doğru çalıştı.
- İki ihlalsiz gün decay hesabı `43 × 0,9² = 34,83` olarak doğru uygulandı ve kullanıcı Uyarı’dan Normal’e döndü.
- Seçilen 17 uçtan uca mantık akışının **17/17’si geçti**; interaction/risk hatası çıkmadı.
- Detector, bildiği ifadelerde boşluk, tekil noktalama/emoji ayırıcı, harf tekrarı, karışık büyük-küçük harf ve bazı sayı/sembol dönüşümlerini yakalıyor.

Yani Dengine’ın “tespit edilen bir olaydan sonra kullanıcıya ne olur?” kısmı tutarlı. “Gerçekte hangi olay tespit edilir?” kısmı tutarlı değil.

## 4. Nerede Patlıyoruz?

1. **CRITICAL — Yaratıcı ve bileşimsel dil:** 20 vakanın 20’si kaçtı. Tek tek masum kelimelerle kurulmuş aşağılayıcı cümleleri mevcut yapı göremiyor.
2. **CRITICAL — Tehditler:** 10 tehdidin 10’u kaçtı. Küfür içermeyen açık veya örtülü tehdit için semantik kural yok.
3. **HIGH — Bağlam ve sarkazm:** Dolaylı hakarette 0/10, sarkazmda 0/10. Literal kelime listesi pragmatik anlamı okuyamıyor.
4. **HIGH — Alıntı yanlış pozitifleri:** Temiz alıntı/raporlama vakalarının 9/10’u ihlal sayıldı. Sistem kelimenin “kullanılması” ile “kelimeden bahsedilmesini” ayıramıyor.
5. **HIGH — Türkçe çekim ve sınırlı normalizasyon:** Yaygın ekler, homoglifler, kısmi maskeleme ve uzun ayırıcı dizileri kaçış sağladı. Hard doğrudan hakaret recall’ı bu nedenle yalnızca %46,67.
6. **MEDIUM — Sözlük kapsamı:** On kelimelik prototip sözlükte olmayan sıradan doğrudan hakaretler kaçtı.
7. **LOW — Downstream risk mantığı:** Test edilen akışlarda hata yok. Risk burada, detector’ın yanlış sinyalini düzgün işlemesi; yani doğru çalışan downstream katman yanlış girdiyi büyütebilir.

## 5. Cüneyt Testi

“Cüneyt” küfür sözlüğünü biliyor ve bilerek hiçbir sözlük küfrünü kullanmıyor. Zekâyı nesne metaforuyla aşağılıyor, tehdidi “sonu iyi olmayacak” gibi kuruyor, övgü görünümünde alay ediyor veya hakareti Türkçe eklerle biçim değiştiriyor.

Bugünkü sonuç: Cüneyt’in yaratıcı hakaretlerinin **20/20’si**, tehditlerinin **10/10’u**, dolaylı hakaretlerinin **10/10’u** ve sarkazmlarının **10/10’u** uyarısız geçiyor. Üstelik Cüneyt başkasının sözünü alıntılayan masum kullanıcıyı şikâyet ettirebilir; çünkü alıntı vakalarının %90’ı yanlış uyarı aldı.

Kısa cevap: **Cüneyt detector’ı kırıyor.** Bunu on yeni kelime ekleyerek çözmüş gibi görünmek, yalnızca Cüneyt’in bir sonraki cümlesine kadar işe yarar.

## 6. Ürün Tezimiz Öldü mü?

**PARTIALLY**

Ölen veya en azından bu prototiple kanıtlanamayan tez: “Dengine’ın deterministik algoritması gerçek Türkçe zararlı dili güçlü biçimde tespit eder.” Veri bunu desteklemiyor.

Ayakta kalan tez: “Bir moderasyon sinyali geldiğinde kullanıcıya sonucu göndermeden önce göstermek, düzenleme seçeneği vermek, onaylanan davranışı açıklanabilir risk geçmişine çevirmek, kademeli müdahale uygulamak ve riskin zamanla düşmesini sağlamak daha şeffaf ve geri kazanılabilir bir etkileşim modelidir.” Seçilen 17 akışın tamamı bu mekanik zincirin tutarlı çalıştığını gösterdi.

Dolayısıyla darbe **A) detection layer** tarafına geldi. **B) şeffaf ön-uyarı + dinamik risk + kademeli müdahale + decay** tezini bu test doğrudan çürütmedi; fakat o tez, kaliteli bir detection sinyaline bağımlı.

## 7. Pivot Gerekiyor mu?

**MINOR ARCHITECTURAL REFRAME**

Dengine’ı “Türkçe hakaret bulan algoritma” diye anlatmayı bırakıp “farklı detection kaynaklarını kabul eden şeffaf moderasyon etkileşim ve risk çerçevesi” diye anlatmalıyız. Mevcut deterministik detector, bu çerçevenin açıklanabilir ve yerel çalışan **prototip adapter’ı** olmalı. Ürünün ana UX akışını, risk motorunu veya decay fikrini çöpe atacak major pivot gerekmiyor; iddiayı doğru katmana taşımak gerekiyor.

## 8. Yarışmada Ne Söylemeliyiz?

Savunulabilir konumlandırma:

> Dengine, moderasyon kararını kullanıcıdan saklamak yerine gönderim öncesinde görünür kılan; kullanıcıya düzenleme seçeneği veren; onaylanan ihlali açıklanabilir, kademeli ve zamanla geri kazanılabilir bir risk sürecine bağlayan etkileşim çerçevesidir. Mevcut prototip, bu akışı göstermek için sınırlı ve deterministik bir Türkçe detection adapter’ı kullanır. Hard test, adapter’ın yaratıcı dil ve bağlamda üretim seviyesinde olmadığını açıkça göstermiştir; üretim mimarisinde detection katmanı ayrı, değiştirilebilir ve bağımsız doğrulanabilir olmalıdır.

Bugün gerçekten var olanlar:

- On girdili ağırlıklı sözlük ve deterministik normalization/matching.
- Ön-gönderim uyarısı, Edit/Send Anyway seçimi.
- 0–100 risk, açıklanabilir geçmiş, eşikler, geçici kısıtlamalar ve decay.
- 65 otomatik test ve iki ayrı evaluation seti.

Bugün var olmayanlar:

- Genel Türkçe semantik hakaret anlayışı.
- Güvenilir tehdit, ima veya sarkazm tespiti.
- Alıntı ile saldırıyı ayıran bağlam modeli.
- Üretim ölçeğinde doğal veri doğrulaması veya gerçek NSosyal entegrasyonu.

“%94 F1 ile zararlı Türkçeyi yakalıyoruz” dememeliyiz. Doğru cümle: “Standart, dar ve in-domain sette %94,12 F1; ayrı hard adversarial sette %31,19 F1 gördük.”

## 9. Jüri Bizi Nereden Vurabilir?

1. **Soru:** Kullanıcı küfür etmeden aşağılıyorsa sistem ne yapıyor?  
   **Cevap:** Mevcut prototip adapter çoğunu kaçırıyor; hard sette yaratıcı hakaret recall’ı %0. Dengine’ın katkısı detection iddiası değil, detection sonrasındaki şeffaf ve geri kazanılabilir müdahale modeli. Production detector ayrı doğrulanmalı.

2. **Soru:** Tehditleri neden hiç yakalayamadınız?  
   **Cevap:** Prototip sözlüğü hakaret gösterimine odaklı ve tehdit semantiği içermiyor. Bunu saklamıyoruz: hard sette 0/10. Üretim için tehdit desenleri, bağlam ve insan incelemesi ayrı güvenlik gereksinimidir.

3. **Soru:** Alıntı yapan masum kullanıcı niye ceza riski görüyor?  
   **Cevap:** Adapter use-versus-mention ayrımı yapmıyor; alıntı setinde %90 yanlış pozitif çıktı. Ön-uyarı/Edit seçeneği yanlış cezayı azaltır ama detection hatasını çözmez; alıntı guard’ı ve itiraz akışı gerekir.

4. **Soru:** O zaman Dengine sadece küfür filtresi mi?  
   **Cevap:** Hayır. Küfür filtresi değiştirilebilir giriş katmanı. Dengine’ın ürün katkısı; sonuç önizleme, kullanıcı kararı, orantılı risk, kademeli müdahale, açıklanabilir geçmiş ve decay zincirinin birlikte tasarlanmasıdır.

5. **Soru:** Neden hard test bu kadar kötüyken projeyi gönderelim?  
   **Cevap:** Çünkü prototip, doğru detection sinyali altında etkileşim tezini çalışan kodla gösteriyor ve zayıf alanını ölçüp açıkça raporluyor. Ancak yalnızca iddialar düzeltilir ve detector üretim sistemi gibi sunulmazsa gönderilmelidir.

## 10. 24 Saat İçinde Ne Yapılmalı?

**P0**

- Sunum ve teknik rapordaki “moderasyon algoritması” dilini “Dengine framework + mevcut prototip detection adapter” olarak değiştir.
- Standard ve hard skorları yan yana, ayrı kapsamlarla göster; %94,12’yi tek başına kullanma.
- Jüri demosunda detector doğruluk gösterisi yerine ön-uyarı, Edit, Send Anyway, eşik ve decay zincirini ana hikâye yap.
- Tehdit recall %0 ve alıntı false-positive %90 sonuçlarını sınırlamalar bölümüne açıkça ekle.

**P1**

- Detection adapter arayüzünü mimari sözleşme olarak tanımla; yeni detector denemeleri UX/risk motoruna dokunmasın.
- Türkçe çekim ekleri, sınırlı tehdit kalıpları ve alıntı guard’ları için ayrı tasarım hazırla.
- Hard seti regression olarak koru; hiçbir iyileştirmeyi yalnızca bu 100 vakaya ezberletme. Yeni bir held-out set zorunlu olsun.

**P2**

- Daha büyük, doğal, bağımsız etiketlenmiş Türkçe veri ve birden fazla değerlendirici planla.
- Appeal/human-review, veri saklama ve mahremiyet gereksinimlerini production roadmap’e ekle.
- İleride farklı detection adapter’larını karşılaştır; bu karar için bugün ücretli veya uzaktaki bir AI servisi eklemek zorunlu değil.

## 11. Teknik Rapora Etkisi

Geçerli kalan iddialar:

- Deterministik normalization ve ağırlıklı on girdili sözlük gerçekten uygulanmıştır.
- Tespit edilen yorumda ceza yayın öncesi hesaplanır ve kullanıcıya gösterilir.
- Düzenle yolu ceza uygulamaz; Yine de Gönder ceza ve geçmiş kaydı üretir.
- Risk 0–100 aralığında sınırlanır; eşikler ve geçici müdahaleler yapılandırılmıştır.
- Decay formülü `R(t+d) = R(t) × 0,9^d` uygulanmıştır.
- 65/65 otomatik test geçmiştir.
- Seçilen 17 hard journey’de interaction/risk mantığı 17/17 geçmiştir.

Değişmesi gereken iddialar:

- “Dengine moderasyon algoritması Türkçe zararlı dili yakalar” yerine “prototip detection adapter belirli sözlük ve kaçınma biçimlerini yakalar” denmeli.
- Standard %94,12 F1 genel doğruluk gibi sunulmamalı; hard %31,19 F1 ile birlikte kapsamı belirtilmeli.
- “Bypass-resistant” ifadesi mutlak kullanılmamalı. Doğrusu: “belgelenmiş düşük karmaşıklıklı kaçınmaların bir bölümüne dayanıklı.”
- Tehdit, bağlam, sarkazm, alıntı ve Türkçe morfoloji production yeteneği olarak ima edilmemeli.
- Mimari diyagramın ilk kutusu “Detection Layer / Adapter” olmalı; Dengine etkileşim katmanından ayrılmalı.
- Gelecek çalışma bölümüne held-out doğrulama, insan incelemesi/itiraz ve privacy/retention eklenmeli.

## 12. CEO Decision

**SHIP WITH CHANGES.** Yarışmaya, güçlü Türkçe moderation detector’ı iddiasıyla değil, çalışan şeffaf müdahale ve geri kazanım framework’ü olarak çık. Standard ve hard sonuçları birlikte ve dürüstçe göster. Production detection kodunu son gece 100 vakaya ezberletme. P0 konumlandırma değişiklikleri yapılmadan ship etme.

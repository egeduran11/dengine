# Dengine Limitations

Dengine, yarışma demosu için kasıtlı olarak dar kapsamlı deterministic bir prototiptir. Aşağıdaki sınırlamalar saklanmamalı ve production etkinliği iddiasına dönüştürülmemelidir.

## Dil ve Bağlam

- Sözlük yalnızca 10 kanonik Türkçe demo girdisi içerir.
- Tam token sınırı false positive’i azaltırken `aptalsın`, `salaksın`, `pisliğin` gibi Türkçe ekli ihlalleri kaçırabilir.
- Turkish morphological analyzer yoktur.
- Alıntı, haber aktarma ve bir ifadeyi eleştirme bağlamı ayrıştırılmaz.
- İroni, sarcasm, örtük aşağılama ve ima anlaşılmaz.
- Reclaimed/slang kullanımı ve topluluk içi dil ayrıştırılmaz.
- Diyalekt, bölgesel kullanım ve code-switching kapsamlı değildir.
- Homograph, sesli harf silme, fonetik yazım ve ileri Unicode bypass eksiktir.
- Bir yorumun hedefi (kişiye mi fikre mi yöneldiği) semantik olarak çözülmez.
- Terimin kendine yöneltilmesi ile başka kullanıcıya yöneltilmesi ayrıştırılmaz.

## False Positive ve False Negative

- Gerçek değerlendirmede alıntı içeren 1/50 clean vaka false positive oldu.
- Türkçe ek alan 4/40 direct vaka kaçtı.
- İleri bypass içeren 4/40 obfuscated vaka kaçtı.
- Veri seti küçük olduğundan bu oranlar gerçek dünyaya genellenemez.

## Severity ve Politika

- Şiddet seviyeleri ve puanlar prototip politika parametreleridir; bilimsel validasyon değildir.
- Kültürel bağlam severity algısını değiştirebilir.
- En yüksek seviye + sınırlı ek ceza stratejisi anlaşılabilirlik için seçilmiştir; gerçek politika çalışması gerekir.
- Repeat-violation multiplier uygulanmamıştır.
- Kısıtlama süreleri jüri demosu için 15/45/90 saniyedir; production politika değeri değildir.
- 0–100 eşiği ve decay `λ=0.90` değeri kullanıcı çalışmasıyla doğrulanmamıştır.

## Ürün Kapsamı

- Tam sosyal ağ değildir.
- Gerçek authentication veya birden fazla kullanıcı yoktur.
- Admin, moderation review ve appeal paneli yoktur.
- NSosyal altyapısıyla entegrasyon yoktur.
- Gerçek post/recommendation graph, mesajlaşma, medya upload veya notification yoktur.
- Backend veya SQLite yoktur; browser `localStorage` kullanır.
- Tarayıcı verisi temizlenirse demo state kaybolur.
- Hosted deployment bu teslim kapsamında yapılmamıştır.

## İtiraz ve İnsan İncelemesi

Production sistemde kullanıcı itirazı, açıklama düzeltmesi, moderator override, audit trail, geri bildirim ve tekrar değerlendirme gerekir. Dengine prototipinde bu iş akışları yoktur. Yüksek etkili hesap kısıtlamaları yalnız deterministic sözlük sonucuyla otomatik ve itirazsız uygulanmamalıdır.

## Gizlilik

Risk geçmişi davranışsal veri sayılabilir. Production için şu kararlar gereklidir:

- Veri minimizasyonu
- Amaç sınırlaması
- Saklama ve otomatik silme süresi
- Kullanıcı görüntüleme/indirme/silme hakları
- Yetkili erişim ve audit
- Çocuk/genç kullanıcılar için ek koruma
- Güvenlik ve ihlal bildirimi
- Yasal dayanak ve aydınlatma

Prototip yalnız yerel demo verisi kullandığından bu politikaları uygulamaz.

## Değerlendirme Sınırı

Evaluation seti sentetik ve 130 vakadır. User study, A/B testi, davranış değişikliği, topluluk güvenliği artışı veya yanlış pozitiflerin kullanıcı etkisi ölçülmemiştir. Dengine’ın gerçek dünyada zararı azalttığı iddia edilmez.

## Bilinçli Olarak Yapılmayan İddialar

- “Dengine küfür filtrelemeyi icat etti.” denmez.
- “Dünyanın ilk şeffaf moderasyon sistemi.” denmez.
- “Bilimsel olarak doğrulandı.” denmez.
- “NSosyal ile entegre.” denmez.
- “Production-ready moderation.” denmez.

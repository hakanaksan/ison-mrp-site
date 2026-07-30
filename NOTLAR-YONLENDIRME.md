# Yönlendirme notları (vercel.json)

## /api/* → lisans portalı
Sahadaki **tüm kurulumlar** `https://mrp.ison.tr/api/event` adresine rapor ediyor — bu yol
uygulamanın içine gömülü (0.1.x'ten beri). Bu yüzden adres **asla değişmemeli**; portal başka
projede olsa da istekler buradan yönlendiriliyor.

`api/event.js` fonksiyonu **bilinçli silindi**: Vercel'de dosya sistemi rewrite'tan ÖNCE gelir.
Dosya dursaydı olaylar hâlâ eski depoya (ison-telemetry/events.txt) yazılır, portal veritabanı
boş kalırdı. Telemetri artık portalda: sürüm, lisans ve güncelleme durumu tek yerde.

## /lisans/ → portal arayüzü
Portal ayrı (private) Vercel projesidir; buradan yalnız yönlendirilir. `trailingSlash: true`
olduğu için `/lisans` → `/lisans/` yönlenir. Portalın varlık (css/js) ve gezinme yolları
**göreli** yazıldı, bu yüzden alt yolda sorunsuz çalışır; API çağrıları `/api/...` mutlak kalır
ve yine buradan portala düşer. Oturum çerezi tarayıcı açısından mrp.ison.tr'ye ait olur.

## Portal adresi değişirse
`vercel.json` içindeki üç `destination` satırını güncelleyin. Şu an: `ison-mrp-portal.vercel.app`

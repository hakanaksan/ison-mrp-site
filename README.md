# ISON MRP — Tanıtım Sitesi

`mrp.ison.tr` için statik tanıtım sitesi. Kendi kendine yeter: harici font/CDN yok,
tek CSS dosyası, sistem yazı yığını. Vercel'de barındırılır.

## Yapı

```
index.html          # tek sayfa (hero + özellikler + ekran vitrini + ETA + indirme)
site.css            # tüm stiller (açık zemin + #0a84ff mavi, macOS-vari)
img/                # ekran görüntüleri + logolar (ekran-*.png, isoncloud.png, etasql.png)
vercel.json         # asset cache + güvenlik başlıkları (statik, framework yok)
```

## Yerel önizleme

Herhangi bir statik sunucu yeter; kök = repo kökü:

```
npx serve .
# veya
python -m http.server 8080
```

## Vercel dağıtımı

- Bu repo Vercel projesine bağlıdır; `main`'e her push otomatik yayına gider (framework: **Other / static**, build komutu yok, output dizini = kök).
- Özel alan adı: **mrp.ison.tr** (Vercel → Project → Domains). DNS'te `mrp` alt alanı Vercel'e CNAME'lenir.

## Kurulum paketi (setup.exe) linki

İndirme butonu şu **GitHub Release asset** URL'sine işaret eder (repo şişmez, link hep aynı kalır):

```
https://github.com/hakanaksan/ison-mrp-site/releases/latest/download/ISON-MRP-Setup.exe
```

`releases/latest/download/...` daima **en yeni release**'in bu adlı asset'ini verir — yeni
sürüm yayınlandığında sitedeki linki değiştirmeye gerek yok.

**Yeni sürüm yayınlama (otomatik — önerilen):** ana repoda (`hakanaksan/ison-mrp`) tek komut:

```powershell
.\tools\publish-release.ps1 -Version 0.1.1 -Notes "Yenilikler..."
```

Bu; setup.exe'yi derler, imzalı `.isonupd`'yi üretir ve **her iki** repoya (bu site reposu +
`ison-mrp-releases`) release oluşturup asset'leri yükler. Site tarafında paketi otomatik olarak
`ISON-MRP-Setup.exe` adıyla en yeni release'e koyar → yukarıdaki link anında canlanır.
(PAT gerekir: Fine-grained, Contents: Read and write; iki repo. Ayrıntı: ana repo CLAUDE.md.)

**Elle yükleme (yedek):** bu repoda Release oluştur (tag `v0.1.x`), paketi **tam olarak
`ISON-MRP-Setup.exe`** adıyla asset olarak yükle.

Ana uygulama (kaynak/kurulum üretimi) AYRI repodadır: `hakanaksan/ison-mrp`.
Bu repo YALNIZCA tanıtım sitesidir — site güncellemeleri buraya yapılır.

## Telemetri (deneme/aktivasyon takibi, 2026-07-16 — depo: GitHub .txt)

`api/event.js`: uygulama sunucuları deneme/aktivasyon olayını buraya POST eder. Kişisel veri yok:
makine hash'i + sürüm + tarih. Depo = **GitHub'daki özel repoda düz metin dosyası**
(`hakanaksan/ison-telemetry` → `events.txt`, satır başına bir JSON olay) — Upstash/Redis gibi ekstra
servis YOK. Depo bağlanana kadar uç zarif no-op (`stored:false`; istemci asla etkilenmez).

Kurulum (tek seferlik, ~3 dk — hepsi GitHub + Vercel içinde):

1. **Özel repo aç**: github.com/new → ad `ison-telemetry` → **Private** → Create.
   (Boş kalabilir — ilk olay `events.txt`'yi kendisi oluşturur.)
2. **Yazma token'ı üret**: GitHub → Settings → Developer settings → **Fine-grained tokens** →
   Generate new token → Repository access: *Only select repositories* → `ison-telemetry` →
   Permissions → **Contents: Read and write** → üret, değeri kopyala.
   (Token YALNIZ bu repoya yazabilir — sızsa bile başka hiçbir şeye erişemez.)
3. **Vercel'e koy**: vercel.com → ison-mrp-site projesi → Settings → Environment Variables →
   `TELEMETRY_GITHUB_TOKEN` = token değeri (Production).
4. **Redeploy**: env değişikliği yeni deploy ister — Deployments → son deploy → ⋯ → Redeploy.
5. **Doğrulama**: bir olay geldiğinde `ison-telemetry` reposunda `events.txt` belirir; github.com'dan
   çıplak gözle okunur. Sayılar için ana repoda `node tools/stats.mjs` (indirme sayılarının yanına
   deneme/aktivasyon özetini de basar; kimlik Git Credential Manager'dan otomatik — ekstra env gerekmez).

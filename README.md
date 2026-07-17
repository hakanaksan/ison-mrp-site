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

## Telemetri (deneme/aktivasyon takibi, 2026-07-16)

`api/event.js` (uygulama sunucuları POST eder) + `api/stats.js` (satıcı okur). Kişisel veri yok:
makine hash'i + sürüm + tarih. Depo bağlanana kadar uçlar zarif no-op (istemci asla etkilenmez).

Kurulum (tek seferlik). Vercel'in Storage sekmesi artık yalnız Edge Config + Blob gösteriyor —
Redis, MARKETPLACE üzerinden gelir. İki yol (B daha garantili):

**Yol A — Vercel Marketplace:**
1. vercel.com → proje → Storage → (Marketplace bölümü / "Browse Marketplace") → "Upstash" ara →
   **Upstash for Redis** → ücretsiz plan → projeye bağla (Connect Project: ison-mrp-site).
2. Env'ler otomatik eklenir (adlar KV_REST_API_URL/KV_REST_API_TOKEN ya da UPSTASH_REDIS_REST_URL/TOKEN
   olabilir — api fonksiyonları İKİSİNİ de tanır).

**Yol B — doğrudan upstash.com (Vercel arayüzünden bağımsız, her zaman çalışır):**
1. upstash.com → ücretsiz hesap (GitHub ile giriş olur) → Create Database (Redis, Regional, en yakın bölge — ör. eu-central).
2. DB sayfasında **REST API** bölümünden `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini kopyala.
3. Vercel → proje → Settings → Environment Variables → bu iki değişkeni ekle (Production).

**Her iki yolda da devamı:**

4. Aynı yerde `STATS_KEY` env'i ekle — uzun rastgele değer üretmek için:
   `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`
5. Env değişiklikleri YENİ deploy ister: Deployments → son deploy → ⋯ → **Redeploy**.
6. Doğrulama: `https://mrp.ison.tr/api/stats?key=<STATS_KEY>` → `"configured":true` dönmeli.
7. Okuma: geliştirme makinesinde `ISON_TELEMETRY_STATS_KEY` env'ine aynı değeri koy →
   `node tools/stats.mjs` (ana repo) indirme sayılarının yanına deneme/aktivasyon sayılarını da basar.

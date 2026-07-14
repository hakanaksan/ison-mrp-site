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

**Yeni sürüm yayınlama:** bu repoda bir Release oluştur (ör. tag `v0.1.0`), kurulum paketini
**tam olarak `ISON-MRP-Setup.exe`** adıyla asset olarak yükle. Repo public olduğundan indirme
auth istemez. (Paket `tools/pack-installer.ps1` ile ana repoda üretilir:
`release\installer-stage\installer-out\ISON-MRP-Setup-<v>.exe` → yüklerken `ISON-MRP-Setup.exe`'ye adlandır.)

Ana uygulama (kaynak/kurulum üretimi) AYRI repodadır: `hakanaksan/ison-mrp`.
Bu repo YALNIZCA tanıtım sitesidir — site güncellemeleri buraya yapılır.

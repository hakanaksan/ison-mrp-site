# ISON MRP — Tanıtım Sitesi

`mrp.ison.tr` için statik tanıtım sitesi. Kendi kendine yeter: harici font/CDN yok,
tek CSS dosyası, sistem yazı yığını. Vercel'de barındırılır.

## Yapı

```
index.html          # tek sayfa (hero + özellikler + ekran vitrini + ETA + indirme)
site.css            # tüm stiller (açık zemin + #0a84ff mavi, macOS-vari)
img/                # ekran görüntüleri + logolar (ekran-*.png, isoncloud.png, etasql.png)
indir/
  OKUBENI.txt       # kurulum yönergesi
  ISON-MRP-Setup.exe  # ← kurulum paketi buraya konmalı (repoda YOK; aşağıya bak)
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

`index.html` içindeki indirme butonu `indir/ISON-MRP-Setup.exe`'ye işaret eder.
Paket ~41 MB olduğundan iki seçenek:

1. **Repoya koy**: `indir/ISON-MRP-Setup.exe` olarak commit et → Vercel doğrudan sunar (basit ama repo şişer).
2. **GitHub Release'ten sun** (önerilen): setup.exe'yi bu reponun bir Release'ine yükle,
   `index.html`'deki linki release asset URL'siyle değiştir (repo hafif kalır).

Ana uygulama (kaynak/kurulum üretimi) AYRI repodadır: `hakanaksan/ison-mrp`.
Bu repo YALNIZCA tanıtım sitesidir — site güncellemeleri buraya yapılır.

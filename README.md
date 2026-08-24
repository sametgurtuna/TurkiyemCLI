<p align="center">
  <img src="https://img.shields.io/npm/v/turkiyem?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" alt="npm version" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="node" />
  <img src="https://img.shields.io/npm/l/turkiyem?style=for-the-badge&color=blue" alt="license" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge" alt="platform" />
  <img src="https://img.shields.io/badge/tests-20%20passed-brightgreen?style=for-the-badge" alt="tests" />
</p>

<h1 align="center">🇹🇷 turkiyem</h1>

<p align="center">
  <strong>Türkiye'nin en kapsamlı terminal tabanlı toplu taşıma, akaryakıt, namaz vakitleri, trafik endeksi, deprem, vapur, hava durumu, su kesintisi, nöbetçi eczane ve elektrikli araç şarj istasyonu CLI aracı.</strong>
</p>

<p align="center">
  10 şehrin toplu taşıma verileri, 81 ilin nöbetçi eczaneleri & akaryakıt fiyatları, Diyanet namaz vakitleri, İBB canlı trafik endeksi, vapur seferleri, elektrikli araç şarj istasyonları (Open Charge Map), İZSU su kesintisi & baraj verileri, AFAD deprem bilgileri, Open-Meteo hava durumu, TCMB döviz kurları — hepsi tek bir <code>npm</code> paketi içinde.
</p>

---

## 📖 İçindekiler

- [Neden turkiyem?](#-neden-turkiyem)
- [Desteklenen Şehirler](#-desteklenen-şehirler)
- [Kurulum](#-kurulum)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Komut Referansı](#-komut-referansı)
  - [Şehir Seçimi](#şehir-seçimi)
  - [Toplu Taşıma (Hat & Sefer Saatleri)](#toplu-taşıma-hat--sefer-saatleri)
  - [Durak Sorgulama](#durak-sorgulama)
  - [Canlı Konum & Filo](#canlı-konum--filo)
  - [⛽ Akaryakıt Fiyatları (Benzin, Motorin, LPG)](#-akaryakıt-fiyatları-benzin-motorin-lpg)
  - [🕌 Namaz Vakitleri & Geri Sayım (Diyanet)](#-namaz-vakitleri--geri-sayım-diyanet)
  - [🚗 Canlı Trafik Yoğunluk Endeksi (İBB TKM)](#-canlı-trafik-yoğunluk-endeksi-ibb-tkm)
  - [🚢 Vapur Seferleri & İskeleler (Şehir Hatları & İZDENİZ)](#-vapur-seferleri--iskeleler-şehir-hatları--izdeniz)
  - [Sağlık & Nöbetçi Eczane (81 İl / EczaneAPI)](#sağlık--nöbetçi-eczane-81-il--eczaneapi)
  - [Elektrikli Araç Şarj İstasyonları (Open Charge Map)](#-elektrikli-araç-şarj-istasyonları-open-charge-map)
  - [İZSU (İzmir Su & Baraj)](#izsu-izmir-su--baraj)
  - [Deprem (AFAD)](#deprem-afad)
  - [Hava Durumu & Kalite (Open-Meteo)](#hava-durumu--kalite-open-meteo)
  - [Döviz Kurları (TCMB)](#döviz-kurları-tcmb)
  - [Yardımcı Komutlar](#yardımcı-komutlar)
- [Mimari & Proje Yapısı](#-mimari--proje-yapısı)
- [Kalıcı Disk Önbelleği](#-kalıcı-disk-önbelleği)
- [Otomatik Testler](#-otomatik-testler)
- [Geliştirme](#-geliştirme)
- [Lisans](#-lisans)

---

## 🎯 Neden turkiyem?

Türkiye'de toplu taşıma ve kamu verileri onlarca farklı belediye sitesi, API ve veri formatına dağılmış durumda. **turkiyem**, bu dağınık verileri modern, hızlı ve renkli bir CLI arayüzü altında birleştirir:

- 🔎 Tarayıcı açmadan **hat ve durak tarifeleri** sorgulama (10 şehir)
- 📍 Terminal üzerinden **anlık canlı araç takibi** ve durak adları (İstanbul, Bursa)
- ⛽ **Güncel akaryakıt fiyatları** (Benzin 95, Motorin, LPG - 81 il ve ilçe karşılaştırması)
- 🕌 **Diyanet namaz vakitleri** ve bir sonraki vakte canlı geri sayım sayacı
- 🚗 **İBB canlı trafik yoğunluk endeksi** (% oran ve ASCII durum çubuğu)
- 🚢 **Vapur hatları ve iskeleleri** (İstanbul Şehir Hatları & İzmir İZDENİZ)
- 💊 **81 ilin nöbetçi eczaneleri**, çalışma saatleri ve telefonları
- ⚡ **Elektrikli araç şarj istasyonları** (ZES, Trugo, Eşarj vb. soket güçleri ve fiyatları)
- 💧 **İZSU arıza/su kesintileri** ve baraj doluluk oranları
- 🌍 **AFAD deprem bildirimleri** ve kritik sarsıntı uyarı tabloları
- ⛅ **Hava durumu** ve **hava kalitesi** (PM10, PM2.5, CO, NO₂)
- 💱 **TCMB döviz kurları** tek komutla
- ⚡ **Kalıcı disk önbelleği** sayesinde anında hızlı yanıtlar
- 🖥️ Windows, macOS, Linux, Sunucu ve Raspberry Pi ortamlarında sorunsuz çalışır

---

## 🏙️ Desteklenen Şehirler

| Şehir | Kaynak | Hat | Durak | Canlı Konum | Eczane | Akaryakıt | Namaz | Vapur / Şarj |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **İstanbul** | IETT (GTFS + SOAP) & İBB TKM | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Trafik, Vapur, Şarj |
| **Ankara** | EGO Genel Müdürlüğü | ✅ | — | — | ✅ | ✅ | ✅ | Şarj |
| **İzmir** | ESHOT GTFS & İZSU & İZDENİZ | ✅ | ✅ | — | ✅ | ✅ | ✅ | İZSU, İZDENİZ, Şarj |
| **Adana** | Adana BB (Next.js REST API) | ✅ | ✅ | — | ✅ | ✅ | ✅ | Şarj |
| **Antalya** | Antalya Büyükşehir Belediyesi | ✅ | ✅ | — | ✅ | ✅ | ✅ | Şarj |
| **Bursa** | Burulaş (Bursakart API) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Şarj |
| **Trabzon** | Trabzon Büyükşehir Belediyesi | ✅ | — | — | ✅ | ✅ | ✅ | Şarj |
| **Samsun** | Samulaş | ✅ | ✅ | — | ✅ | ✅ | ✅ | Şarj |
| **Mersin** | Mersin Büyükşehir Belediyesi | ✅ | — | — | ✅ | ✅ | ✅ | Şarj |
| **Kayseri** | Kayseri BB Açık Veri | — | — | — | ✅ | ✅ | ✅ | Şarj |

---

## 📦 Kurulum

### Global Kurulum (Önerilen)

```bash
npm install -g turkiyem
```

Kurulumdan sonra herhangi bir terminalde:

```bash
turkiyem
```

### Projeyi Kaynak Koddan Çalıştırma

```bash
git clone https://github.com/sametgurtuna/TurkiyemCLI.git
cd TurkiyemCLI
npm install
npm link   # Global olarak `turkiyem` komutunu aktif eder
```

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Sürekli oturum menüsünü aç (Önerilen)
turkiyem menu

# 2. Şehir seç (İnteraktif liste veya doğrudan isimle)
turkiyem sehir istanbul

# 3. Akaryakıt fiyatlarını kontrol et
turkiyem yakit

# 4. Namaz vakitlerini ve iftar/sıradaki vakti gör
turkiyem namaz

# 5. İstanbul canlı trafik durumunu incele
turkiyem trafik

# 6. Vapur hatlarını listele
turkiyem vapur

# 7. Hat sorgula
turkiyem hat 500T

# 8. Nöbetçi eczaneleri listele
turkiyem eczane nobetci
```

---

## 📚 Komut Referansı

### Şehir Seçimi

```bash
turkiyem sehir                # 10 şehri açıklamalarıyla listeleyen interaktif menüyü açar
turkiyem sehir istanbul       # Şehri İstanbul olarak ayarlar
turkiyem sehir ankara         # Şehri Ankara olarak ayarlar
turkiyem sehir izmir          # Şehri İzmir olarak ayarlar
turkiyem sehir bursa          # Şehri Bursa olarak ayarlar
```

### ⛽ Akaryakıt Fiyatları (Benzin, Motorin, LPG)

```bash
# Büyük Şehirler Karşılaştırması (İstanbul, Ankara, İzmir, Bursa, Antalya, Adana)
turkiyem yakit
turkiyem benzin

# İl ve İlçe Bazlı Detaylı Pompa Fiyatları
turkiyem yakit ankara
turkiyem yakit 34             # Plaka kodu ile sorgulama
turkiyem yakit izmir
```

### 🕌 Namaz Vakitleri & Geri Sayım (Diyanet)

```bash
# Seçili Şehrin Namaz Vakitleri & Sıradaki Vakte Kalan Süre
turkiyem namaz

# Şehir Bazlı Namaz Vakitleri ve Hicri Takvim Tarihi
turkiyem namaz istanbul
turkiyem namaz konya
turkiyem namaz diyarbakir
```

### 🚗 Canlı Trafik Yoğunluk Endeksi (İBB TKM)

```bash
# İBB Anlık Trafik Yüzdesi, İlerleme Çubuğu ve Durum Notu
turkiyem trafik
```

### 🚢 Vapur Seferleri & İskeleler (Şehir Hatları & İZDENİZ)

```bash
# İstanbul Şehir Hatları Ana Hatları, Sefer Sıklığı ve Süreleri
turkiyem vapur
turkiyem vapur istanbul

# İzmir İZDENİZ İskeleleri ve Yolcu / Arabalı Vapur Tipleri
turkiyem vapur izmir
```

### Toplu Taşıma (Hat & Sefer Saatleri)

```bash
# İstanbul (IETT) — GTFS özeti + Planlanan sefer saatleri
turkiyem sehir istanbul
turkiyem hat 500T

# Adana (REST API) — Hat bilgisi + kalkış saatleri + duraklar
turkiyem sehir adana
turkiyem hat 105

# Mersin — Hafta içi, Cumartesi ve Pazar hareket saatleri
turkiyem sehir mersin
turkiyem hat 10M

# Antalya — Gün ve yön seçimli tarife ve güzergah
turkiyem sehir antalya
turkiyem hat KL08

# Bursa (Burulaş) — Hat durakları ve yön seçimi
turkiyem sehir bursa
turkiyem hat B24

# İzmir (ESHOT GTFS) — Durak listesi ve ilk duraktan kalkış saatleri
turkiyem sehir izmir
turkiyem hat 34
```

### Durak Sorgulama

```bash
turkiyem sehir adana && turkiyem durak 43681
turkiyem sehir antalya && turkiyem durak 10142
turkiyem sehir bursa && turkiyem durak 5678
turkiyem sehir izmir && turkiyem durak konak
```

### Canlı Konum & Filo

```bash
# İstanbul (IETT) — Anlık araç konumları ve durağın adı
turkiyem sehir istanbul
turkiyem hat canli 34AS          # Özet (aktif araç sayısı, yön dağılımı)
turkiyem hat canli 34AS --detay  # Detay (araç bazlı kapı no, koordinat, yakın durak adı)

# Bursa (Burulaş) — Anlık araç konumları
turkiyem sehir bursa
turkiyem hat canli 17            # Plaka, hız, doluluk oranı
```

### Sağlık & Nöbetçi Eczane (81 İl / EczaneAPI)

```bash
# Nöbetçi Eczaneler (81 İl EczaneAPI veya İzmir/Kayseri Açık Veri)
turkiyem eczane nobetci                 # Seçili şehirdeki tüm nöbetçi eczaneler
turkiyem eczane nobetci kadikoy         # İlçe filtreli arama
turkiyem eczane nobetci -s ankara -t 2026-03-01 # Şehir ve tarih filtreli

# Eczane Detayı & İstatistikler
turkiyem eczane detay <eczaneId>        # Eczanenin sahibi, 24 saat durumu, çalışma saatleri ve harita
turkiyem eczane sehirler                # 81 ilin eczane ve ilçe istatistikleri
turkiyem eczane ilceler istanbul        # Belirtilen ilin ilçeleri ve eczane sayıları
turkiyem eczane yakin 41.0082 28.9784 5 # Koordinata en yakın nöbetçi eczaneler (5 km yarıçap)
turkiyem eczane key <API_KEY>           # EczaneAPI anahtarını yapılandır
```

### ⚡ Elektrikli Araç Şarj İstasyonları (Open Charge Map)

```bash
turkiyem sarj saglayicilar               # Tüm şarj sağlayıcıları (ZES, Trugo, Eşarj, Voltrun, Tesla vb.)
turkiyem sarj ara kadikoy                # Kadıköy'deki şarj istasyonları
turkiyem sarj ara zes                    # ZES şarj istasyonları
turkiyem sarj detay 195432               # Soket tipleri (CCS/Type2), kW güç, AC/DC ve tarifeler
turkiyem sarj key <API_KEY>              # Open Charge Map API anahtarını yapılandır
```

### İZSU (İzmir Su & Baraj)

```bash
turkiyem izsu kesinti            # Güncel su kesintileri
turkiyem izsu baraj              # Baraj doluluk oranları ve su üretimi
turkiyem izsu uretim             # Günlük su üretimi
turkiyem izsu sube               # İZSU şubeleri
turkiyem izsu analiz             # Haftalık su kalite analizleri
```

### Deprem (AFAD)

```bash
turkiyem deprem son24            # Son 24 saat depremleri (sayfalı)
turkiyem deprem son24 -l 10      # Son 24 saatteki ilk 10 depremi tek tabloda gösterir
turkiyem deprem 7gun -l 20       # Son 7 günde kaydedilen ilk 20 deprem
turkiyem deprem buyukluk 4.0     # ≥ 4.0 büyüklüğündeki depremleri filtreler
```

### Hava Durumu & Kalite (Open-Meteo)

```bash
turkiyem hava guncel                    # Seçili şehrin anlık hava durumu
turkiyem hava guncel ankara             # Ankara güncel hava durumu
turkiyem hava saatlik izmir --gun 3     # 3 günlük saatlik tahmin + ASCII grafiği
turkiyem hava kalite istanbul           # PM10, PM2.5, CO, NO₂ değerleri
```

### Döviz Kurları (TCMB)

```bash
turkiyem doviz           # Popüler kurlar (USD, EUR, GBP, CHF vb.)
turkiyem doviz --tum     # Merkez Bankası'ndaki tüm döviz kurları
```

### Yardımcı Komutlar

```bash
turkiyem menu            # Sürekli oturum (REPL) modunu başlatır
turkiyem temizle         # Kalıcı disk önbelleğini ve ayarları sıfırlar
turkiyem help            # Kategorili komut yardımını gösterir
turkiyem help deprem     # Komutları kelimeye göre filtreleyerek arar
turkiyem --version       # Sürüm numarasını basar
```

---

## 🏗️ Mimari & Proje Yapısı

Proje, temiz mimari (Clean Architecture) ve modüler tasarım prensiplerine uygun olarak organize edilmiştir:

```text
turkiyem/
├── src/
│   ├── index.js                    # CLI ana giriş noktası (Commander.js)
│   ├── commands/                   # Kullanıcı komut yöneticileri
│   │   ├── sehir.js                # Şehir seçici (İnteraktif)
│   │   ├── hat.js                  # Şehir hat sorgulayıcıları
│   │   ├── durak.js                # Durak sorgulayıcıları
│   │   ├── yakit.js                # Akaryakıt (Benzin, Motorin, LPG) komutları
│   │   ├── namaz.js                # Diyanet namaz vakitleri & geri sayım
│   │   ├── trafik.js               # İBB canlı trafik endeksi komutları
│   │   ├── vapur.js                # Şehir Hatları & İZDENİZ vapur komutları
│   │   ├── eczane.js               # Nöbetçi eczane komutları (EczaneAPI & Açık Veri)
│   │   ├── sarj.js                 # Elektrikli araç şarj istasyonu komutları (Open Charge Map)
│   │   ├── izsu.js                 # İZSU komutları
│   │   ├── deprem.js               # AFAD deprem komutları
│   │   ├── hava.js                 # Hava durumu komutları
│   │   ├── doviz.js                # TCMB döviz komutları
│   │   ├── ibb.js                  # İBB/İETT araç ve kaza komutları
│   │   ├── menu.js                 # REPL sürekli oturum modu
│   │   └── temizle.js              # Cache temizleme
│   ├── services/                   # Dış API ve veri çekim servisleri
│   │   ├── fuelService.js          # Opet / EPDK akaryakıt fiyat servisi
│   │   ├── prayerService.js        # Diyanet namaz vakitleri servisi
│   │   ├── trafficService.js       # İBB TKM canlı trafik endeks servisi
│   │   ├── vapurService.js         # Şehir Hatları & İZDENİZ iskele servisi
│   │   ├── adanaService.js         # Adana Next.js REST API
│   │   ├── egoService.js           # Ankara EGO servisi
│   │   ├── iettService.js          # İstanbul IETT GTFS + SOAP (Durak çözümleyici)
│   │   ├── izmirService.js         # İzmir ESHOT GTFS servisi
│   │   ├── izsuService.js          # İZSU açık veri servisi
│   │   ├── antalyaService.js       # Antalya belediye servisi
│   │   ├── bursaService.js         # Burulaş / Bursakart API
│   │   ├── trabzonService.js       # Trabzon belediye servisi
│   │   ├── samsunService.js        # Samulaş açık veri servisi
│   │   ├── mersinService.js        # Mersin belediye servisi
│   │   ├── eczaneService.js        # EczaneAPI & İzmir/Kayseri açık veri servisi
│   │   ├── sarjService.js          # Open Charge Map şarj sağlayıcı & istasyon servisi
│   │   ├── afadService.js          # AFAD deprem servisi
│   │   ├── weatherService.js       # Open-Meteo hava servisi
│   │   └── tcmbService.js          # TCMB döviz XML servisi
│   ├── displays/                   # Modüler tablo ve grafik göstericileri
│   │   ├── fuelDisplay.js          # Akaryakıt karşılaştırma tabloları
│   │   ├── prayerDisplay.js        # Namaz vakitleri & geri sayım kutusu
│   │   ├── trafficDisplay.js       # İBB trafik gösterge kartı
│   │   ├── vapurDisplay.js         # Vapur hatları & iskele tabloları
│   │   ├── earthquakeDisplay.js    # Deprem tabloları
│   │   ├── weatherDisplay.js       # Hava tabloları ve ASCII grafikleri
│   │   ├── financeDisplay.js       # Döviz tabloları
│   │   ├── pharmacyDisplay.js      # Eczane tabloları ve detayları
│   │   ├── sarjDisplay.js          # Şarj istasyon & soket tabloları
│   │   ├── izsuDisplay.js          # İZSU tabloları
│   │   └── transportDisplay.js     # Toplu taşıma & canlı filo tabloları
│   └── utils/                      # Ortak yardımcı araçlar
│       ├── cache.js                # İki kademeli kalıcı disk önbelleği
│       ├── httpClient.js           # Mojibake/UTF-8 çözücülü HTTP istemcisi
│       ├── display.js              # Display modülleri dışa aktarımı
│       ├── config.js               # Kullanıcı yapılandırması
│       ├── theme.js                # Tema ve ikon paleti
│       ├── banner.js               # ASCII banner & kategorili yardım
│       └── spinnerWrapper.js       # Spinner yardımcıları
├── tests/                          # Otomatik test paketi (node:test)
│   ├── cache.test.js               # Önbellek testleri
│   └── services.test.js            # Servis entegrasyon testleri (20 test)
└── package.json
```

---

## ⚡ Kalıcı Disk Önbelleği

`turkiyem`, tekrarlı isteklerde API sınırlarına takılmamak ve anında tepki vermek için **2 Kademeli Hibrit Önbellek** kullanır:

1. **Bellek İçi (RAM):** Aynı oturumda ultra hızlı erişim.
2. **Kalıcı Disk Depolama (`~/.turkiyem/cache/`):** CLI komutları arasında verileri diskte saklar ve TTL süresi dolunca otomatik yeniler.

Önbelleği sıfırlamak için:
```bash
turkiyem temizle
```

---

## 🧪 Otomatik Testler

Proje yerleşik `node:test` ve `node:assert` modülleri ile test edilir:

```bash
npm test
```

```text
✔ Cache utility operations (flush, set/get, TTL expiration)
✔ Mojibake UTF-8 decoder
✔ TCMB Exchange Rates Service
✔ AFAD Earthquake Service
✔ Open-Meteo Location Resolver
✔ Pharmacy Services (İzmir & Kayseri)
✔ Adana Transit REST API
✔ Antalya Transit Service
✔ Bursa Transit Service
✔ Trabzon Transit Service
✔ Samsun Transit Service
✔ Mersin Transit Service
✔ EV Charging Providers & Station Service (Open Charge Map)
✔ Fuel Prices Service (Opet)
✔ Prayer Times Service (Diyanet)
✔ IBB Traffic Index Service
✔ Ferry Services (IZDENIZ & Sehir Hatlari)
ℹ tests 20 | pass 20 | fail 0 (100% Başarı)
```

---

## 🔧 Geliştirme

```bash
git clone https://github.com/sametgurtuna/TurkiyemCLI.git
cd TurkiyemCLI
npm install
npm test
npm link
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) altında lisanslanmıştır.

<p align="center">
  Geliştirici: <strong><a href="https://github.com/sametgurtuna">Samet Gürtuna</a></strong><br>
  <sub>Built with ❤️ for Türkiye 🇹🇷</sub>
</p>

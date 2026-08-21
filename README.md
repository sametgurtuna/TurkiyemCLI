<p align="center">
  <img src="https://img.shields.io/npm/v/turkiyem?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" alt="npm version" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="node" />
  <img src="https://img.shields.io/npm/l/turkiyem?style=for-the-badge&color=blue" alt="license" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge" alt="platform" />
  <img src="https://img.shields.io/badge/tests-15%20passed-brightgreen?style=for-the-badge" alt="tests" />
</p>

<h1 align="center">🇹🇷 turkiyem (v1.12.0)</h1>

<p align="center">
  <strong>Türkiye'nin en kapsamlı terminal tabanlı toplu taşıma, deprem, hava durumu, su kesintisi ve ekonomi CLI aracı.</strong>
</p>

<p align="center">
  10 şehrin toplu taşıma verileri, güncel nöbetçi eczaneler, İZSU su kesintisi & baraj verileri, AFAD deprem bilgileri, Open-Meteo hava durumu, TCMB döviz kurları — hepsi tek bir <code>npm</code> paketi içinde.
</p>

---

## 📖 İçindekiler

- [Neden turkiyem?](#-neden-turkiyem)
- [Desteklenen Şehirler](#-desteklenen-şehirler)
- [Özellikler](#-özellikler)
- [Kurulum](#-kurulum)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Komut Referansı](#-komut-referansı)
  - [Şehir Seçimi](#şehir-seçimi)
  - [Hat Sorgulama](#hat-sorgulama)
  - [Durak Sorgulama](#durak-sorgulama)
  - [Canlı Konum & Filo](#canlı-konum--filo)
  - [İZSU (İzmir Su & Baraj)](#izsu-izmir-su--baraj)
  - [Sağlık & Nöbetçi Eczane](#sağlık--nöbetçi-eczane)
  - [Deprem (AFAD)](#deprem-afad)
  - [Hava Durumu & Kalite](#hava-durumu--kalite)
  - [Döviz Kurları (TCMB)](#döviz-kurları-tcmb)
  - [Yardımcı Komutlar](#yardımcı-komutlar)
- [Veri Kaynakları & Lisanslar](#-veri-kaynakları--lisanslar)
- [Mimari & Proje Yapısı](#-mimari--proje-yapısı)
- [Yapılandırma & Kalıcı Disk Önbelleği](#-yapılandırma--kalıcı-disk-önbelleği)
- [Otomatik Testler](#-otomatik-testler)
- [Geliştirme & Yayınlama](#-geliştirme--yayınlama)
- [Lisans](#-lisans)

---

## 🎯 Neden turkiyem?

Türkiye'de toplu taşıma ve kamu verileri onlarca farklı belediye sitesi, API ve veri formatına dağılmış durumda. **turkiyem**, bu dağınık verileri modern ve renkli bir CLI arayüzü altında birleştirir:

- 🔎 Tarayıcı açmadan **hat ve durak tarifeleri** sorgulama
- 📍 Terminal üzerinden **anlık canlı araç takibi** (İstanbul, Bursa)
- 💧 **İZSU arıza/su kesintileri** ve baraj doluluk oranları
- 💊 Anlık **nöbetçi eczane** sorgulama (İzmir, Kayseri vb.)
- 🌍 **AFAD deprem bildirimleri** ve kritik sarsıntı uyarı kutuları
- ⛅ **Hava durumu** ve **hava kalitesi** (API key gerektirmeden)
- 💱 **TCMB döviz kurları** tek komutla
- ⚡ **Kalıcı disk önbelleği** sayesinde anında hızlı yanıtlar
- 🖥️ Windows, macOS, Linux, Sunucu ve Raspberry Pi ortamlarında sorunsuz çalışır

---

## 🏙️ Desteklenen Şehirler

| Şehir | Kaynak | Hat | Durak | Canlı Konum | Sefer Saatleri | Eczane / Su |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **İstanbul** | IETT (GTFS + SOAP) | ✅ | ✅ | ✅ | ✅ | Garaj & Kaza |
| **Ankara** | EGO Genel Müdürlüğü | ✅ | — | — | ✅ | — |
| **İzmir** | ESHOT GTFS & İZSU | ✅ | ✅ | — | ✅ | Eczane & İZSU |
| **Adana** | Adana BB (Next.js REST API) | ✅ | ✅ | — | ✅ | — |
| **Antalya** | Antalya Büyükşehir Belediyesi | ✅ | ✅ | — | ✅ | — |
| **Bursa** | Burulaş (Bursakart API) | ✅ | ✅ | ✅ | ✅ | — |
| **Trabzon** | Trabzon Büyükşehir Belediyesi | ✅ | — | — | ✅ | — |
| **Samsun** | Samulaş | ✅ | ✅ | — | ✅ | — |
| **Mersin** | Mersin Büyükşehir Belediyesi | ✅ | — | — | ✅ | — |
| **Kayseri** | Kayseri BB Açık Veri | — | — | — | — | Nöbetçi Eczane |

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
git clone https://github.com/<kullanici>/TurkiyemCLI.git
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

# 3. Hat sorgula
turkiyem hat 500T

# 4. Su kesintisi kontrol et
turkiyem izsu kesinti

# 5. Nöbetçi eczaneleri listele
turkiyem eczane nobetci

# 6. Deprem kontrol et
turkiyem deprem son24 -l 5

# 7. Döviz kurlarını getir
turkiyem doviz
```

---

## 📚 Komut Referansı

### Şehir Seçimi

```bash
turkiyem sehir                # 10 şehri açıklamalarıyla listeleyen interaktif menüyü açar
turkiyem sehir istanbul       # Şehri İstanbul olarak ayarlar
turkiyem sehir ankara         # Şehri Ankara olarak ayarlar
turkiyem sehir izmir          # Şehri İzmir olarak ayarlar
turkiyem sehir adana          # Şehri Adana olarak ayarlar
turkiyem sehir antalya        # Şehri Antalya olarak ayarlar
turkiyem sehir bursa          # Şehri Bursa olarak ayarlar
turkiyem sehir trabzon        # Şehri Trabzon olarak ayarlar
turkiyem sehir samsun         # Şehri Samsun olarak ayarlar
turkiyem sehir mersin         # Şehri Mersin olarak ayarlar
turkiyem sehir kayseri        # Şehri Kayseri olarak ayarlar
```

### Hat Sorgulama

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

# Trabzon — Gidiş ve dönüş yönlü hareket saatleri
turkiyem sehir trabzon
turkiyem hat 121

# Samsun (Samulaş) — Hat bilgisi ve durak listesi
turkiyem sehir samsun
turkiyem hat R28
```

### Durak Sorgulama

```bash
# Adana — Durak detayı ve geçen hatlar
turkiyem sehir adana
turkiyem durak 43681

# Antalya — Durak tarifesi
turkiyem sehir antalya
turkiyem durak 10142

# Bursa — Durağa yaklaşan araçlar ve kalan süreler
turkiyem sehir bursa
turkiyem durak 5678

# İzmir — Durak arama ve kalkışlar
turkiyem sehir izmir
turkiyem durak konak
```

### Canlı Konum & Filo

```bash
# İstanbul (IETT) — Anlık araç konumları
turkiyem sehir istanbul
turkiyem hat canli 34AS          # Özet (aktif araç sayısı, yön dağılımı)
turkiyem hat canli 34AS --detay  # Detay (araç bazlı kapı no, koordinat, yakın durak)

# Bursa (Burulaş) — Anlık araç konumları
turkiyem sehir bursa
turkiyem hat canli 17            # Plaka, hız, doluluk oranı

# İBB Garaj ve Kaza Bilgileri
turkiyem ibb garaj               # İstanbul'daki 86 garajı listeler
turkiyem ibb kaza                # Güncel kaza lokasyonları
```

### İZSU (İzmir Su & Baraj)

```bash
turkiyem izsu kesinti            # Güncel su kesintileri
turkiyem izsu baraj              # Baraj doluluk oranları ve su üretimi
turkiyem izsu uretim             # Günlük su üretimi
turkiyem izsu sube               # İZSU şubeleri
turkiyem izsu analiz             # Haftalık su kalite analizleri
```

### Sağlık & Nöbetçi Eczane (EczaneAPI & Açık Veri)

```bash
# Nöbetçi Eczaneler (81 İl EczaneAPI veya İzmir/Kayseri Açık Veri)
turkiyem eczane nobetci                 # Seçili şehirdeki tüm nöbetçi eczaneler
turkiyem eczane nobetci kadikoy         # İlçe filtreli arama (örn: Kadıköy, Karşıyaka, Melikgazi)
turkiyem eczane nobetci -s ankara -t 2026-03-01 # Şehir ve tarih filtreli

# Eczane Detayı & İstatistikler
turkiyem eczane detay <eczaneId>        # Eczanenin sahibi, 24 saat durumu, çalışma saatleri ve harita
turkiyem eczane sehirler                # 81 ilin eczane ve ilçe istatistikleri
turkiyem eczane ilceler istanbul        # Belirtilen ilin ilçeleri ve eczane sayıları
turkiyem eczane yakin 41.0082 28.9784 5 # Koordinata en yakın nöbetçi eczaneler (5 km yarıçap)

# API Anahtarı Tanımlama (81 İl için https://eczaneapi.com)
turkiyem eczane key <API_KEY>           # EczaneAPI anahtarını yapılandır
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
turkiyem help            # Komut yardımını gösterir
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
│   │   ├── izsu.js                 # İZSU komutları
│   │   ├── deprem.js               # AFAD deprem komutları
│   │   ├── hava.js                 # Hava durumu komutları
│   │   ├── doviz.js                # TCMB döviz komutları
│   │   ├── eczane.js               # Nöbetçi eczane komutları
│   │   ├── ibb.js                  # İBB/İETT araç ve kaza komutları
│   │   ├── menu.js                 # REPL sürekli oturum modu
│   │   └── temizle.js              # Cache temizleme
│   ├── services/                   # Dış API ve veri çekim servisleri
│   │   ├── adanaService.js         # Adana Next.js REST API
│   │   ├── egoService.js           # Ankara EGO servisi
│   │   ├── iettService.js          # İstanbul IETT GTFS + SOAP
│   │   ├── izmirService.js         # İzmir ESHOT GTFS servisi
│   │   ├── izsuService.js          # İZSU açık veri servisi
│   │   ├── antalyaService.js       # Antalya belediye servisi
│   │   ├── bursaService.js         # Burulaş / Bursakart API
│   │   ├── trabzonService.js       # Trabzon belediye servisi
│   │   ├── samsunService.js        # Samulaş açık veri servisi
│   │   ├── mersinService.js        # Mersin belediye servisi
│   │   ├── eczaneService.js        # İzmir & Kayseri eczane servisleri
│   │   ├── afadService.js          # AFAD deprem servisi
│   │   ├── weatherService.js       # Open-Meteo hava servisi
│   │   └── tcmbService.js          # TCMB döviz XML servisi
│   ├── displays/                   # Modüler tablo ve grafik göstericileri
│   │   ├── earthquakeDisplay.js    # Deprem tabloları
│   │   ├── weatherDisplay.js       # Hava tabloları ve ASCII grafikleri
│   │   ├── financeDisplay.js       # Döviz tabloları
│   │   ├── pharmacyDisplay.js      # Eczane tabloları
│   │   ├── izsuDisplay.js          # İZSU tabloları
│   │   └── transportDisplay.js     # Toplu taşıma & canlı filo tabloları
│   └── utils/                      # Ortak yardımcı araçlar
│       ├── cache.js                # İki kademeli kalıcı disk önbelleği
│       ├── httpClient.js           # Mojibake/UTF-8 çözücülü HTTP istemcisi
│       ├── display.js              # Display modülleri dışa aktarımı
│       ├── config.js               # Kullanıcı yapılandırması
│       ├── banner.js               # ASCII banner
│       └── spinnerWrapper.js       # Spinner yardımcıları
├── tests/                          # Otomatik test paketi (node:test)
│   ├── cache.test.js               # Önbellek testleri
│   └── services.test.js            # Servis entegrasyon testleri
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
ℹ tests 15 | pass 15 | fail 0 (100% Başarı)
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) altında lisanslanmıştır.

<p align="center">
  <sub>Built with ❤️ for Türkiye 🇹🇷</sub>
</p>

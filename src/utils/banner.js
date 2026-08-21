import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { createRequire } from 'node:module';
import { colors, icons } from './theme.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const logo = `
  ████████╗██╗   ██╗██████╗ ██╗  ██╗██╗██╗   ██╗███████╗███╗   ███╗
  ╚══██╔══╝██║   ██║██╔══██╗██║ ██╔╝██║╚██╗ ██╔╝██╔════╝████╗ ████║
     ██║   ██║   ██║██████╔╝█████╔╝ ██║ ╚████╔╝ █████╗  ██╔████╔██║
     ██║   ██║   ██║██╔══██╗██╔═██╗ ██║  ╚██╔╝  ██╔══╝  ██║╚██╔╝██║
     ██║   ╚██████╔╝██║  ██║██║  ██╗██║   ██║   ███████╗██║ ╚═╝ ██║
     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
`;

const turkishFlagGradient = gradient(['#E30A17', '#ffffff', '#E30A17']);

function buildBanner() {
  const subtitle = `🇹🇷 Türkiye Toplu Taşıma, Deprem, Eczane, Şarj & Kamu Verileri CLI  ${chalk.dim(`v${pkg.version}`)}`;

  return [
    turkishFlagGradient(logo),
    '  ' + chalk.white.bold(subtitle),
    '',
  ].join('\n');
}

export function printBanner() {
  console.log(buildBanner());
}

export const CATEGORIES = [
  {
    title: 'Şehir & Genel Ayarlar',
    icon: icons.city,
    rows: [
      ['turkiyem sehir [şehir]', 'Şehir seç veya listele (10 şehir desteği)'],
      ['turkiyem menu', 'Sürekli interaktif oturum (REPL) modu'],
      ['turkiyem temizle', 'Kalıcı disk önbelleğini ve ayarları sıfırla'],
      ['turkiyem help', 'Tüm komutları kategorili listele'],
      ['turkiyem -v, --version', 'Sürüm numarasını göster'],
    ],
  },
  {
    title: 'Toplu Taşıma & Canlı Konum (10 Şehir)',
    icon: icons.route,
    rows: [
      ['turkiyem hat <numara>', 'Hat güzergahı ve sefer saatleri (10 şehir)'],
      ['turkiyem hat canli <numara> [-d]', 'Anlık canlı araç konumu ve harita (İstanbul, Bursa)'],
      ['turkiyem durak <id|isim>', 'Durağa yaklaşan araçlar ve geçen hatlar'],
    ],
  },
  {
    title: 'Sağlık & Nöbetçi Eczane (81 İl / EczaneAPI)',
    icon: icons.pharmacy,
    rows: [
      ['turkiyem eczane nobetci [ilçe]', 'Nöbetçi eczaneleri listele (81 il & İzmir/Kayseri)'],
      ['turkiyem eczane nobetci -s <il> -t <tarih>', 'Şehir ve tarih filtreli nöbetçi eczane sorgusu'],
      ['turkiyem eczane detay <eczaneId>', 'Eczane çalışma saatleri, telefon, sahip ve harita'],
      ['turkiyem eczane sehirler', '81 ilin eczane ve ilçe istatistikleri'],
      ['turkiyem eczane ilceler [şehir]', 'Şehrin tüm ilçelerini ve eczane sayılarını listele'],
      ['turkiyem eczane yakin <lat> <lng> [km]', 'Konuma en yakın nöbetçi eczaneler (Mesafe bazlı)'],
      ['turkiyem eczane key [apiKey]', 'EczaneAPI anahtarını kaydet veya kontrol et'],
      ['turkiyem eczane ara <kelime>', 'Eczane adı veya adresine göre arama yap'],
    ],
  },
  {
    title: 'Elektrikli Araç Şarj İstasyonları (sarj.dev)',
    icon: icons.charging,
    rows: [
      ['turkiyem sarj saglayicilar', 'Tüm şarj ağı işletmecileri (ZES, Trugo, Eşarj, Voltrun vb.)'],
      ['turkiyem sarj ara [sorgu]', 'Şehir, ilçe veya sağlayıcı adına göre şarj istasyonu ara'],
      ['turkiyem sarj detay <istasyonId>', 'Soket tipleri (CCS/Type2), güç (kW), AC/DC ve fiyatlar'],
    ],
  },
  {
    title: 'Akaryakıt Fiyatları (Benzin, Motorin, LPG)',
    icon: icons.fuel,
    rows: [
      ['turkiyem yakit', 'Türkiye büyük şehirler akaryakıt karşılaştırma tablosu'],
      ['turkiyem yakit <şehir|plaka>', 'İl ve ilçe bazlı güncel pompa satış fiyatları'],
    ],
  },
  {
    title: 'Namaz Vakitleri & Geri Sayım (Diyanet)',
    icon: icons.prayer,
    rows: [
      ['turkiyem namaz [şehir]', '81 il için güncel namaz vakitleri ve sıradaki vakte kalan süre'],
    ],
  },
  {
    title: 'Canlı Trafik Yoğunluk Endeksi (İBB TKM)',
    icon: icons.traffic,
    rows: [
      ['turkiyem trafik', 'İBB anlık trafik yoğunluk yüzdesi, durum kartı ve ilerleme çubuğu'],
    ],
  },
  {
    title: 'Vapur Seferleri & İskeleler (Şehir Hatları & İZDENİZ)',
    icon: icons.ferry,
    rows: [
      ['turkiyem vapur [istanbul]', 'İstanbul Şehir Hatları ana hatları, sefer sıklığı ve süreler'],
      ['turkiyem vapur izmir', 'İzmir İZDENİZ iskele listesi ve vapur tipleri'],
    ],
  },
  {
    title: 'İZSU (İzmir Su & Baraj)',
    icon: icons.water,
    rows: [
      ['turkiyem izsu kesinti', 'Güncel arıza ve su kesintileri'],
      ['turkiyem izsu baraj', 'Baraj ve kuyu doluluk oranları'],
      ['turkiyem izsu uretim [-g|-y]', 'Günlük / yıllık su üretimi dağılımı'],
      ['turkiyem izsu sube [-v]', 'İZSU şubeleri ve vezneleri'],
      ['turkiyem izsu analiz [-h|-c|-b]', 'Su kalitesi analiz raporları'],
    ],
  },
  {
    title: 'Deprem Bildirimleri (AFAD)',
    icon: icons.quake,
    rows: [
      ['turkiyem deprem son24 [-l 10]', 'Son 24 saatteki depremler (limit seçenekli)'],
      ['turkiyem deprem 7gun [-l 20]', 'Son 7 gündeki tüm depremler'],
      ['turkiyem deprem buyukluk <değer>', 'Büyüklüğe göre filtrele (örn: 4.0 ve üzeri)'],
    ],
  },
  {
    title: 'Hava Durumu & Kalite (Open-Meteo)',
    icon: icons.weather,
    rows: [
      ['turkiyem hava guncel [şehir|lat,lon]', 'Anlık sıcaklık, rüzgar ve hava durumu'],
      ['turkiyem hava saatlik [şehir] [-g 3]', 'Saatlik tahmin ve ASCII sıcaklık grafiği'],
      ['turkiyem hava kalite [şehir]', 'Hava kalitesi ölçümleri (PM10, PM2.5, CO, NO₂)'],
    ],
  },
  {
    title: 'Döviz Kurları (TCMB)',
    icon: icons.finance,
    rows: [
      ['turkiyem doviz', 'TCMB popüler kurlar (USD, EUR, GBP, CHF, Altın vb.)'],
      ['turkiyem doviz --tum', 'Merkez Bankası bültenindeki tüm döviz kurları'],
    ],
  },
  {
    title: 'İBB / İETT Servisleri (İstanbul)',
    icon: icons.ibb,
    rows: [
      ['turkiyem ibb hatlar [arama]', 'IETT hat listesini sorgula veya filtrele'],
      ['turkiyem ibb duraklar [arama]', 'IETT durak listesini sorgula veya ara'],
      ['turkiyem ibb filo', 'IETT filo araç konumlarını göster'],
      ['turkiyem ibb garaj', 'İstanbul\'daki 86 İETT garajını listele'],
      ['turkiyem ibb kaza', 'Güncel kaza ve yol çalışması lokasyonları'],
    ],
  },
];

function padCommand(cmd, width) {
  return cmd.length >= width ? cmd : cmd + ' '.repeat(width - cmd.length);
}

export function printHelp() {
  printBanner();

  const allCmds = CATEGORIES.flatMap((c) => c.rows.map(([cmd]) => cmd));
  const cmdWidth = Math.min(46, Math.max(...allCmds.map((c) => c.length)) + 2);

  for (const category of CATEGORIES) {
    console.log(colors.accentBold(`  ${category.icon}  ${category.title}`));
    for (const [cmd, desc] of category.rows) {
      console.log(`    ${colors.cyan(padCommand(cmd, cmdWidth))} ${colors.muted(desc)}`);
    }
    console.log('');
  }

  console.log(
    boxen(
      `${chalk.white('Yardım her zaman burada:')} ${colors.cyan('turkiyem help')}\n` +
      `${chalk.white('Kalıcı oturum için:')}      ${colors.cyan('turkiyem menu')}`,
      { padding: { left: 1, right: 1, top: 0, bottom: 0 }, borderColor: 'gray', borderStyle: 'round' }
    )
  );
  console.log('');
}

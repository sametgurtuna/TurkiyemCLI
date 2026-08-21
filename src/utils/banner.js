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
  const subtitle = `🇹🇷 Türkiye Toplu Taşıma, Deprem & Hava Durumu CLI  ${chalk.dim(`v${pkg.version}`)}`;

  return [
    turkishFlagGradient(logo),
    '  ' + chalk.white.bold(subtitle),
    '',
  ].join('\n');
}

export function printBanner() {
  console.log(buildBanner());
}

const CATEGORIES = [
  {
    title: 'Şehir & Genel',
    icon: icons.city,
    rows: [
      ['turkiyem sehir [şehir]', 'Şehir seç veya listele (istanbul, ankara, izmir, ...)'],
      ['turkiyem menu', 'Sürekli oturum (REPL) modunu başlat'],
      ['turkiyem temizle', 'Önbelleği ve ayarları sıfırla'],
      ['turkiyem --version', 'Sürüm numarasını göster'],
    ],
  },
  {
    title: 'Toplu Taşıma',
    icon: icons.route,
    rows: [
      ['turkiyem hat <numara>', 'Hat bilgisi ve sefer saatlerini sorgula'],
      ['turkiyem hat canli <numara> [--detay]', 'Canlı araç konumu (İstanbul, Bursa)'],
      ['turkiyem durak <id|isim>', 'Durak bazlı detay sorgula'],
    ],
  },
  {
    title: 'İBB / İETT',
    icon: icons.ibb,
    rows: [
      ['turkiyem ibb hatlar [arama]', 'IETT hat listesini sorgula/filtrele'],
      ['turkiyem ibb duraklar [arama]', 'IETT durak listesini sorgula/ara'],
      ['turkiyem ibb filo', 'IETT filo araç konumlarını göster'],
      ['turkiyem ibb garaj', 'IETT garaj bilgilerini göster'],
      ['turkiyem ibb kaza', 'Güncel kaza lokasyonlarını göster'],
    ],
  },
  {
    title: 'İZSU (İzmir Su & Baraj)',
    icon: icons.water,
    rows: [
      ['turkiyem izsu kesinti', 'Güncel su kesintileri'],
      ['turkiyem izsu baraj', 'Baraj ve kuyu doluluk oranları'],
      ['turkiyem izsu uretim [-g|-y]', 'Günlük/yıllık su üretimi dağılımı'],
      ['turkiyem izsu sube [-v]', 'İZSU şube ve vezneleri'],
      ['turkiyem izsu analiz [-h|-c|-b]', 'Su analiz raporları'],
    ],
  },
  {
    title: 'Deprem (AFAD)',
    icon: icons.quake,
    rows: [
      ['turkiyem deprem son24', 'Son 24 saatteki depremler'],
      ['turkiyem deprem 7gun', 'Son 7 gündeki depremler'],
      ['turkiyem deprem buyukluk <değer>', 'Büyüklüğe göre deprem filtrele'],
    ],
  },
  {
    title: 'Hava Durumu (Open-Meteo)',
    icon: icons.weather,
    rows: [
      ['turkiyem hava guncel [şehir|lat,lon]', 'Güncel hava durumu'],
      ['turkiyem hava saatlik [şehir|lat,lon] -g 2', 'Saatlik hava tahmini'],
      ['turkiyem hava kalite [şehir|lat,lon]', 'Hava kalitesi ölçümleri'],
    ],
  },
  {
    title: 'Sağlık & Döviz',
    icon: icons.pharmacy,
    rows: [
      ['turkiyem eczane nobetci [ilçe]', 'Nöbetçi eczaneleri sorgula (İzmir, Kayseri)'],
      ['turkiyem eczane ara <kelime>', 'Eczane adı/adresine göre ara'],
      ['turkiyem doviz [--tum]', 'TCMB güncel döviz kurları'],
    ],
  },
];

function padCommand(cmd, width) {
  return cmd.length >= width ? cmd : cmd + ' '.repeat(width - cmd.length);
}

export function printHelp() {
  printBanner();

  const allCmds = CATEGORIES.flatMap((c) => c.rows.map(([cmd]) => cmd));
  const cmdWidth = Math.min(44, Math.max(...allCmds.map((c) => c.length)) + 2);

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

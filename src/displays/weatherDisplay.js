import chalk from 'chalk';
import boxen from 'boxen';
import asciichart from 'asciichart';
import { createTable, terminalWidth, progressBar } from '../utils/ui.js';
import { colors, symbols, tableHead } from '../utils/theme.js';

/**
 * WMO hava durumu kodu → ikon + Türkçe açıklama.
 * Kaynak: Open-Meteo `weather_code` alanı.
 */
const WEATHER_CODES = {
  0: ['☀️', 'Açık'],
  1: ['🌤️', 'Az bulutlu'],
  2: ['⛅', 'Parçalı bulutlu'],
  3: ['☁️', 'Kapalı'],
  45: ['🌫️', 'Sisli'],
  48: ['🌫️', 'Kırağılı sis'],
  51: ['🌦️', 'Hafif çiseleme'],
  53: ['🌦️', 'Çiseleme'],
  55: ['🌧️', 'Yoğun çiseleme'],
  56: ['🌧️', 'Dondurucu çiseleme'],
  57: ['🌧️', 'Yoğun dondurucu yağış'],
  61: ['🌦️', 'Hafif yağmurlu'],
  63: ['🌧️', 'Yağmurlu'],
  65: ['🌧️', 'Kuvvetli yağmurlu'],
  66: ['🌧️', 'Dondurucu yağmur'],
  67: ['🌧️', 'Dondurucu sağanak'],
  71: ['🌨️', 'Hafif kar yağışlı'],
  73: ['🌨️', 'Kar yağışlı'],
  75: ['❄️', 'Yoğun kar yağışlı'],
  77: ['❄️', 'Kar taneleri'],
  80: ['🌦️', 'Hafif sağanak'],
  81: ['🌧️', 'Sağanak yağışlı'],
  82: ['⛈️', 'Şiddetli sağanak'],
  85: ['🌨️', 'Hafif kar sağanağı'],
  86: ['❄️', 'Yoğun kar sağanağı'],
  95: ['⛈️', 'Gök gürültülü'],
  96: ['⛈️', 'Dolulu fırtına'],
  99: ['⛈️', 'Şiddetli dolu'],
};

function describeWeather(code) {
  return WEATHER_CODES[code] || ['🌡️', 'Bilinmiyor'];
}

/**
 * Sıcaklığı aralığına göre renklendirir (soğuk mavi → sıcak kırmızı).
 */
function temperatureColor(value) {
  const t = Number(value);
  if (Number.isNaN(t)) return colors.muted;
  if (t <= 0) return chalk.blueBright;
  if (t <= 10) return chalk.cyan;
  if (t <= 20) return chalk.green;
  if (t <= 28) return chalk.yellow;
  if (t <= 35) return colors.orange;
  return colors.error;
}

function formatTemperature(value, { bold = false } = {}) {
  if (value === undefined || value === null) return colors.muted('-');
  const color = temperatureColor(value);
  const text = `${Number(value).toFixed(1)}°C`;
  return bold ? color.bold(text) : color(text);
}

/** `2026-08-21T14:00` → `14:00` */
function shortTime(isoTime) {
  if (!isoTime) return '-';
  const timePart = String(isoTime).split('T')[1];
  return timePart ? timePart.slice(0, 5) : String(isoTime);
}

/** `2026-08-21T14:00` → `21 Ağu 14:00` */
function shortDateTime(isoTime) {
  if (!isoTime) return '-';
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return String(isoTime);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getDate()} ${months[date.getMonth()]} ${shortTime(isoTime)}`;
}

/**
 * Güncel hava durumu kartı: büyük sıcaklık, durum ikonu ve destekleyici metrikler.
 */
export function createCurrentWeatherTable(result) {
  const current = result.current || {};
  const daily = result.daily || {};
  const [icon, description] = describeWeather(current.weatherCode);

  const header =
    `${colors.title(result.locationName || 'Bilinmeyen konum')}  ${colors.hint(symbols.bullet)}  ` +
    colors.muted(shortDateTime(current.time));

  const bigLine =
    `  ${icon}  ${formatTemperature(current.temperature, { bold: true })}  ` +
    `${colors.title(description)}`;

  const feels = current.apparentTemperature !== undefined && current.apparentTemperature !== null
    ? `${colors.muted('Hissedilen')} ${formatTemperature(current.apparentTemperature)}`
    : '';

  const minMax = daily.temperatureMin !== undefined && daily.temperatureMax !== undefined
    ? `${colors.muted('Bugün')} ${formatTemperature(daily.temperatureMin)} ${colors.hint('/')} ${formatTemperature(daily.temperatureMax)}`
    : '';

  const separator = `   ${colors.hint(symbols.bullet)}   `;

  const metricsLine =
    `${colors.muted('💨 Rüzgar')} ${colors.value(`${current.windSpeed ?? '-'} km/s`)}` +
    separator +
    `${colors.muted('💧 Nem')} ${colors.value(`%${current.humidity ?? '-'}`)}`;

  const sunLine = [
    daily.sunrise ? `${colors.muted('🌅 Doğuş')} ${colors.value(shortTime(daily.sunrise))}` : '',
    daily.sunset ? `${colors.muted('🌇 Batış')} ${colors.value(shortTime(daily.sunset))}` : '',
  ]
    .filter(Boolean)
    .join(separator);

  const secondary = [feels, minMax].filter(Boolean).join(`  ${colors.hint(symbols.bullet)}  `);

  const content = [
    header,
    '',
    bigLine,
    secondary ? `  ${secondary}` : '',
    '',
    `  ${metricsLine}`,
    sunLine ? `  ${sunLine}` : '',
    '',
    colors.hint(`  ${result.latitude}, ${result.longitude}  ${symbols.bullet}  ${result.timezone || '-'}`),
  ]
    .filter((line) => line !== '')
    .join('\n');

  return boxen(content, {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    borderColor: 'cyan',
    borderStyle: 'round',
  });
}

/**
 * Saatlik tahmin: ASCII sıcaklık grafiği + saat bazlı tablo.
 */
export function createHourlyWeatherTable(result) {
  const rows = result.rows || [];
  const table = createTable({
    head: tableHead('Saat', 'Durum', 'Sıcaklık', 'Hissedilen', 'Yağış'),
    colWidths: [14, 24, 12, 13, 18],
    compact: true,
  });

  const temperatures = [];

  for (const row of rows) {
    const [icon, description] = describeWeather(row.weatherCode);
    const rain = Number(row.precipitationProbability);
    const rainCell = Number.isNaN(rain)
      ? colors.muted('-')
      : `${(rain >= 50 ? chalk.blueBright : colors.muted)(`%${rain}`.padEnd(5))}${progressBar(rain, 8, rain >= 50 ? chalk.blueBright : colors.muted)}`;

    table.push([
      colors.value(shortDateTime(row.time)),
      `${icon}  ${colors.muted(description)}`,
      formatTemperature(row.temperature),
      formatTemperature(row.apparentTemperature),
      rainCell,
    ]);

    if (row.temperature !== undefined && row.temperature !== null) {
      temperatures.push(row.temperature);
    }
  }

  let chart = '';
  if (temperatures.length > 1) {
    // Grafik terminale sığsın diye örnekleri seyreltiyoruz.
    const maxPoints = Math.max(20, terminalWidth() - 14);
    const step = Math.max(1, Math.ceil(temperatures.length / maxPoints));
    const series = temperatures.filter((_, i) => i % step === 0);

    chart =
      `${colors.title('  Sıcaklık Eğrisi')} ${colors.hint(`(${result.forecastDays} günlük tahmin)`)}\n` +
      chalk.cyan(asciichart.plot(series, { height: 8, format: (x) => (`     ${x.toFixed(0)}°`).slice(-6) })) +
      '\n\n';
  }

  return chart + table.toString();
}

/** Kirletici seviyesini WHO/AB eşiklerine göre değerlendirir. */
function rateAirMetric(value, [good, moderate, poor]) {
  const v = Number(value);
  if (Number.isNaN(v)) return { label: '-', color: colors.muted, percent: 0 };
  if (v <= good) return { label: 'İyi', color: colors.success, percent: (v / poor) * 100 };
  if (v <= moderate) return { label: 'Orta', color: colors.warn, percent: (v / poor) * 100 };
  if (v <= poor) return { label: 'Hassas', color: colors.orange, percent: (v / poor) * 100 };
  return { label: 'Kötü', color: colors.error, percent: 100 };
}

/**
 * Hava kalitesi tablosu: her kirletici için değer, seviye etiketi ve çubuk.
 */
export function createAirQualityTable(result) {
  const current = result.current || {};

  const metrics = [
    ['PM10', current.pm10, 'µg/m³', [20, 50, 100]],
    ['PM2.5', current.pm25, 'µg/m³', [10, 25, 50]],
    ['CO', current.carbonMonoxide, 'µg/m³', [4000, 8000, 15000]],
    ['NO₂', current.nitrogenDioxide, 'µg/m³', [40, 100, 200]],
  ];

  const table = createTable({
    head: tableHead('Kirletici', 'Değer', 'Seviye', 'Ölçek'),
    colWidths: [14, 18, 14, 26],
  });

  for (const [name, value, unit, thresholds] of metrics) {
    const rating = rateAirMetric(value, thresholds);
    table.push([
      colors.label(name),
      value === undefined || value === null
        ? colors.muted('-')
        : colors.value(`${Number(value).toFixed(1)} ${unit}`),
      rating.color.bold(rating.label),
      progressBar(rating.percent, 18, rating.color),
    ]);
  }

  const header =
    `  ${colors.title(result.locationName || 'Bilinmeyen konum')}  ${colors.hint(symbols.bullet)}  ` +
    colors.muted(shortDateTime(current.time)) +
    `\n  ${colors.hint(`${result.latitude}, ${result.longitude}  ${symbols.bullet}  ${result.timezone || '-'}`)}\n`;

  return `${header}\n${table.toString()}`;
}

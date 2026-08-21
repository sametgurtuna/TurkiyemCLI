import chalk from 'chalk';

/**
 * Merkezi renk / ikon paleti. Banner, help, menu ve display modülleri
 * burada tanımlı sabitleri kullanarak görsel tutarlılığı korur.
 */
export const colors = {
  accent: chalk.hex('#E30A17'),      // Bayrak kırmızısı
  accentBold: chalk.hex('#E30A17').bold,
  title: chalk.white.bold,
  label: chalk.cyan,                 // Tablo satır etiketleri
  value: chalk.white,                // Tablo satır değerleri
  muted: chalk.gray,
  hint: chalk.dim,
  cyan: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  orange: chalk.hex('#FFA500'),      // Uyarı ile hata arası ara seviye
};

/**
 * Tablo başlıkları için ortak biçim — tüm display modülleri bunu kullanır.
 * @param {...string} labels
 * @returns {string[]}
 */
export function tableHead(...labels) {
  return labels.map((label) => chalk.white.bold(label));
}

/**
 * Sayısal bir değeri eşiklere göre renklendirir (düşük iyi → yüksek kötü).
 * @param {number} value
 * @param {{warn: number, danger: number}} thresholds
 */
export function severityColor(value, { warn, danger }) {
  if (value >= danger) return colors.error;
  if (value >= warn) return colors.orange;
  return colors.success;
}

export const icons = {
  city: '🏙️',
  route: '🚌',
  stop: '📍',
  live: '📡',
  quake: '🌍',
  weather: '⛅',
  finance: '💱',
  pharmacy: '💊',
  charging: '⚡',
  fuel: '⛽',
  prayer: '🕌',
  traffic: '🚗',
  ferry: '🚢',
  water: '💧',
  ibb: '🚏',
  clean: '🧹',
  help: '❓',
  exit: '👋',
  ok: '✔',
  fail: '✖',
};

/**
 * Kutu çizgileri, çubuklar ve durum işaretleri. Tek yerden değiştirilebilsin
 * diye display modülleri bu sabitleri kullanır.
 */
export const symbols = {
  ok: '✔',
  fail: '✖',
  info: 'ℹ',
  warn: '⚠',
  arrow: '❯',
  bullet: '•',
  line: '─',
  barFull: '█',
  barEmpty: '░',
  up: '▲',
  down: '▼',
  flat: '▬',
};

/**
 * Bölüm başlığı satırı basar. Örn: `─ 🚌 Hat Sorgulama ──────`
 * @param {string} label
 * @param {string} [icon]
 */
export function sectionHeader(label, icon = '') {
  const prefix = icon ? `${icon} ` : '';
  console.log('');
  console.log(colors.accentBold(`  ${prefix}${label}`));
  console.log(colors.muted('  ' + '─'.repeat(Math.min(58, label.length + 4))));
}

/**
 * Ortak ayraç çizgisi.
 */
export function divider(width = 60) {
  return colors.muted(symbols.line.repeat(width));
}

export default { colors, icons, symbols, tableHead, severityColor, sectionHeader, divider };

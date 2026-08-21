import chalk from 'chalk';

/**
 * Merkezi renk / ikon paleti. Banner, help, menu ve display modülleri
 * burada tanımlı sabitleri kullanarak görsel tutarlılığı korur.
 */
export const colors = {
  accent: chalk.hex('#E30A17'),      // Bayrak kırmızısı
  accentBold: chalk.hex('#E30A17').bold,
  title: chalk.white.bold,
  muted: chalk.gray,
  hint: chalk.dim,
  cyan: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
};

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
  return colors.muted('─'.repeat(width));
}

export default { colors, icons, sectionHeader, divider };

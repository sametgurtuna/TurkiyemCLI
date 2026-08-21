import Table from 'cli-table3';
import boxen from 'boxen';
import chalk from 'chalk';
import { colors, symbols } from './theme.js';

/**
 * Ortak UI yardımcıları: terminal genişliğine uyum sağlayan tablo fabrikası,
 * ilerleme çubukları, rozetler, boş durum kartları ve göreli zaman biçimlendirme.
 *
 * Display modülleri `new Table(...)` yerine buradaki `createTable(...)` fonksiyonunu
 * kullanır; böylece sabit `colWidths` değerleri dar terminallerde otomatik küçülür.
 */

const MIN_TERMINAL_WIDTH = 40;
const MAX_TERMINAL_WIDTH = 200;
const MIN_COLUMN_WIDTH = 6;

/**
 * Kullanılabilir terminal genişliği. TTY yoksa (pipe / dosyaya yazma) 100 varsayılır.
 * @returns {number}
 */
export function terminalWidth() {
  // TTY genişliği yoksa COLUMNS ortam değişkenine bakılır (pipe / CI / test).
  const cols = process.stdout?.columns || Number.parseInt(process.env.COLUMNS || '', 10);
  if (!cols || Number.isNaN(cols)) return 100;
  return Math.min(MAX_TERMINAL_WIDTH, Math.max(MIN_TERMINAL_WIDTH, cols));
}

/**
 * Verilen kolon genişliklerini terminale sığacak şekilde orantılı olarak küçültür.
 * Toplam zaten sığıyorsa değerler olduğu gibi döner.
 * @param {number[]} widths
 * @param {number} [available]
 * @returns {number[]}
 */
export function fitColumnWidths(widths, available = terminalWidth()) {
  if (!Array.isArray(widths) || widths.length === 0) return widths;

  const borders = widths.length + 1; // cli-table3 dikey çizgileri
  const budget = available - borders;
  const requested = widths.reduce((sum, w) => sum + w, 0);

  if (requested <= budget) return widths;
  // Minimumlar bile sığmıyorsa tabloyu zorlamak yerine tabana çekiyoruz.
  if (widths.length * MIN_COLUMN_WIDTH >= budget) {
    return widths.map(() => MIN_COLUMN_WIDTH);
  }

  const scaled = widths.map((w) => Math.max(MIN_COLUMN_WIDTH, Math.floor((w * budget) / requested)));

  // Aşağı yuvarlamadan kalan farkı en geniş kolonlara dağıt.
  let drift = budget - scaled.reduce((sum, w) => sum + w, 0);
  const order = scaled
    .map((w, i) => [w, i])
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i);

  let cursor = 0;
  while (drift > 0) {
    scaled[order[cursor % order.length]] += 1;
    cursor++;
    drift--;
  }
  while (drift < 0) {
    const idx = order[cursor % order.length];
    if (scaled[idx] > MIN_COLUMN_WIDTH) {
      scaled[idx] -= 1;
      drift++;
    }
    cursor++;
  }

  return scaled;
}

/**
 * cli-table3 tablosu oluşturur; `colWidths` verilmişse terminale göre ölçeklenir
 * ve ortak stil (gri kenarlık, kelime kaydırma) uygulanır.
 * @param {import('cli-table3').TableConstructorOptions} [options]
 */
export function createTable(options = {}) {
  const { colWidths, style, compact = false, chars, ...rest } = options;

  // `compact`: satır aralarındaki yatay ayraçları kaldırır. İçeriği tek satıra
  // sığan uzun listelerde (deprem, döviz, eczane) okunabilirliği artırır.
  const compactChars = compact
    ? { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
    : {};

  return new Table({
    wordWrap: true,
    ...rest,
    ...(colWidths ? { colWidths: fitColumnWidths(colWidths) } : {}),
    chars: { ...compactChars, ...(chars || {}) },
    style: { head: [], border: ['gray'], ...(style || {}) },
  });
}

/**
 * Etiket/değer çiftlerini gösteren dikey tablo (detay kartları için).
 * @param {Array<[string, string]>} pairs
 */
export function createKeyValueTable(pairs) {
  const width = terminalWidth();
  const labelWidth = Math.min(26, Math.max(14, Math.floor(width * 0.28)));
  const table = createTable({
    colWidths: [labelWidth, Math.max(MIN_COLUMN_WIDTH, width - labelWidth - 3)],
  });

  for (const [label, value] of pairs) {
    if (value === undefined || value === null || value === '') continue;
    table.push([colors.label(label), String(value)]);
  }

  return table.toString();
}

/**
 * Yüzdelik ilerleme çubuğu. `colorFn` verilmezse değere göre yeşil→sarı→kırmızı seçilir.
 * @param {number} percent 0-100
 * @param {number} [width]
 * @param {Function} [colorFn]
 */
export function progressBar(percent, width = 20, colorFn = null) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  const filled = Math.round((value / 100) * width);
  const color = colorFn || (value >= 80 ? colors.error : value >= 60 ? colors.warn : colors.success);
  return color(symbols.barFull.repeat(filled)) + colors.muted(symbols.barEmpty.repeat(width - filled));
}

/**
 * Renkli durum rozeti. kind: ok | warn | error | info | muted
 * @param {string} text
 * @param {'ok'|'warn'|'error'|'info'|'muted'} [kind]
 */
export function badge(text, kind = 'info') {
  const map = {
    ok: colors.success.bold,
    warn: colors.warn.bold,
    error: colors.error.bold,
    info: colors.cyan.bold,
    muted: colors.muted,
  };
  return (map[kind] || map.info)(` ${text} `);
}

/**
 * Sonuç bulunamadığında basılan bilgi kartı.
 * @param {string} message
 * @param {string} [hint] Kullanıcıya önerilen bir sonraki komut
 */
export function emptyState(message, hint = '') {
  const lines = [`${symbols.info}  ${colors.title(message)}`];
  if (hint) lines.push('', colors.muted(hint));

  return boxen(lines.join('\n'), {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    borderColor: 'yellow',
    borderStyle: 'round',
    width: Math.min(terminalWidth(), 80),
  });
}

/**
 * Hata kutusu — spinner ve komut hata çıktıları için ortak biçim.
 * @param {string} message
 * @param {string} [hint]
 */
export function errorBox(message, hint = '') {
  const lines = [`${colors.error.bold(symbols.fail)}  ${colors.error(message)}`];
  if (hint) lines.push('', colors.muted(hint));

  return boxen(lines.join('\n'), {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    borderColor: 'red',
    borderStyle: 'round',
    width: Math.min(terminalWidth(), 80),
  });
}

/**
 * Tablo üstüne basılan kompakt başlık: başlık + sağda meta bilgi + ayraç.
 * @param {string} title
 * @param {string} [meta] Sağa yaslanan ikincil bilgi (kayıt sayısı, güncelleme saati)
 * @param {string} [icon]
 */
export function heading(title, meta = '', icon = '') {
  const width = Math.min(terminalWidth(), 100);
  const left = `${icon ? `${icon}  ` : ''}${title}`;
  const gap = Math.max(1, width - left.length - meta.length - 2);
  const line =
    '  ' + colors.accentBold(left) + ' '.repeat(gap) + colors.muted(meta);

  return `\n${line}\n  ${colors.muted(symbols.line.repeat(Math.max(10, width - 2)))}`;
}

/**
 * Tarihi "3 dk önce" gibi göreli metne çevirir. Çözümlenemezse boş string döner.
 * @param {Date|string|number} input
 */
export function relativeTime(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return 'az sonra';
  if (seconds < 60) return `${seconds} sn önce`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;

  return `${Math.floor(months / 12)} yıl önce`;
}

/**
 * Sayfalama / kayıt sayısı gibi tablo altı özet satırı.
 * @param {string} text
 */
export function footnote(text) {
  return colors.hint(`  ${text}`);
}

export default {
  terminalWidth,
  fitColumnWidths,
  createTable,
  createKeyValueTable,
  progressBar,
  badge,
  emptyState,
  errorBox,
  heading,
  relativeTime,
  footnote,
  chalk,
};

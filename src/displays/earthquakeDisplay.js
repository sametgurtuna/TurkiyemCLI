import { createTable, relativeTime, progressBar } from '../utils/ui.js';
import { colors, tableHead } from '../utils/theme.js';

/**
 * Deprem büyüklüğünü seviyeye göre renklendirir.
 * < 3.0 sessiz, 3.0-3.9 dikkat, 4.0-4.9 belirgin, >= 5.0 kritik.
 */
function magnitudeColor(magnitude) {
  if (magnitude >= 5.0) return colors.error;
  if (magnitude >= 4.0) return colors.orange;
  if (magnitude >= 3.0) return colors.warn;
  return colors.muted;
}

/** AFAD tarih biçimini (`2026-08-21 10:00:00`) Date nesnesine çevirir. */
function parseQuakeDate(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `2026-08-21 10:34:12` → `21 Ağu 10:34` */
function formatQuakeDate(value) {
  const date = parseQuakeDate(value);
  if (!date) return String(value ?? '-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]} ${hh}:${mm}`;
}

export function createEarthquakeTable(earthquakes) {
  const table = createTable({
    head: tableHead('Zaman', 'Ne zaman', 'Büyüklük', 'Derinlik', 'Konum'),
    colWidths: [16, 14, 22, 12, 40],
    compact: true,
  });

  for (const eq of earthquakes) {
    const mag = parseFloat(eq.magnitude);
    const color = magnitudeColor(mag);
    const magText = Number.isNaN(mag) ? '-' : mag.toFixed(1);

    // 7.0 üzerini tavan kabul edip görsel bir şiddet çubuğu çiziyoruz.
    const magCell = Number.isNaN(mag)
      ? colors.muted('-')
      : `${color.bold(magText.padEnd(5))}${progressBar((mag / 7) * 100, 10, color)}`;

    const depth = parseFloat(eq.depth);
    const depthText = Number.isNaN(depth) ? String(eq.depth ?? '-') : `${depth.toFixed(1)} km`;

    table.push([
      colors.value(formatQuakeDate(eq.date)),
      colors.muted(relativeTime(parseQuakeDate(eq.date)) || '-'),
      magCell,
      colors.muted(depthText),
      mag >= 4.0 ? colors.title(eq.location) : colors.value(eq.location),
    ]);
  }

  return table.toString();
}

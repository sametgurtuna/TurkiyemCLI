import { createTable, footnote } from '../utils/ui.js';
import { colors, tableHead, symbols } from '../utils/theme.js';

/**
 * Bir fiyat sütununun en ucuz ve en pahalı değerlerini bulur; tabloda
 * bu satırlar işaretlenerek karşılaştırma kolaylaşır.
 * @param {Array<object>} rows
 * @param {Function} pick Satırdan fiyatı çıkaran fonksiyon
 */
function priceExtremes(rows, pick) {
  const values = rows.map(pick).map(Number).filter((v) => Number.isFinite(v) && v > 0);
  if (values.length < 2) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Fiyatı biçimlendirir; en ucuzsa yeşil ▼, en pahalıysa kırmızı ▲ işareti ekler.
 */
function formatPrice(value, extremes, baseColor) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return colors.muted('-');

  const text = `${price.toFixed(2)} ₺`;
  if (extremes.min !== null && price === extremes.min) {
    return `${colors.success.bold(text)} ${colors.success(symbols.down)}`;
  }
  if (extremes.max !== null && price === extremes.max) {
    return `${colors.error(text)} ${colors.error(symbols.up)}`;
  }
  return baseColor(text);
}

/**
 * Büyük şehirlerin akaryakıt karşılaştırma tablosunu oluşturur.
 */
export function createMajorCitiesFuelTable(rows) {
  const table = createTable({
    head: tableHead('Şehir', 'Benzin (95)', 'Motorin', 'Otogaz (LPG)'),
    colWidths: [22, 18, 18, 18],
    colAligns: ['left', 'right', 'right', 'right'],
    compact: true,
  });

  const benzin = priceExtremes(rows, (r) => r.benzin);
  const motorin = priceExtremes(rows, (r) => r.motorin);
  const lpg = priceExtremes(rows, (r) => r.lpg);

  for (const row of rows) {
    table.push([
      colors.value(row.city),
      formatPrice(row.benzin, benzin, colors.cyan),
      formatPrice(row.motorin, motorin, colors.warn),
      formatPrice(row.lpg, lpg, colors.success),
    ]);
  }

  return `${table.toString()}\n${footnote(`${symbols.down} en ucuz   ${symbols.up} en pahalı   (₺/litre)`)}`;
}

/**
 * Belirli bir ilin ilçe bazlı detaylı akaryakıt tablosunu oluşturur.
 */
export function createCityFuelDetailTable(fuelData) {
  const table = createTable({
    head: tableHead('İlçe', 'Benzin (95)', 'Motorin', 'Otogaz (LPG)'),
    colWidths: [24, 18, 18, 18],
    colAligns: ['left', 'right', 'right', 'right'],
    compact: true,
  });

  const districts = (fuelData.districts || []).slice(0, 20);
  const normalized = districts.map((d) => ({
    ...d,
    motorin: d.motorinUltra || d.motorinEco,
  }));

  const benzin = priceExtremes(normalized, (r) => r.benzin);
  const motorin = priceExtremes(normalized, (r) => r.motorin);
  const lpg = priceExtremes(normalized, (r) => r.lpg);

  for (const d of normalized) {
    table.push([
      colors.value(d.districtName || '-'),
      formatPrice(d.benzin, benzin, colors.cyan),
      formatPrice(d.motorin, motorin, colors.warn),
      formatPrice(d.lpg, lpg, colors.success),
    ]);
  }

  const total = (fuelData.districts || []).length;
  const shown = normalized.length;
  const note = total > shown
    ? `${symbols.down} en ucuz   ${symbols.up} en pahalı   (₺/litre)   ${shown}/${total} ilçe gösteriliyor`
    : `${symbols.down} en ucuz   ${symbols.up} en pahalı   (₺/litre)`;

  return `${table.toString()}\n${footnote(note)}`;
}

import { createTable } from '../utils/ui.js';
import { colors, tableHead } from '../utils/theme.js';

/** Alış/satış farkından yüzde makas hesaplar. */
function spreadPercent(alis, satis) {
  const buy = parseFloat(String(alis).replace(',', '.'));
  const sell = parseFloat(String(satis).replace(',', '.'));
  if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy === 0) return null;
  return ((sell - buy) / buy) * 100;
}

export function createDovizTable(result) {
  const table = createTable({
    head: tableHead('Kod', 'Döviz Cinsi', 'Alış (TL)', 'Satış (TL)', 'Makas'),
    colWidths: [8, 30, 15, 15, 10],
    colAligns: ['left', 'left', 'right', 'right', 'right'],
    compact: true,
  });

  for (const c of result.currencies || []) {
    if (!c.alis && !c.satis) continue;

    const spread = spreadPercent(c.alis, c.satis);

    table.push([
      colors.cyan.bold(c.kodu),
      colors.value(c.isim),
      c.alis ? colors.value(c.alis) : colors.muted('-'),
      c.satis ? colors.success(c.satis) : colors.muted('-'),
      spread === null ? colors.muted('-') : colors.hint(`%${spread.toFixed(2)}`),
    ]);
  }

  return table.toString();
}

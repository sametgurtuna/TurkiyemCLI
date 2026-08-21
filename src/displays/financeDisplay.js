import Table from 'cli-table3';
import chalk from 'chalk';

export function createDovizTable(result) {
  const table = new Table({
    head: [
      chalk.white.bold('Kod'),
      chalk.white.bold('Döviz Cinsi'),
      chalk.white.bold('Alış (TL)'),
      chalk.white.bold('Satış (TL)'),
    ],
    colWidths: [8, 30, 15, 15],
    style: { head: [], border: ['gray'] },
  });

  for (const c of result.currencies || []) {
    if (!c.alis && !c.satis) continue;
    table.push([
      chalk.cyan(c.kodu),
      c.isim,
      c.alis || '-',
      c.satis || '-'
    ]);
  }

  return table.toString();
}

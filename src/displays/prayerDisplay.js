import { createTable } from '../utils/ui.js';
import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Namaz vakitleri tablosunu ve geri sayım kutusunu oluşturur.
 */
export function createPrayerTable(data) {
  const table = createTable({
    head: [
      chalk.white.bold('Vakit'),
      chalk.cyan.bold('Saat'),
      chalk.white.bold('Durum'),
    ],
    colWidths: [18, 14, 28],
    style: { head: [], border: ['gray'] },
  });

  const nextKey = data.nextPrayer?.key;

  for (const prayer of data.prayers) {
    const isNext = prayer.key === nextKey;

    let rowVakit = chalk.white(prayer.name);
    let rowSaat = chalk.cyan.bold(prayer.time);
    let rowDurum = chalk.gray('Geçti');

    if (isNext) {
      rowVakit = chalk.green.bold(`👉 ${prayer.name}`);
      rowSaat = chalk.green.bold(prayer.time);
      rowDurum = chalk.green.bold(`Sıradaki (${data.nextPrayer.countdownText} kaldı)`);
    }

    table.push([rowVakit, rowSaat, rowDurum]);
  }

  const headerInfo =
    `${chalk.white.bold(data.city)}  ${chalk.dim('•')}  ` +
    `${chalk.yellow(data.gregorianDate)}  ${chalk.dim(`(Hicri: ${data.hijriDate})`)}\n` +
    `⏳ ${chalk.green.bold('Sıradaki Vakit:')} ${chalk.white.bold(data.nextPrayer.name)} (${data.nextPrayer.time})  ` +
    `${chalk.dim('•')}  ${chalk.cyan.bold(`Kalan Süre: ${data.nextPrayer.countdownText}`)}`;

  const box = boxen(headerInfo, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    borderColor: 'green',
    borderStyle: 'round',
  });

  return `${box}\n\n${table.toString()}`;
}

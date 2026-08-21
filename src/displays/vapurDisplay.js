import { createTable } from '../utils/ui.js';
import chalk from 'chalk';

/**
 * İstanbul Şehir Hatları ana vapur hatları tablosunu oluşturur.
 */
export function createSehirHatlariRoutesTable(routes) {
  const table = createTable({
    head: [
      chalk.white.bold('Kod'),
      chalk.cyan.bold('Hat Adı'),
      chalk.white.bold('Kalkış / Varış'),
      chalk.yellow.bold('Süre'),
      chalk.green.bold('Sefer Sıklığı'),
    ],
    colWidths: [10, 32, 38, 12, 24],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const r of routes) {
    table.push([
      chalk.cyan(r.code),
      chalk.white.bold(r.name),
      `${chalk.dim('Kalkış:')} ${r.departure}\n${chalk.dim('Varış:')}  ${r.arrival}`,
      chalk.yellow(r.duration),
      chalk.green(r.frequency),
    ]);
  }

  return table.toString();
}

/**
 * İzmir İZDENİZ iskeleler tablosunu oluşturur.
 */
export function createIzdenizPiersTable(piers) {
  const table = createTable({
    head: [
      chalk.white.bold('ID'),
      chalk.cyan.bold('İskele Adı'),
      chalk.white.bold('Tip'),
      chalk.green.bold('Durum'),
    ],
    colWidths: [8, 26, 22, 16],
    style: { head: [], border: ['gray'] },
  });

  for (const p of piers) {
    table.push([
      chalk.gray(p.id),
      chalk.white.bold(p.name),
      p.isCarFerry ? chalk.yellow('Arabalı Vapur') : chalk.cyan('Yolcu İskelesi'),
      p.isActive ? chalk.green('✔ Aktif') : chalk.red('✖ Pasif'),
    ]);
  }

  return table.toString();
}

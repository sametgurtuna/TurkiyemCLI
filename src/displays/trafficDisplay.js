import boxen from 'boxen';
import chalk from 'chalk';

/**
 * İBB Trafik Yoğunluk Endeksi gösterge kartını oluşturur.
 */
export function createTrafficIndexCard(data) {
  let colorFn = chalk.yellow;
  if (data.index < 30) colorFn = chalk.green;
  else if (data.index >= 80) colorFn = chalk.red;
  else if (data.index >= 60) colorFn = chalk.hex('#FFA500');

  const content = [
    `${chalk.white.bold('Şehir:')} ${chalk.cyan('İSTANBUL')}  ${chalk.dim('•')}  ${chalk.white.bold('Son Güncelleme:')} ${chalk.gray(data.updatedAt)}`,
    '',
    `  ${chalk.dim('Trafik Yoğunluk İndeksi:')}`,
    `  ${colorFn.bold(`%${data.index}`)}  ${chalk.bold(`[ ${colorFn(data.progressBar)} ]`)}  ${colorFn.bold(data.status)}`,
    '',
    `  ${chalk.dim('Durum Notu:')} ${chalk.white(data.description)}`,
  ].join('\n');

  return boxen(content, {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    borderColor: data.index >= 80 ? 'red' : data.index >= 60 ? 'yellow' : 'green',
    borderStyle: 'round',
  });
}

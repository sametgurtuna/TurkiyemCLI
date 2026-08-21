import Table from 'cli-table3';
import chalk from 'chalk';

/**
 * Büyük şehirlerin akaryakıt karşılaştırma tablosunu oluşturur.
 */
export function createMajorCitiesFuelTable(rows) {
  const table = new Table({
    head: [
      chalk.white.bold('Şehir'),
      chalk.cyan.bold('Benzin (95)'),
      chalk.yellow.bold('Motorin'),
      chalk.green.bold('Otogaz (LPG)'),
    ],
    colWidths: [22, 16, 16, 16],
    style: { head: [], border: ['gray'] },
  });

  for (const row of rows) {
    table.push([
      chalk.white(row.city),
      row.benzin ? chalk.cyan(`${Number(row.benzin).toFixed(2)} ₺/L`) : chalk.gray('-'),
      row.motorin ? chalk.yellow(`${Number(row.motorin).toFixed(2)} ₺/L`) : chalk.gray('-'),
      row.lpg ? chalk.green(`${Number(row.lpg).toFixed(2)} ₺/L`) : chalk.gray('-'),
    ]);
  }

  return table.toString();
}

/**
 * Belirli bir ilin ilçe bazlı detaylı akaryakıt tablosunu oluşturur.
 */
export function createCityFuelDetailTable(fuelData) {
  const table = new Table({
    head: [
      chalk.white.bold('İlçe'),
      chalk.cyan.bold('Benzin (95)'),
      chalk.yellow.bold('Motorin'),
      chalk.green.bold('Otogaz (LPG)'),
    ],
    colWidths: [24, 16, 16, 16],
    style: { head: [], border: ['gray'] },
  });

  const districts = fuelData.districts || [];
  for (const d of districts.slice(0, 20)) {
    const motorin = d.motorinUltra || d.motorinEco;
    table.push([
      chalk.white(d.districtName || '-'),
      d.benzin ? chalk.cyan(`${Number(d.benzin).toFixed(2)} ₺/L`) : chalk.gray('-'),
      motorin ? chalk.yellow(`${Number(motorin).toFixed(2)} ₺/L`) : chalk.gray('-'),
      d.lpg ? chalk.green(`${Number(d.lpg).toFixed(2)} ₺/L`) : chalk.gray('-'),
    ]);
  }

  return table.toString();
}

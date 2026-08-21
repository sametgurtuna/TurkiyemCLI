import Table from 'cli-table3';
import chalk from 'chalk';

export function createEarthquakeTable(earthquakes) {
  const table = new Table({
    head: [
      chalk.white.bold('Tarih'),
      chalk.white.bold('Büyüklük'),
      chalk.white.bold('Derinlik (km)'),
      chalk.white.bold('Konum'),
    ],
    colWidths: [22, 12, 15, 45],
    style: { head: [], border: ['gray'] },
  });

  for (const eq of earthquakes) {
    const mag = parseFloat(eq.magnitude);
    const magStr = mag >= 4.0
      ? chalk.red.bold(mag.toFixed(1))
      : chalk.yellow(mag.toFixed(1));

    const row = [
      eq.date,
      magStr,
      eq.depth,
      eq.location,
    ];

    table.push(row);
  }

  return table.toString();
}

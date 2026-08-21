import Table from 'cli-table3';
import chalk from 'chalk';

export function createNobetciEczaneTable(eczaneler) {
  const table = new Table({
    head: [
      chalk.white.bold('İlçe'),
      chalk.white.bold('Eczane Adı'),
      chalk.white.bold('Telefon'),
      chalk.white.bold('Adres'),
      chalk.white.bold('Harita')
    ],
    colWidths: [12, 20, 14, 35, 30],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const ecz of eczaneler) {
    let mapLink = '-';
    if (ecz.LokasyonX && ecz.LokasyonY) {
      mapLink = `https://www.google.com/maps/search/?api=1&query=${ecz.LokasyonX},${ecz.LokasyonY}`;
    }
    table.push([
      ecz.Bolge || '-',
      chalk.cyan(ecz.Adi || '-'),
      ecz.Telefon || '-',
      ecz.Adres || '-',
      chalk.blue.underline(mapLink)
    ]);
  }

  return table.toString();
}

export function createEczaneListTable(eczaneler) {
  const table = new Table({
    head: [
      chalk.white.bold('İlçe'),
      chalk.white.bold('Eczane Adı'),
      chalk.white.bold('Telefon'),
      chalk.white.bold('Adres'),
      chalk.white.bold('Harita')
    ],
    colWidths: [12, 20, 14, 35, 30],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const ecz of eczaneler) {
    let mapLink = '-';
    if (ecz.LokasyonX && ecz.LokasyonY) {
      mapLink = `https://www.google.com/maps/search/?api=1&query=${ecz.LokasyonX},${ecz.LokasyonY}`;
    }
    table.push([
      ecz.Bolge || '-',
      chalk.cyan(ecz.Adi || '-'),
      ecz.Telefon || '-',
      ecz.Adres || '-',
      chalk.blue.underline(mapLink)
    ]);
  }

  return table.toString();
}

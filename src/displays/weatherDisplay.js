import Table from 'cli-table3';
import chalk from 'chalk';
import asciichart from 'asciichart';

export function createCurrentWeatherTable(result) {
  const table = new Table({
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  table.push(
    { [chalk.cyan('Konum')]: result.locationName || '-' },
    { [chalk.cyan('Koordinat')]: `${result.latitude}, ${result.longitude}` },
    { [chalk.cyan('Zaman Dilimi')]: result.timezone || '-' },
    { [chalk.cyan('Ölçüm Zamanı')]: result.current?.time || '-' },
    { [chalk.cyan('Sıcaklık (°C)')]: String(result.current?.temperature ?? '-') },
    { [chalk.cyan('Rüzgar (km/s)')]: String(result.current?.windSpeed ?? '-') },
    { [chalk.cyan('Nem (%)')]: String(result.current?.humidity ?? '-') },
  );

  return table.toString();
}

export function createHourlyWeatherTable(result) {
  const table = new Table({
    head: [
      chalk.white.bold('Saat'),
      chalk.white.bold('Sıcaklık (°C)'),
      chalk.white.bold('Hissedilen (°C)'),
      chalk.white.bold('Yağış Olasılığı (%)'),
    ],
    colWidths: [22, 15, 18, 22],
    style: { head: [], border: ['gray'] },
  });

  const temperatures = [];

  for (const row of result.rows || []) {
    table.push([
      row.time || '-',
      String(row.temperature ?? '-'),
      String(row.apparentTemperature ?? '-'),
      String(row.precipitationProbability ?? '-'),
    ]);

    if (row.temperature !== undefined && row.temperature !== null) {
      temperatures.push(row.temperature);
    }
  }

  let chart = '';
  if (temperatures.length > 0) {
    chart = '\n' + chalk.white.bold('  Sıcaklık Grafiği (Sonraki Saatler)\n') +
      chalk.cyan(asciichart.plot(temperatures, { height: 10 })) + '\n\n';
  }

  return chart + table.toString();
}

export function createAirQualityTable(result) {
  const table = new Table({
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  table.push(
    { [chalk.cyan('Konum')]: result.locationName || '-' },
    { [chalk.cyan('Koordinat')]: `${result.latitude}, ${result.longitude}` },
    { [chalk.cyan('Zaman Dilimi')]: result.timezone || '-' },
    { [chalk.cyan('Ölçüm Zamanı')]: result.current?.time || '-' },
    { [chalk.cyan('PM10 (µg/m3)')]: String(result.current?.pm10 ?? '-') },
    { [chalk.cyan('PM2.5 (µg/m3)')]: String(result.current?.pm25 ?? '-') },
    { [chalk.cyan('CO (µg/m3)')]: String(result.current?.carbonMonoxide ?? '-') },
    { [chalk.cyan('NO2 (µg/m3)')]: String(result.current?.nitrogenDioxide ?? '-') },
  );

  return table.toString();
}

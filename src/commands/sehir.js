import chalk from 'chalk';
import prompts from 'prompts';
import { setCity, getCity } from '../utils/config.js';

const CITY_OPTIONS = [
  { title: 'İstanbul', value: 'istanbul', description: 'IETT (GTFS, SOAP, Canlı Filo & Kaza)' },
  { title: 'Ankara', value: 'ankara', description: 'EGO Genel Müdürlüğü' },
  { title: 'İzmir', value: 'izmir', description: 'ESHOT GTFS & İZSU' },
  { title: 'Adana', value: 'adana', description: 'Adana Ulaşım REST API' },
  { title: 'Antalya', value: 'antalya', description: 'Antalya Ulaşım' },
  { title: 'Bursa', value: 'bursa', description: 'Burulaş / Bursakart API' },
  { title: 'Trabzon', value: 'trabzon', description: 'Trabzon Ulaşım' },
  { title: 'Samsun', value: 'samsun', description: 'Samulaş' },
  { title: 'Mersin', value: 'mersin', description: 'Mersin Ulaşım' },
  { title: 'Kayseri', value: 'kayseri', description: 'Nöbetçi Eczane' },
];

const SUPPORTED_CITIES = CITY_OPTIONS.map(c => c.value);

export async function sehirSec(city) {
  if (!city) {
    const current = getCity();
    console.log(current ? chalk.green(`Şu an seçili şehir: ${chalk.bold(current)}\n`) : chalk.yellow('Henüz şehir seçilmemiş.\n'));

    // Check if running in an interactive terminal
    if (process.stdin.isTTY) {
      const response = await prompts({
        type: 'select',
        name: 'selectedCity',
        message: 'Lütfen bir şehir seçin:',
        choices: CITY_OPTIONS.map(c => ({
          title: c.title,
          value: c.value,
          description: c.description
        })),
        initial: Math.max(0, SUPPORTED_CITIES.indexOf(current))
      });

      if (response.selectedCity) {
        setCity(response.selectedCity);
        console.log(chalk.green(`\n✔ Şehir "${chalk.bold(response.selectedCity)}" olarak ayarlandı.`));
        return;
      }
    }

    console.log(chalk.white('Kullanım:'));
    SUPPORTED_CITIES.forEach((c) => {
      console.log(chalk.cyan(`  turkiyem sehir ${c}`));
    });
    return;
  }

  const normalized = city.toLowerCase().trim();

  if (!SUPPORTED_CITIES.includes(normalized)) {
    console.log(chalk.red(`"${city}" desteklenmiyor.`));
    console.log(chalk.white('Desteklenen şehirler:'));
    SUPPORTED_CITIES.forEach((c) => {
      console.log(chalk.cyan(`  - ${c}`));
    });
    return;
  }

  setCity(normalized);
  console.log(chalk.green(`Şehir "${chalk.bold(normalized)}" olarak ayarlandı.`));
}

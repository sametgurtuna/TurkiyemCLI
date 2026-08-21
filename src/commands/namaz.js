import chalk from 'chalk';
import ora from 'ora';
import { getCity } from '../utils/config.js';
import { fetchPrayerTimes } from '../services/prayerService.js';
import { createPrayerTable } from '../displays/prayerDisplay.js';
import { icons } from '../utils/theme.js';

export async function namazVakitleri(sehirInput) {
  const city = sehirInput || getCity() || 'istanbul';
  const spinner = ora(`${city.toUpperCase()} namaz vakitleri alınıyor...`).start();

  try {
    const data = await fetchPrayerTimes(city);
    spinner.succeed(`${data.city} namaz vakitleri alındı`);
    console.log('');
    console.log(chalk.white.bold(`  ${icons.prayer}  Diyanet Namaz Vakitleri & Geri Sayım`));
    console.log(createPrayerTable(data));
    console.log(chalk.dim('\n  * Hesaplamalar Diyanet İşleri Başkanlığı takvimine uygundur.'));
  } catch (error) {
    spinner.fail(chalk.red(error.message));
  }
}

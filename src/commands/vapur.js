import chalk from 'chalk';
import ora from 'ora';
import { getCity } from '../utils/config.js';
import { fetchIzdenizPiers, getSehirHatlariRoutes } from '../services/vapurService.js';
import { createIzdenizPiersTable, createSehirHatlariRoutesTable } from '../displays/vapurDisplay.js';
import { icons } from '../utils/theme.js';

export async function vapurSorgula(sehirInput) {
  const city = (sehirInput || getCity() || 'istanbul').toLowerCase();

  if (city === 'izmir') {
    const spinner = ora('İZDENİZ iskele bilgileri alınıyor...').start();
    try {
      const piers = await fetchIzdenizPiers();
      spinner.succeed('İZDENİZ iskeleleri alındı');
      console.log('');
      console.log(chalk.white.bold(`  ${icons.ferry}  İzmir İZDENİZ İskeleleri`));
      console.log(createIzdenizPiersTable(piers));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
    return;
  }

  // İstanbul Şehir Hatları
  const routes = getSehirHatlariRoutes();
  console.log('');
  console.log(chalk.white.bold(`  ${icons.ferry}  İstanbul Şehir Hatları Ana Vapur Hatları`));
  console.log(createSehirHatlariRoutesTable(routes));
  console.log(chalk.dim('\n  * İzmir iskeleleri için: ') + chalk.cyan('turkiyem vapur izmir'));
}

import chalk from 'chalk';
import ora from 'ora';
import { fetchTrafficIndex } from '../services/trafficService.js';
import { createTrafficIndexCard } from '../displays/trafficDisplay.js';
import { icons } from '../utils/theme.js';

export async function trafikDurumu() {
  const spinner = ora('İBB anlık trafik yoğunluk verisi alınıyor...').start();

  try {
    const data = await fetchTrafficIndex();
    spinner.succeed('İBB Trafik endeksi alındı');
    console.log('');
    console.log(chalk.white.bold(`  ${icons.traffic}  İBB Canlı Trafik Yoğunluk Endeksi`));
    console.log(createTrafficIndexCard(data));
    console.log(chalk.dim('\n  * Veriler İBB Ulaşım Yönetim Merkezi (TKM) anlık sensör ölçümleridir.'));
  } catch (error) {
    spinner.fail(chalk.red(error.message));
  }
}

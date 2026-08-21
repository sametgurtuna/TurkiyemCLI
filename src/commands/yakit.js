import chalk from 'chalk';
import ora from 'ora';
import { getCity } from '../utils/config.js';
import { fetchFuelPrices, fetchMajorCitiesFuelPrices } from '../services/fuelService.js';
import { createMajorCitiesFuelTable, createCityFuelDetailTable } from '../displays/fuelDisplay.js';
import { icons } from '../utils/theme.js';

export async function yakitFiyatlari(sehirInput) {
  const targetCity = sehirInput || getCity();
  const spinner = ora(
    sehirInput
      ? `${sehirInput.toUpperCase()} akaryakıt fiyatları alınıyor...`
      : 'Türkiye geneli akaryakıt fiyatları alınıyor...'
  ).start();

  try {
    if (sehirInput) {
      const data = await fetchFuelPrices(sehirInput);
      spinner.succeed(`${data.provinceName} akaryakıt fiyatları güncellendi`);
      console.log('');
      console.log(chalk.white.bold(`  ${icons.fuel}  ${data.provinceName} Akaryakıt Fiyatları (Pompa/Litre)`));
      console.log(createCityFuelDetailTable(data));
      console.log(chalk.dim('  * Fiyatlar resmi pompa satış tarifeleridir.'));
      return;
    }

    const majorData = await fetchMajorCitiesFuelPrices();
    spinner.succeed('Güncel akaryakıt fiyatları alındı');
    console.log('');
    console.log(chalk.white.bold(`  ${icons.fuel}  Türkiye Büyük Şehirler Akaryakıt Karşılaştırması`));
    console.log(createMajorCitiesFuelTable(majorData));

    if (targetCity && !['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana'].includes(targetCity.toLowerCase())) {
      try {
        const cityData = await fetchFuelPrices(targetCity);
        console.log('');
        console.log(chalk.white.bold(`  ${icons.fuel}  Seçili Şehriniz (${cityData.provinceName})`));
        console.log(createCityFuelDetailTable(cityData));
      } catch {
        // İkincil ilçe tablosu alınamazsa devam et
      }
    }

    console.log(chalk.dim(`\n  * Belirli bir il için: ${chalk.cyan('turkiyem yakit <şehir|plaka>')}`));
  } catch (error) {
    spinner.fail(chalk.red(error.message));
  }
}

import chalk from 'chalk';
import ora from 'ora';
import {
  fetchChargingProviders,
  searchChargingStations,
  fetchChargingStationDetail
} from '../services/sarjService.js';
import {
  createProvidersTable,
  createStationSearchTable,
  createStationDetailTable,
  createSocketsTable
} from '../displays/sarjDisplay.js';
import { getCity } from '../utils/config.js';

export async function sarjSaglayicilar() {
  const spinner = ora('Şarj sağlayıcıları listesi alınıyor...').start();
  try {
    const providers = await fetchChargingProviders();
    spinner.succeed(`Şarj sağlayıcıları alındı (${providers.length} sağlayıcı).`);
    console.log('\n' + createProvidersTable(providers) + '\n');
    console.log(chalk.gray('İstasyon aramak için: turkiyem sarj ara <ilçe/sağlayıcı>\n'));
  } catch (error) {
    spinner.fail(chalk.red('Hata: ' + error.message));
  }
}

export async function sarjAra(sorgu, options = {}) {
  const query = sorgu || options.sehir || getCity() || 'istanbul';
  const spinner = ora(`"${query.toUpperCase()}" şarj istasyonları aranıyor...`).start();

  try {
    const stations = await searchChargingStations(query, options);
    spinner.succeed(`Şarj istasyonları bulundu (${stations.length} sonuç).`);

    if (stations.length === 0) {
      console.log(chalk.yellow(`"${query}" ile eşleşen şarj istasyonu bulunamadı.`));
      return;
    }

    let displayStations = stations;
    if (stations.length > 50) {
      console.log(chalk.yellow(`\nÇok fazla sonuç bulundu (${stations.length}). İlk 50 istasyon listeleniyor.`));
      displayStations = stations.slice(0, 50);
    }

    console.log('\n' + createStationSearchTable(displayStations) + '\n');
    console.log(chalk.gray('İstasyon detayları ve soketler için: turkiyem sarj detay <istasyonId>\n'));
  } catch (error) {
    spinner.fail(chalk.red('Hata: ' + error.message));
  }
}

export async function sarjDetay(istasyonId) {
  if (!istasyonId) {
    console.log(chalk.red('Lütfen bir istasyon ID belirtin. Örnek: turkiyem sarj detay 14586117'));
    return;
  }

  const spinner = ora(`"${istasyonId}" ID'li istasyon detayları alınıyor...`).start();
  try {
    const detail = await fetchChargingStationDetail(istasyonId);
    spinner.succeed('İstasyon detayları alındı');

    console.log('\n' + createStationDetailTable(detail));

    if (Array.isArray(detail.sockets) && detail.sockets.length > 0) {
      console.log(chalk.bold('\n🔌 Soket ve Şarj Bilgileri:'));
      console.log(createSocketsTable(detail.sockets) + '\n');
    } else {
      console.log('');
    }
  } catch (error) {
    spinner.fail(chalk.red('Hata: ' + error.message));
  }
}

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
import { getCity, getSarjApiKey, setSarjApiKey } from '../utils/config.js';

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
  const isNearby = !sorgu && !options.sehir;
  const spinnerText = isNearby
    ? 'Anlık konumunuz belirleniyor ve en yakın şarj istasyonları aranıyor...'
    : `"${(sorgu || options.sehir).toUpperCase()}" şarj istasyonları aranıyor...`;
  const spinner = ora(spinnerText).start();

  try {
    const result = await searchChargingStations(sorgu, options);
    const stations = Array.isArray(result) ? result : (result.stations || []);
    const userLocation = result.userLocation;
    const searchLocation = result.searchLocation;

    spinner.succeed(`Şarj istasyonları bulundu (${stations.length} istasyon - Mesafeye göre sıralı).`);

    if (stations.length === 0) {
      console.log(chalk.yellow(`\n"${sorgu || 'Konumunuz'}" çevresinde şarj istasyonu bulunamadı.`));
      return;
    }

    if (userLocation || searchLocation) {
      const locText = userLocation?.name || searchLocation?.name;
      if (locText) {
        console.log(chalk.cyan(`\n📍 Konum: ${chalk.bold(locText)}`));
      }
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
    console.log(chalk.red('Lütfen bir istasyon ID belirtin. Örnek: turkiyem sarj detay 195432'));
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

export function sarjKeyAyarla(apiKey) {
  if (!apiKey) {
    const current = getSarjApiKey();
    if (current) {
      const masked = current.length > 8 ? `${current.slice(0, 4)}...${current.slice(-4)}` : '****';
      console.log(chalk.green(`Mevcut Open Charge Map API anahtarı: ${masked}`));
    } else {
      console.log(chalk.yellow('Kayıtlı Open Charge Map API anahtarı bulunamadı.'));
      console.log(chalk.gray('\nÜcretsiz anahtar almak için: https://openchargemap.org/site/develop/api'));
      console.log(chalk.cyan('Kaydetmek için: turkiyem sarj key <API_KEY>'));
    }
    return;
  }

  setSarjApiKey(apiKey);
  console.log(chalk.green('Open Charge Map API anahtarı başarıyla kaydedildi.'));
}


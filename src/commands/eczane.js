import chalk from 'chalk';
import ora from 'ora';
import {
    fetchNobetciEczaneler,
    fetchAllEczaneler,
    fetchKayseriNobetciEczaneler,
    fetchEczaneApiNobetci,
    fetchEczaneApiDetail,
    fetchEczaneApiCities,
    fetchEczaneApiDistricts,
    fetchEczaneApiNearby
} from '../services/eczaneService.js';
import {
    createNobetciEczaneTable,
    createEczaneListTable,
    createPharmacyDetailTable,
    createEczaneApiCityTable,
    createEczaneApiDistrictTable,
    createEczaneNearbyTable
} from '../utils/display.js';
import { getCity, getEczaneApiKey, setEczaneApiKey } from '../utils/config.js';

function normalizeText(str) {
    if (!str) return '';
    return str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/Ş/g, 's')
        .replace(/ş/g, 's')
        .replace(/Ğ/g, 'g')
        .replace(/ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/ü/g, 'u')
        .replace(/Ö/g, 'o')
        .replace(/ö/g, 'o')
        .replace(/Ç/g, 'c')
        .replace(/ç/g, 'c')
        .toLowerCase()
        .trim();
}

export async function eczaneNobetci(ilce, options = {}) {
    const city = options.sehir || getCity() || 'istanbul';
    const apiKey = getEczaneApiKey();
    const spinner = ora(`${city.toUpperCase()} nöbetçi eczaneleri alınıyor...`).start();

    try {
        let data = [];

        // 1. If EczaneAPI key is configured, use it for 81 cities
        if (apiKey) {
            data = await fetchEczaneApiNobetci({
                city,
                district: ilce,
                date: options.tarih,
                apiKey
            });
        } 
        // 2. Open Data Fallbacks for Izmir and Kayseri without API Key
        else if (city.toLowerCase() === 'izmir') {
            const rawData = await fetchNobetciEczaneler();
            data = rawData.map(e => ({
                district: e.Bolge,
                name: e.Adi,
                phone: e.Telefon,
                address: e.Adres,
                location: { lat: e.LokasyonX, lng: e.LokasyonY }
            }));
            if (ilce) {
                const norm = normalizeText(ilce);
                data = data.filter(e => e.district && normalizeText(e.district).includes(norm));
            }
        } else if (city.toLowerCase() === 'kayseri') {
            const rawData = await fetchKayseriNobetciEczaneler();
            data = rawData.map(e => ({
                district: e.district,
                name: e.name,
                phone: e.phone,
                address: e.address,
                location: { lat: e.latitude, lng: e.longitude }
            }));
            if (ilce) {
                const norm = normalizeText(ilce);
                data = data.filter(e => e.district && normalizeText(e.district).includes(norm));
            }
        } else {
            spinner.stop();
            console.log(chalk.yellow(`\nℹ️  "${city.toUpperCase()}" şehri için EczaneAPI entegrasyonu mevcuttur.`));
            console.log(chalk.gray(`Türkiye'nin 81 ilinde ve tüm ilçelerinde anlık nöbetçi eczane sorgulamak için:`));
            console.log(chalk.cyan(`  1. https://eczaneapi.com adresinden ücretsiz API anahtarı alın.`));
            console.log(chalk.cyan(`  2. Anahtarınızı kaydedin: turkiyem eczane key <API_KEY>`));
            console.log(chalk.gray(`(Not: İzmir ve Kayseri belediye açık verisi ile anahtarsız da sorgulanabilir.)\n`));
            return;
        }

        spinner.succeed(`Nöbetçi eczane verisi alındı (${data.length} sonuç).`);

        if (data.length === 0) {
            console.log(chalk.yellow(`Belirtilen kritere (${city} / ${ilce || 'tüm ilçeler'}) uygun nöbetçi eczane bulunamadı.`));
            return;
        }

        console.log('\n' + createNobetciEczaneTable(data));
        console.log(chalk.gray('Detaylı eczane bilgisi için: turkiyem eczane detay <eczaneId>\n'));
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

export async function eczaneDetay(eczaneId) {
    if (!eczaneId) {
        console.log(chalk.red('Eczane ID belirtmelisiniz. Örnek: turkiyem eczane detay eczane_123'));
        return;
    }

    const spinner = ora('Eczane detayları alınıyor...').start();
    try {
        const data = await fetchEczaneApiDetail(eczaneId);
        spinner.succeed('Eczane detayları alındı');
        console.log('\n' + createPharmacyDetailTable(data) + '\n');
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

export async function eczaneSehirler() {
    const spinner = ora('Türkiye geneli il listesi alınıyor...').start();
    try {
        const cities = await fetchEczaneApiCities();
        spinner.succeed(`81 İl listesi alındı (${cities.length} il).`);
        console.log('\n' + createEczaneApiCityTable(cities) + '\n');
        console.log(chalk.gray('İlçeleri listelemek için: turkiyem eczane ilceler <sehirSlug>\n'));
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

export async function eczaneIlceler(sehirSlug) {
    const city = sehirSlug || getCity() || 'istanbul';
    const spinner = ora(`${city.toUpperCase()} ilçeleri alınıyor...`).start();
    try {
        const data = await fetchEczaneApiDistricts(city);
        const districts = data.districts || [];
        spinner.succeed(`${city.toUpperCase()} ilçe listesi alındı (${districts.length} ilçe).`);
        console.log('\n' + createEczaneApiDistrictTable(data.city?.name || city, districts) + '\n');
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

export async function eczaneYakin(lat, lng, radius) {
    if (!lat || !lng) {
        console.log(chalk.red('Enlem ve boylam belirtmelisiniz. Örnek: turkiyem eczane yakin 41.0082 28.9784 5'));
        return;
    }

    const r = radius ? parseFloat(radius) : 5;
    const spinner = ora(`Konuma en yakın nöbetçi eczaneler aranıyor (${lat}, ${lng} - ${r} km)...`).start();
    try {
        const res = await fetchEczaneApiNearby({ lat: parseFloat(lat), lng: parseFloat(lng), radius: r });
        const pharmacies = res.pharmacies || [];
        spinner.succeed(`Yakında ${pharmacies.length} nöbetçi eczane bulundu.`);
        if (pharmacies.length === 0) {
            console.log(chalk.yellow('Bu yarıçapta nöbetçi eczane bulunamadı.'));
            return;
        }
        console.log('\n' + createEczaneNearbyTable(pharmacies) + '\n');
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

export function eczaneKeyAyarla(key) {
    if (!key) {
        const current = getEczaneApiKey();
        if (current) {
            console.log(chalk.green(`Kayıtlı EczaneAPI Anahtarı: ${chalk.bold(current.substring(0, 6) + '...' + current.slice(-4))}`));
        } else {
            console.log(chalk.yellow('Henüz EczaneAPI anahtarı tanımlanmamış.'));
        }
        console.log(chalk.gray('\nTanımlamak için: turkiyem eczane key <API_KEY>'));
        return;
    }

    setEczaneApiKey(key);
    console.log(chalk.green(`✔ EczaneAPI anahtarınız başarıyla kaydedildi.`));
    console.log(chalk.cyan('Artık 81 ilde nöbetçi eczane sorgulayabilirsiniz: turkiyem eczane nobetci'));
}

export async function eczaneAra(kelime) {
    const spinner = ora('Eczane listesi alınıyor...').start();
    try {
        const data = await fetchAllEczaneler();
        let filtered = data;
        if (kelime) {
            const kw = kelime.toLocaleUpperCase('tr-TR');
            filtered = data.filter(e =>
                (e.Adi && e.Adi.toLocaleUpperCase('tr-TR').includes(kw)) ||
                (e.Bolge && e.Bolge.toLocaleUpperCase('tr-TR').includes(kw)) ||
                (e.Adres && e.Adres.toLocaleUpperCase('tr-TR').includes(kw))
            );
        } else {
            spinner.info(`Sistemde kayıtlı toplam ${data.length} eczane bulunuyor.`);
            console.log(chalk.yellow('Arama yapmak için lütfen bir kelime veya ilçe giriniz:'));
            console.log(chalk.white('Örnek: turkiyem eczane ara Konak\n'));
            return;
        }

        spinner.succeed(`Eczane listesi alındı (${filtered.length} sonuç).`);

        if (filtered.length === 0) {
            console.log(chalk.yellow(`"${kelime}" ile eşleşen eczane bulunamadı.`));
            return;
        }

        if (filtered.length > 50) {
            console.log(chalk.yellow(`\nÇok fazla sonuç bulundu (${filtered.length}). Sadece ilk 50 kayıt gösteriliyor.`));
            filtered = filtered.slice(0, 50);
        }

        console.log('\n' + createEczaneListTable(filtered));
    } catch (error) {
        spinner.fail(chalk.red('Hata: ' + error.message));
    }
}

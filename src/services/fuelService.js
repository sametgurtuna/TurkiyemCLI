import axios from 'axios';
import { CACHE_TTL, getCached, setCached } from '../utils/cache.js';
import { BROWSER_USER_AGENT } from '../utils/httpClient.js';

const OPET_FUEL_URL = 'https://api.opet.com.tr/api/fuelprices/prices';

const PROVINCE_CODES = {
  adana: '01',
  adiyaman: '02',
  afyon: '03',
  afyonkarahisar: '03',
  agri: '04',
  amasya: '05',
  ankara: '06',
  antalya: '07',
  artvin: '08',
  aydin: '09',
  balikesir: '10',
  bilecik: '11',
  bingol: '12',
  bitlis: '13',
  bolu: '14',
  burdur: '15',
  bursa: '16',
  canakkale: '17',
  cankiri: '18',
  corum: '19',
  denizli: '20',
  diyarbakir: '21',
  edirne: '22',
  elazig: '23',
  erzincan: '24',
  erzurum: '25',
  eskisehir: '26',
  gaziantep: '27',
  giresun: '28',
  gumushane: '29',
  hakkari: '30',
  hatay: '31',
  isparta: '32',
  mersin: '33',
  icel: '33',
  istanbul: '34',
  izmir: '35',
  kars: '36',
  kastamonu: '37',
  kayseri: '38',
  kirklareli: '39',
  kirsehir: '40',
  kocaeli: '41',
  konya: '42',
  kutahya: '43',
  malatya: '44',
  manisa: '45',
  kahramanmaras: '46',
  maras: '46',
  mardin: '47',
  mugla: '48',
  mus: '49',
  nevsehir: '50',
  nigde: '51',
  ordu: '52',
  rize: '53',
  sakarya: '54',
  samsun: '55',
  siirt: '56',
  sinop: '57',
  sivas: '58',
  tekirdag: '59',
  tokat: '60',
  trabzon: '61',
  tunceli: '62',
  sanliurfa: '63',
  urfa: '63',
  usak: '64',
  van: '65',
  yozgat: '66',
  zonguldak: '67',
  aksaray: '68',
  bayburt: '69',
  karaman: '70',
  kirikkale: '71',
  batman: '72',
  sirnak: '73',
  bartin: '74',
  ardahan: '75',
  igdir: '76',
  yalova: '77',
  karabuk: '78',
  kilis: '79',
  osmaniye: '80',
  duzce: '81',
};

export function resolveProvinceCode(cityOrCode) {
  if (!cityOrCode) return '34';
  const str = String(cityOrCode).trim().toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');

  if (/^\d{1,2}$/.test(str)) {
    return str.padStart(2, '0');
  }

  return PROVINCE_CODES[str] || '34';
}

/**
 * Belirtilen ilin akaryakıt fiyatlarını çeker.
 * @param {string|number} provinceInput İl adı veya plaka kodu (örn: "istanbul", "34", "ankara")
 */
export async function fetchFuelPrices(provinceInput = '34') {
  const code = resolveProvinceCode(provinceInput);
  const cacheKey = `fuel_prices_${code}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(OPET_FUEL_URL, {
      params: { ProvinceCode: code },
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    const districts = Array.isArray(response.data) ? response.data : [];
    if (districts.length === 0) {
      throw new Error(`Plaka ${code} için akaryakıt verisi bulunamadı.`);
    }

    const provinceName = districts[0].provinceName || 'TÜRKİYE';
    const parsedDistricts = districts.map((d) => {
      const priceMap = {};
      for (const p of d.prices || []) {
        priceMap[p.productShortName || p.productCode] = {
          name: p.productName,
          amount: p.amount,
        };
      }

      return {
        districtName: d.districtName,
        benzin: priceMap.KURS?.amount || priceMap.A100?.amount || null,
        motorinUltra: priceMap.MT_ULT?.amount || priceMap.A121?.amount || null,
        motorinEco: priceMap.MT_ECO?.amount || priceMap.A128?.amount || null,
        lpg: priceMap.OTOGAZ?.amount || priceMap.A130?.amount || null,
      };
    });

    const result = {
      provinceCode: code,
      provinceName,
      districts: parsedDistricts,
      summary: parsedDistricts[0] || null,
      updatedAt: new Date().toISOString(),
    };

    setCached(cacheKey, result, CACHE_TTL.FINANCE || 1800);
    return result;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Akaryakıt fiyat servisi zaman aşımına uğradı.');
    }
    throw new Error(`Akaryakıt verisi alınamadı: ${error.message}`);
  }
}

/**
 * Büyük şehirlerin (İstanbul, Ankara, İzmir, Bursa, Antalya) ortalama fiyatlarını çeker.
 */
export async function fetchMajorCitiesFuelPrices() {
  const cacheKey = 'fuel_prices_major_cities';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const majorProvinces = [
    { name: 'İstanbul (Avrupa)', code: '34' },
    { name: 'Ankara', code: '06' },
    { name: 'İzmir', code: '35' },
    { name: 'Bursa', code: '16' },
    { name: 'Antalya', code: '07' },
    { name: 'Adana', code: '01' },
  ];

  const results = [];
  for (const prov of majorProvinces) {
    try {
      const data = await fetchFuelPrices(prov.code);
      if (data && data.summary) {
        results.push({
          city: prov.name,
          benzin: data.summary.benzin,
          motorin: data.summary.motorinUltra || data.summary.motorinEco,
          lpg: data.summary.lpg,
        });
      }
    } catch {
      // Hata alan şehir atlanır
    }
  }

  setCached(cacheKey, results, CACHE_TTL.FINANCE || 1800);
  return results;
}

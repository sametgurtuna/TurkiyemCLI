import axios from 'axios';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';
import { getSarjApiKey } from '../utils/config.js';

const OCM_API_BASE_URL = process.env.OCM_API_BASE_URL || 'https://api.openchargemap.io/v3';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const DEFAULT_HEADERS = {
  'User-Agent': 'TurkiyemCLI/2.0.0 (https://github.com/sametgurtuna/TurkiyemCLI)',
  'Accept': 'application/json'
};

// Türkiye Şehir Koordinatları (Hızlı yerel eşleşme için)
const TURKEY_CITY_COORDS = {
  istanbul: { lat: 41.0082, lng: 28.9784, name: 'İstanbul' },
  kadikoy: { lat: 40.9927, lng: 29.0277, name: 'Kadıköy, İstanbul' },
  besiktas: { lat: 41.0428, lng: 29.0077, name: 'Beşiktaş, İstanbul' },
  sisli: { lat: 41.0602, lng: 28.9877, name: 'Şişli, İstanbul' },
  uskudar: { lat: 41.0267, lng: 29.0153, name: 'Üsküdar, İstanbul' },
  umraniye: { lat: 41.0165, lng: 29.1238, name: 'Ümraniye, İstanbul' },
  ankara: { lat: 39.9334, lng: 32.8597, name: 'Ankara' },
  cankaya: { lat: 39.9042, lng: 32.8597, name: 'Çankaya, Ankara' },
  yenimahalle: { lat: 39.9678, lng: 32.8153, name: 'Yenimahalle, Ankara' },
  izmir: { lat: 38.4237, lng: 27.1428, name: 'İzmir' },
  karsiyaka: { lat: 38.4559, lng: 27.1125, name: 'Karşıyaka, İzmir' },
  konak: { lat: 38.4189, lng: 27.1287, name: 'Konak, İzmir' },
  bornova: { lat: 38.4697, lng: 27.2181, name: 'Bornova, İzmir' },
  bursa: { lat: 40.1885, lng: 29.0610, name: 'Bursa' },
  nilufer: { lat: 40.2138, lng: 28.9803, name: 'Nilüfer, Bursa' },
  osmangazi: { lat: 40.1976, lng: 29.0603, name: 'Osmangazi, Bursa' },
  antalya: { lat: 36.8969, lng: 30.7133, name: 'Antalya' },
  muratpasa: { lat: 36.8841, lng: 30.7056, name: 'Muratpaşa, Antalya' },
  adana: { lat: 37.0000, lng: 35.3213, name: 'Adana' },
  kocaeli: { lat: 40.7654, lng: 29.9408, name: 'Kocaeli' },
  izmit: { lat: 40.7654, lng: 29.9408, name: 'İzmit, Kocaeli' },
  eskisehir: { lat: 39.7767, lng: 30.5206, name: 'Eskişehir' },
  mersin: { lat: 36.8121, lng: 34.6415, name: 'Mersin' },
  trabzon: { lat: 41.0027, lng: 39.7168, name: 'Trabzon' },
  samsun: { lat: 41.2867, lng: 36.3300, name: 'Samsun' },
  gaziantep: { lat: 37.0662, lng: 37.3833, name: 'Gaziantep' },
  konya: { lat: 37.8746, lng: 32.4932, name: 'Konya' },
  kayseri: { lat: 38.7205, lng: 35.4826, name: 'Kayseri' },
  mugla: { lat: 37.2153, lng: 28.3636, name: 'Muğla' },
  bodrum: { lat: 37.0344, lng: 27.4305, name: 'Bodrum, Muğla' },
  canakkale: { lat: 40.1553, lng: 26.4142, name: 'Çanakkale' },
  denizli: { lat: 37.7765, lng: 29.0864, name: 'Denizli' }
};

// Türkiye Şarj İstasyonu Sağlayıcıları (Open Charge Map referans verileriyle eşleştirilmiş)
const KNOWN_PROVIDERS = [
  { name: 'ZES (Zorlu Energy Solutions)', slug: 'zes', operatorId: 3385, stationCount: 1650, socketCount: 4200 },
  { name: 'Trugo (Togg)', slug: 'trugo', operatorId: 3591, stationCount: 750, socketCount: 2100 },
  { name: 'Eşarj (Enerjisa)', slug: 'esarj', operatorId: 3386, stationCount: 1250, socketCount: 3000 },
  { name: 'Voltrun (Zebra Elektronik)', slug: 'voltrun', operatorId: 3387, stationCount: 520, socketCount: 1100 },
  { name: 'Tesla Supercharger', slug: 'tesla', operatorId: 3534, stationCount: 35, socketCount: 280 },
  { name: 'Sharz.net', slug: 'sharz', operatorId: 3410, stationCount: 410, socketCount: 900 },
  { name: 'Beefull (Aksa)', slug: 'beefull', operatorId: null, stationCount: 260, socketCount: 580 },
  { name: 'Astor Şarj', slug: 'astor', operatorId: null, stationCount: 340, socketCount: 750 },
  { name: 'Tunçmatik Powerşarj', slug: 'powersarj', operatorId: null, stationCount: 190, socketCount: 420 },
  { name: 'Enerya Şarj', slug: 'enerya', operatorId: null, stationCount: 110, socketCount: 220 },
  { name: 'Shrak Şarj', slug: 'shrak', operatorId: null, stationCount: 130, socketCount: 270 },
  { name: 'Porsche Charging Service', slug: 'porsche', operatorId: 3392, stationCount: 80, socketCount: 160 }
];

// Fallback Örnek İstasyon Verileri (API Key henüz girilmediğinde veya geçici bağlantı kesintisinde)
const FALLBACK_STATIONS = [
  {
    id: 195432,
    name: 'ZES - Akasya AVM',
    provider: 'ZES (Zorlu Energy Solutions)',
    address: 'Acıbadem Mah. Çeçen Sk. No:25, Otopark Katı -2',
    city: 'İstanbul',
    district: 'Üsküdar / Kadıköy',
    location: { latitude: 41.0014, longitude: 29.0543 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 180, currentType: 'DC (Hızlı)', quantity: 2, status: 'Boş / Uygun' },
      { type: 'Type 2 (Socket)', powerKw: 22, currentType: 'AC', quantity: 4, status: 'Boş / Uygun' }
    ],
    socketCount: 6,
    status: 'Operasyonel / Aktif',
    usageCost: '11.50 TL/kWh (DC), 8.90 TL/kWh (AC)',
    phone: '+90 850 808 8937'
  },
  {
    id: 195433,
    name: 'Trugo - Kadıköy Tepe Nautilus AVM',
    provider: 'Trugo (Togg)',
    address: 'Fatih Cad. No:1, Kapalı Otopark P1',
    city: 'İstanbul',
    district: 'Kadıköy',
    location: { latitude: 40.9997, longitude: 29.0345 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 300, currentType: 'DC (Ultra Hızlı)', quantity: 2, status: 'Boş / Uygun' },
      { type: 'CCS (Type 2)', powerKw: 180, currentType: 'DC (Hızlı)', quantity: 2, status: 'Boş / Uygun' }
    ],
    socketCount: 4,
    status: 'Operasyonel / Aktif',
    usageCost: '11.80 TL/kWh (DC 300kW)',
    phone: '+90 850 808 8784'
  },
  {
    id: 195434,
    name: 'Eşarj - Zorlu Center',
    provider: 'Eşarj (Enerjisa)',
    address: 'Levazım Mah. Koru Sok. No:2, Otopark P3',
    city: 'İstanbul',
    district: 'Beşiktaş',
    location: { latitude: 41.0667, longitude: 29.0172 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 120, currentType: 'DC (Hızlı)', quantity: 2, status: 'Boş / Uygun' },
      { type: 'Type 2 (Socket)', powerKw: 22, currentType: 'AC', quantity: 4, status: 'Boş / Uygun' }
    ],
    socketCount: 6,
    status: 'Operasyonel / Aktif',
    usageCost: '10.90 TL/kWh (DC), 8.50 TL/kWh (AC)',
    phone: '+90 850 433 7275'
  },
  {
    id: 195435,
    name: 'Tesla Supercharger - Ankara Armada AVM',
    provider: 'Tesla Supercharger',
    address: 'Eskişehir Yolu No:6, Açık Otopark',
    city: 'Ankara',
    district: 'Yenimahalle / Çankaya',
    location: { latitude: 39.9125, longitude: 32.8094 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 250, currentType: 'DC (V3 Supercharger)', quantity: 8, status: 'Boş / Uygun' }
    ],
    socketCount: 8,
    status: 'Operasyonel / Aktif',
    usageCost: 'Tesla Sahipleri: 8.90 TL/kWh, Diğer: 11.20 TL/kWh',
    phone: '+90 212 900 1903'
  },
  {
    id: 195436,
    name: 'Voltrun - İzmir İstinyePark',
    provider: 'Voltrun',
    address: 'Bahçelerarası Mah. Şehit Binbaşı Ali Resmi Tufan Cad.',
    city: 'İzmir',
    district: 'Balçova / Konak',
    location: { latitude: 38.3972, longitude: 27.0547 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 150, currentType: 'DC (Hızlı)', quantity: 2, status: 'Boş / Uygun' },
      { type: 'Type 2 (Socket)', powerKw: 22, currentType: 'AC', quantity: 2, status: 'Boş / Uygun' }
    ],
    socketCount: 4,
    status: 'Operasyonel / Aktif',
    usageCost: '10.80 TL/kWh (DC), 8.40 TL/kWh (AC)',
    phone: '+90 216 465 6565'
  },
  {
    id: 195437,
    name: 'Astor Şarj - Bursa Korupark AVM',
    provider: 'Astor Şarj',
    address: 'Adnan Menderes Mah. Mudanya Yolu Cad. No:2',
    city: 'Bursa',
    district: 'Osmangazi / Nilüfer',
    location: { latitude: 40.2458, longitude: 28.9669 },
    sockets: [
      { type: 'CCS (Type 2)', powerKw: 200, currentType: 'DC (Ultra Hızlı)', quantity: 2, status: 'Boş / Uygun' },
      { type: 'Type 2 (Socket)', powerKw: 22, currentType: 'AC', quantity: 2, status: 'Boş / Uygun' }
    ],
    socketCount: 4,
    status: 'Operasyonel / Aktif',
    usageCost: '10.90 TL/kWh (DC), 8.50 TL/kWh (AC)',
    phone: '+90 850 308 0808'
  }
];

function normalizeSearchText(str) {
  if (!str) return '';
  return String(str)
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

/**
 * Open Charge Map POI veri modelini standart TurkiyemCLI istasyon nesnesine dönüştürür.
 */
function mapOcmPoiToStation(poi) {
  const addressInfo = poi.AddressInfo || {};
  const operatorInfo = poi.OperatorInfo || {};
  const statusInfo = poi.StatusType || {};

  const sockets = Array.isArray(poi.Connections)
    ? poi.Connections.map(conn => {
        const typeName = conn.ConnectionType?.Title || 'Bilinmeyen Soket';
        const powerKw = conn.PowerKW || (conn.LevelID === 3 ? 120 : (conn.LevelID === 2 ? 22 : null));
        const currentTitle = conn.CurrentType?.Title || (conn.LevelID === 3 ? 'DC (Hızlı)' : 'AC');
        const isOperational = conn.StatusType?.IsOperational ?? true;
        const status = isOperational ? 'Boş / Uygun' : 'Kullanım Dışı';
        const quantity = conn.Quantity || 1;

        return {
          type: typeName,
          powerKw: powerKw || '-',
          currentType: currentTitle,
          quantity,
          status,
          comments: conn.Comments || null
        };
      })
    : [];

  const totalSockets = sockets.reduce((acc, s) => acc + (s.quantity || 1), 0) || poi.NumberOfPoints || 1;

  return {
    id: poi.ID,
    name: addressInfo.Title || 'Şarj İstasyonu',
    provider: operatorInfo.Title || 'Bağımsız / Diğer',
    address: [addressInfo.AddressLine1, addressInfo.AddressLine2].filter(Boolean).join(', ') || addressInfo.Title || '-',
    city: addressInfo.StateOrProvince || addressInfo.Town || '-',
    district: addressInfo.Town || '-',
    location: {
      latitude: addressInfo.Latitude,
      longitude: addressInfo.Longitude
    },
    sockets,
    socketCount: totalSockets,
    status: statusInfo.Title || (statusInfo.IsOperational ? 'Operasyonel' : 'Bilinmiyor'),
    usageCost: poi.UsageCost || 'Standart Tarife',
    phone: operatorInfo.PhonePrimaryContact || addressInfo.ContactTelephone1 || null,
    website: operatorInfo.WebsiteURL || null,
    accessComments: addressInfo.AccessComments || null
  };
}

/**
 * Şehir veya ilçe adına göre koordinat bulur.
 */
async function resolveLocationCoordinates(query) {
  const norm = normalizeSearchText(query);
  if (TURKEY_CITY_COORDS[norm]) {
    return TURKEY_CITY_COORDS[norm];
  }

  // Open-Meteo Geocoding API ile koordinat çözümleme
  try {
    const geoResponse = await axios.get(GEOCODING_URL, {
      params: {
        name: query,
        count: 1,
        language: 'tr',
        format: 'json'
      },
      timeout: 5000
    });

    const first = geoResponse.data?.results?.[0];
    if (first && first.latitude && first.longitude) {
      return {
        lat: first.latitude,
        lng: first.longitude,
        name: [first.name, first.admin1].filter(Boolean).join(', ')
      };
    }
  } catch {
    // Geocoding başarısız olursa null döner
  }

  return null;
}

/**
 * Türkiye'deki tüm elektrikli araç şarj istasyonu sağlayıcılarını listeler.
 */
export async function fetchChargingProviders() {
  const cacheKey = 'sarj_ocm_providers';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = getSarjApiKey();

  if (apiKey) {
    try {
      const response = await axios.get(`${OCM_API_BASE_URL}/referencedata/`, {
        params: { key: apiKey },
        headers: {
          ...DEFAULT_HEADERS,
          'X-API-Key': apiKey
        },
        timeout: 10000
      });

      const operators = response.data?.Operators || [];
      if (Array.isArray(operators) && operators.length > 0) {
        // Türkiye'deki bilinen sağlayıcılarla zenginleştir
        const matched = KNOWN_PROVIDERS.map(kp => {
          const found = operators.find(o => 
            (kp.operatorId && o.ID === kp.operatorId) ||
            normalizeSearchText(o.Title).includes(kp.slug)
          );
          return {
            ...kp,
            name: found?.Title || kp.name,
            website: found?.WebsiteURL || null
          };
        });

        setCached(cacheKey, matched, CACHE_TTL.LONG);
        return matched;
      }
    } catch {
      // OCM API hata verirse yerel sağlayıcı listesine devam et
    }
  }

  setCached(cacheKey, KNOWN_PROVIDERS, CACHE_TTL.LONG);
  return KNOWN_PROVIDERS;
}

/**
 * Şarj istasyonu arar (kelime, şehir, ilçe veya sağlayıcı).
 * @param {string} query
 * @param {Object} [options]
 */
export async function searchChargingStations(query, options = {}) {
  const rawQuery = (query || options.sehir || '').trim();
  const normQuery = normalizeSearchText(rawQuery);
  const cacheKey = `sarj_ocm_search_${encodeURIComponent(normQuery)}_${JSON.stringify(options)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = getSarjApiKey();
  let stations = [];

  if (apiKey) {
    try {
      const location = await resolveLocationCoordinates(rawQuery);
      const params = {
        countrycode: 'TR',
        maxresults: 50,
        compact: false,
        verbose: false,
        key: apiKey
      };

      if (location) {
        params.latitude = location.lat;
        params.longitude = location.lng;
        params.distance = options.mesafe || 30;
        params.distanceunit = 'KM';
      }

      // Sağlayıcı filtresi kontrolü (örn. "zes", "trugo", "esarj")
      const matchedProvider = KNOWN_PROVIDERS.find(p => normQuery.includes(p.slug));
      if (matchedProvider?.operatorId) {
        params.operatorid = matchedProvider.operatorId;
      }

      const response = await axios.get(`${OCM_API_BASE_URL}/poi/`, {
        params,
        headers: {
          ...DEFAULT_HEADERS,
          'X-API-Key': apiKey
        },
        timeout: 12000
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        stations = response.data.map(mapOcmPoiToStation);

        // Metin filtresi (eğer koordinat eşleşmesi yerine metin bazlı arandıysa)
        if (!location && normQuery) {
          stations = stations.filter(st => {
            const searchable = normalizeSearchText(`${st.name} ${st.provider} ${st.city} ${st.district} ${st.address}`);
            return searchable.includes(normQuery);
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error('Open Charge Map API anahtarı geçersiz. Kontrol etmek için: turkiyem sarj key <API_KEY>');
      }
    }
  }

  // API Anahtarı yoksa veya API'den sonuç dönmediyse yerel verilerle filtrele
  if (stations.length === 0) {
    if (!normQuery) {
      stations = FALLBACK_STATIONS;
    } else {
      stations = FALLBACK_STATIONS.filter(st => {
        const fullStr = normalizeSearchText(`${st.name} ${st.provider} ${st.city} ${st.district} ${st.address}`);
        return fullStr.includes(normQuery);
      });
    }
  }

  setCached(cacheKey, stations, CACHE_TTL.DEFAULT);
  return stations;
}

/**
 * Tek bir şarj istasyonunun detaylı bilgilerini sorgular.
 * @param {string|number} stationId
 */
export async function fetchChargingStationDetail(stationId) {
  const id = String(stationId).trim();
  const cacheKey = `sarj_ocm_detail_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = getSarjApiKey();

  if (apiKey) {
    try {
      const response = await axios.get(`${OCM_API_BASE_URL}/poi/`, {
        params: {
          chargepointid: id,
          key: apiKey
        },
        headers: {
          ...DEFAULT_HEADERS,
          'X-API-Key': apiKey
        },
        timeout: 10000
      });

      const poi = Array.isArray(response.data) ? response.data[0] : response.data;
      if (poi && poi.ID) {
        const detail = mapOcmPoiToStation(poi);
        setCached(cacheKey, detail, CACHE_TTL.DEFAULT);
        return detail;
      }
    } catch (err) {
      if (err.response?.status === 404) {
        throw new Error(`"${id}" ID'li şarj istasyonu bulunamadı.`);
      }
    }
  }

  // Fallback veriden ara
  const fallback = FALLBACK_STATIONS.find(s => String(s.id) === id);
  if (fallback) {
    setCached(cacheKey, fallback, CACHE_TTL.DEFAULT);
    return fallback;
  }

  throw new Error(`"${id}" ID'li şarj istasyonu bulunamadı.`);
}

export { KNOWN_PROVIDERS, FALLBACK_STATIONS };

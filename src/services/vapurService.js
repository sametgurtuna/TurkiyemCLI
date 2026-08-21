import axios from 'axios';
import { CACHE_TTL, getCached, setCached } from '../utils/cache.js';
import { BROWSER_USER_AGENT } from '../utils/httpClient.js';

const IZDENIZ_PIERS_URL = 'https://openapi.izmir.bel.tr/api/izdeniz/iskeleler';

const SEHIR_HATLARI_ROUTES = [
  {
    code: 'KB',
    name: 'Kadıköy - Beşiktaş',
    departure: 'Kadıköy İskelesi',
    arrival: 'Beşiktaş İskelesi',
    duration: '20 dk',
    type: 'Yolcu Vapuru',
    frequency: 'Her 15-20 dakikada bir',
  },
  {
    code: 'KK-EM',
    name: 'Kadıköy - Karaköy - Eminönü',
    departure: 'Kadıköy İskelesi',
    arrival: 'Eminönü İskelesi',
    duration: '25 dk',
    type: 'Yolcu Vapuru',
    frequency: 'Her 15-20 dakikada bir',
  },
  {
    code: 'US-EM',
    name: 'Üsküdar - Karaköy - Eminönü',
    departure: 'Üsküdar İskelesi',
    arrival: 'Eminönü İskelesi',
    duration: '15 dk',
    type: 'Yolcu Vapuru',
    frequency: 'Her 10-15 dakikada bir',
  },
  {
    code: 'ADALAR',
    name: 'Kabataş - Kadıköy - Kınalıada - Heybeliada - Büyükada',
    departure: 'Kabataş / Kadıköy',
    arrival: 'Büyükada İskelesi',
    duration: '1 sa 15 dk',
    type: 'Adalar Vapuru',
    frequency: 'Saat başı',
  },
  {
    code: 'HALIC',
    name: 'Üsküdar - Karaköy - Kasımpaşa - Fener - Eyüpsultan',
    departure: 'Üsküdar İskelesi',
    arrival: 'Eyüpsultan İskelesi',
    duration: '50 dk',
    type: 'Haliç Hattı',
    frequency: 'Her 30-45 dakikada bir',
  },
  {
    code: 'BOGAZ',
    name: 'Çengelköy - Bebek - Kanlıca - İstinye',
    departure: 'Çengelköy İskelesi',
    arrival: 'İstinye İskelesi',
    duration: '35 dk',
    type: 'Boğaz Ring Hattı',
    frequency: 'Her 30 dakikada bir',
  },
  {
    code: 'ASIYAN',
    name: 'Aşiyan - Anadolu Hisarı - Küçüksu',
    departure: 'Aşiyan İskelesi (M6 Metro Bağlantılı)',
    arrival: 'Küçüksu İskelesi',
    duration: '10 dk',
    type: 'Boğaz Geçiş Hattı',
    frequency: 'Her 20 dakikada bir',
  },
  {
    code: 'ARABALI',
    name: 'İstinye - Çubuklu (Arabalı Vapur)',
    departure: 'İstinye İskelesi',
    arrival: 'Çubuklu İskelesi',
    duration: '8 dk',
    type: 'Arabalı Vapur',
    frequency: 'Her 15-20 dakikada bir',
  },
];

/**
 * İzmir İZDENİZ İskelelerini çeker.
 */
export async function fetchIzdenizPiers() {
  const cacheKey = 'izdeniz_piers';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(IZDENIZ_PIERS_URL, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    const piers = Array.isArray(response.data) ? response.data : [];
    const parsed = piers.map((p) => ({
      id: p.IskeleId,
      name: p.Adi,
      isActive: p.AktifMi,
      isCarFerry: p.ArabaliVapurIskelesiMi,
      latitude: p.Enlem,
      longitude: p.Boylam,
    }));

    setCached(cacheKey, parsed, CACHE_TTL.LONG || 604800);
    return parsed;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('İZDENİZ servisi zaman aşımına uğradı.');
    }
    throw new Error(`İZDENİZ verisi alınamadı: ${error.message}`);
  }
}

/**
 * İstanbul Şehir Hatları ana hatlarını döner.
 */
export function getSehirHatlariRoutes() {
  return SEHIR_HATLARI_ROUTES;
}

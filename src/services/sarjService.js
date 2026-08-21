import axios from 'axios';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';

const SARJ_API_BASE_URL = process.env.SARJ_API_BASE_URL || 'https://api.sarj.dev/v1';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://sarj.dev',
  'Referer': 'https://sarj.dev/',
  'Accept': 'application/json, text/plain, */*'
};

// Fallback Sağlayıcı Listesi (Sunucu bakımdayken veya 502 anında kullanıcıyı yanıtsız bırakmamak için)
const KNOWN_PROVIDERS = [
  { name: 'ZES (Zorlu Energy Solutions)', slug: 'zes', stationCount: 1500, socketCount: 3800 },
  { name: 'Trugo (Togg)', slug: 'trugo', stationCount: 650, socketCount: 1800 },
  { name: 'Eşarj (Enerjisa)', slug: 'esarj', stationCount: 1100, socketCount: 2600 },
  { name: 'Voltrun', slug: 'voltrun', stationCount: 450, socketCount: 950 },
  { name: 'Sharz.net', slug: 'sharz', stationCount: 380, socketCount: 820 },
  { name: 'Beefull', slug: 'beefull', stationCount: 220, socketCount: 510 },
  { name: 'Astor Şarj', slug: 'astor', stationCount: 310, socketCount: 700 },
  { name: 'Shrak Şarj', slug: 'shrak', stationCount: 120, socketCount: 250 },
  { name: 'Tunçmatik Powerşarj', slug: 'powersarj', stationCount: 180, socketCount: 390 },
  { name: 'Enerya Şarj', slug: 'enerya', stationCount: 90, socketCount: 180 }
];

/**
 * Türkiye'deki tüm elektrikli araç şarj istasyonu sağlayıcılarını listeler.
 */
export async function fetchChargingProviders() {
  const cacheKey = 'sarj_providers';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${SARJ_API_BASE_URL}/charging-station-providers`, {
      headers: DEFAULT_HEADERS,
      timeout: 10000
    });

    const data = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.providers || []);
    if (data.length > 0) {
      setCached(cacheKey, data, CACHE_TTL.LONG);
      return data;
    }
    return KNOWN_PROVIDERS;
  } catch (err) {
    if (err.response?.status === 502 || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      // Upstream geçici olarak kapalıysa fallback sağlayıcı listesini dön
      return KNOWN_PROVIDERS;
    }
    throw err;
  }
}

/**
 * Şarj istasyonu arar (kelime, şehir, ilçe, sağlayıcı).
 * @param {string} query
 * @param {Object} [options]
 */
export async function searchChargingStations(query, options = {}) {
  const q = (query || '').trim().toLowerCase();
  const cacheKey = `sarj_search_${encodeURIComponent(q)}_${JSON.stringify(options)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${SARJ_API_BASE_URL}/search`, {
      params: { query: q, ...options },
      headers: DEFAULT_HEADERS,
      timeout: 10000
    });

    const data = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.stations || response.data?.results || []);
    setCached(cacheKey, data, CACHE_TTL.DEFAULT);
    return data;
  } catch (err) {
    if (err.response?.status === 502) {
      throw new Error('sarj.dev API sunucusu şu anda bakımda (502 Bad Gateway). Lütfen kısa süre sonra tekrar deneyin.');
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error('sarj.dev API yanıt vermedi (zaman aşımı).');
    }
    if (err.response?.data?.message || err.response?.data?.error) {
      throw new Error(err.response.data.message || err.response.data.error);
    }
    throw err;
  }
}

/**
 * Tek bir şarj istasyonunun detaylı soket, güç ve adres bilgilerini sorgular.
 * @param {string|number} stationId
 */
export async function fetchChargingStationDetail(stationId) {
  const id = String(stationId).trim();
  const cacheKey = `sarj_detail_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${SARJ_API_BASE_URL}/charging-stations/${id}/detail`, {
      headers: DEFAULT_HEADERS,
      timeout: 10000
    });

    const data = response.data?.data || response.data;
    if (!data) {
      throw new Error(`"${id}" ID'li şarj istasyonu bulunamadı.`);
    }

    setCached(cacheKey, data, CACHE_TTL.DEFAULT);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`"${id}" ID'li şarj istasyonu bulunamadı.`);
    }
    if (err.response?.status === 502) {
      throw new Error('sarj.dev API sunucusu şu anda bakımda (502 Bad Gateway).');
    }
    if (err.response?.data?.message || err.response?.data?.error) {
      throw new Error(err.response.data.message || err.response.data.error);
    }
    throw err;
  }
}

import axios from 'axios';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';
import { getEczaneApiKey } from '../utils/config.js';

const ECZANE_API_BASE_URL = 'https://eczaneapi.com/api/v1';

function getEczaneApiHeaders(apiKey) {
    const key = apiKey || getEczaneApiKey();
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };
    if (key) {
        headers['x-api-key'] = key;
    }
    return headers;
}

/**
 * EczaneAPI.com üzerinden nöbetçi eczaneleri listeler.
 * @param {Object} options - { city, district, date, apiKey }
 */
export async function fetchEczaneApiNobetci({ city, district, date, apiKey } = {}) {
    const cacheKey = `eczaneapi_nobetci_${city || 'all'}_${district || 'all'}_${date || 'today'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const params = {};
    if (city) params.city = city.toLowerCase();
    if (district) params.district = district.toLowerCase();
    if (date) params.date = date;

    try {
        const response = await axios.get(`${ECZANE_API_BASE_URL}/pharmacies/on-duty`, {
            params,
            headers: getEczaneApiHeaders(apiKey),
            timeout: 10000
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'Nöbetçi eczane verisi alınamadı.');
        }

        const data = response.data.data || [];
        setCached(cacheKey, data, 1800); // 30 minutes cache
        return data;
    } catch (err) {
        if (err.response?.status === 401) {
            throw new Error('EczaneAPI anahtarı geçersiz veya eksik. Lütfen geçerli bir API Key girin.');
        }
        if (err.response?.status === 429) {
            throw new Error('EczaneAPI aylık istek kotanız doldu.');
        }
        if (err.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    }
}

/**
 * EczaneAPI.com üzerinden tek bir eczanenin detay bilgisini çeker.
 * @param {string} pharmacyId
 * @param {string} [apiKey]
 */
export async function fetchEczaneApiDetail(pharmacyId, apiKey) {
    const cacheKey = `eczaneapi_detail_${pharmacyId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ECZANE_API_BASE_URL}/pharmacies/${pharmacyId}`, {
            headers: getEczaneApiHeaders(apiKey),
            timeout: 10000
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'Eczane detayı bulunamadı.');
        }

        const data = response.data.data;
        setCached(cacheKey, data, CACHE_TTL.DEFAULT);
        return data;
    } catch (err) {
        if (err.response?.status === 401) {
            throw new Error('EczaneAPI anahtarı geçersiz veya eksik.');
        }
        if (err.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    }
}

/**
 * EczaneAPI.com üzerindeki tüm 81 ili listeler.
 * @param {string} [apiKey]
 */
export async function fetchEczaneApiCities(apiKey) {
    const cacheKey = 'eczaneapi_cities';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ECZANE_API_BASE_URL}/cities`, {
            headers: getEczaneApiHeaders(apiKey),
            timeout: 10000
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'İller listesi alınamadı.');
        }

        const data = response.data.data || [];
        setCached(cacheKey, data, CACHE_TTL.LONG);
        return data;
    } catch (err) {
        if (err.response?.status === 401) {
            throw new Error('EczaneAPI anahtarı geçersiz veya eksik.');
        }
        if (err.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    }
}

/**
 * EczaneAPI.com üzerinden belirtilen ilin tüm ilçelerini listeler.
 * @param {string} citySlug
 * @param {string} [apiKey]
 */
export async function fetchEczaneApiDistricts(citySlug, apiKey) {
    const slug = citySlug.toLowerCase();
    const cacheKey = `eczaneapi_districts_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ECZANE_API_BASE_URL}/cities/${slug}/districts`, {
            headers: getEczaneApiHeaders(apiKey),
            timeout: 10000
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'İlçeler listesi alınamadı.');
        }

        const data = response.data.data || {};
        setCached(cacheKey, data, CACHE_TTL.LONG);
        return data;
    } catch (err) {
        if (err.response?.status === 401) {
            throw new Error('EczaneAPI anahtarı geçersiz veya eksik.');
        }
        if (err.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    }
}

/**
 * EczaneAPI.com üzerinden konuma yakın nöbetçi eczaneleri listeler.
 * @param {Object} options - { lat, lng, radius, apiKey }
 */
export async function fetchEczaneApiNearby({ lat, lng, radius = 5, apiKey } = {}) {
    const cacheKey = `eczaneapi_nearby_${lat}_${lng}_${radius}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ECZANE_API_BASE_URL}/pharmacies/nearby`, {
            params: {
                latitude: lat,
                longitude: lng,
                radius
            },
            headers: getEczaneApiHeaders(apiKey),
            timeout: 10000
        });

        if (!response.data?.success) {
            throw new Error(response.data?.error || 'Yakındaki eczaneler verisi alınamadı.');
        }

        const data = response.data.data || {};
        setCached(cacheKey, data, 1800);
        return data;
    } catch (err) {
        if (err.response?.status === 401) {
            throw new Error('EczaneAPI anahtarı geçersiz veya eksik.');
        }
        if (err.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    }
}

// ─── Yerel Açık Veri Fallback Servisleri ──────────────────────────────

export async function fetchNobetciEczaneler() {
    const cacheKey = 'izmir_nobetci_eczaneler';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const url = 'https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler';
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 10000
    });
    const data = response.data || [];
    setCached(cacheKey, data, 1800);
    return data;
}

export async function fetchAllEczaneler() {
    const cacheKey = 'izmir_all_eczaneler';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const url = 'https://openapi.izmir.bel.tr/api/ibb/eczaneler';
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 10000
    });
    const data = response.data || [];
    setCached(cacheKey, data, CACHE_TTL.LONG);
    return data;
}

export async function fetchKayseriNobetciEczaneler() {
    const cacheKey = 'kayseri_nobetci_eczaneler';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const url = 'https://acikveri.kayseri.bel.tr/api/kbb/eczane';
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 10000
    });
    const data = response.data || [];
    setCached(cacheKey, data, 1800);
    return data;
}

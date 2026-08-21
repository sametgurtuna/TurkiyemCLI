import { createHttpClient } from '../utils/httpClient.js';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';

const BASE_URL = 'https://openapi.izmir.bel.tr/api/izsu';
const httpClient = createHttpClient();

async function safeFetch(endpoint, cacheKey, ttl = CACHE_TTL.DEFAULT) {
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await httpClient.get(`${BASE_URL}/${endpoint}`, { timeout: 8000 });
        const data = response.data || [];
        if (Array.isArray(data) && data.length > 0) {
            setCached(cacheKey, data, ttl);
        }
        return data;
    } catch {
        // Return empty array gracefully if openapi service is down or maintenance
        return [];
    }
}

/**
 * IZSU Su Kesintileri
 */
export async function getWaterOutages() {
    return safeFetch('arizakaynaklisukesintileri', 'izsu_outages', 180);
}

/**
 * IZSU Baraj Durumları
 */
export async function getDamStatus() {
    return safeFetch('barajdurum', 'izsu_dam_status', 1800);
}

/**
 * IZSU Baraj ve Kuyular
 */
export async function getDamAndWells() {
    return safeFetch('barajvekuyular', 'izsu_dam_wells', 3600);
}

/**
 * IZSU Günlük Su Üretimi
 */
export async function getDailyWaterProduction() {
    return safeFetch('gunluksuuretimi', 'izsu_daily_prod', 3600);
}

/**
 * IZSU Su Üretimi Dağılımı
 */
export async function getWaterProductionDistribution(year) {
    const y = year || new Date().getFullYear();
    return safeFetch(`suuretiminindagilimi?Yil=${y}`, `izsu_prod_dist_${y}`, 3600);
}

/**
 * IZSU Haftalık Su Analizleri
 */
export async function getWeeklyWaterAnalysis() {
    return safeFetch('haftaliksuanalizleri', 'izsu_weekly_analysis', 3600);
}

/**
 * IZSU Çevre İlçe Su Analizleri
 */
export async function getPeripheryWaterAnalysis() {
    return safeFetch('cevreilcesuanalizleri', 'izsu_periphery_analysis', 3600);
}

/**
 * IZSU Şubeler
 */
export async function getBranches() {
    return safeFetch('subeler', 'izsu_branches', 86400);
}

/**
 * IZSU Vezneler
 */
export async function getCashDesks() {
    return safeFetch('vezneler', 'izsu_cashdesks', 86400);
}

/**
 * IZSU Baraj Su Kalite Raporları
 */
export async function getDamWaterQuality() {
    return safeFetch('barajsukaliteraporlari', 'izsu_dam_quality', 3600);
}

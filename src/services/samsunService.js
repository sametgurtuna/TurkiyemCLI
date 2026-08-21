import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';

const BASE_URL = 'https://samulas.com.tr';

/**
 * Fetches the list of all Samsun buses.
 * Returns an array of objects: { id: number, name: string }
 */
export async function fetchSamsunBuses() {
    const cacheKey = 'samsun_buses';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await axios.get(`${BASE_URL}/api/v1/lines/list?page=1&limit=500`, { timeout: 10000 });
    const data = res.data?.data?.data || [];

    const buses = data.map(item => ({
        id: item.id,
        lineNo: item.line_no,
        name: item.text.replace(/\s+/g, ' ').trim()
    }));

    if (buses.length > 0) {
        setCached(cacheKey, buses, CACHE_TTL.LONG);
    }
    return buses;
}

/**
 * Fetches the schedule and stops of a specific Samsun bus.
 * Returns an object with schedule details and stops.
 */
export async function fetchSamsunBusSchedule(lineId) {
    const cacheKey = `samsun_schedule_${lineId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await axios.get(`${BASE_URL}/otobus-detay/${lineId}`, { timeout: 10000 });
    const $ = cheerio.load(res.data);

    let rootTitle = $('div.page-heading h1').text().trim();
    if (!rootTitle) {
        rootTitle = $('title').text().replace('- Samulaş', '').trim();
    }
    if (!rootTitle) {
        rootTitle = `Samsun Hat #${lineId}`;
    }

    const parseTimes = (tabId) => {
        const tab = $(`#${tabId}`);
        const title = tab.find('.row.border').eq(0).text().trim() || 'Kalkış';
        const times = [];
        
        tab.find('div, span, p').each((_, el) => {
            const text = $(el).text().replace('*', '').trim();
            if (/^\d{2}:\d{2}$/.test(text) && !times.includes(text)) {
                times.push(text);
            }
        });

        times.sort();
        return { title, times };
    };

    const haftaIci = parseTimes('haftaIciContent');
    const cumartesi = parseTimes('cumartesiContent');
    const pazar = parseTimes('pazarContent');

    const stops = [];
    const markerScript = $('script').filter((_, el) => $(el).html().includes('L.marker') || $(el).html().includes('bindPopup')).html() || '';
    const matches = [...markerScript.matchAll(/bindPopup\("<b>(.*?)<\/b>"\)/g)];

    matches.forEach(m => {
        stops.push(m[1]);
    });

    const result = {
        busName: rootTitle,
        haftaIci,
        cumartesi,
        pazar,
        stops
    };

    setCached(cacheKey, result, CACHE_TTL.DEFAULT);
    return result;
}

import axios from 'axios';
import https from 'https';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';

const MERSIN_AJAX_URL = 'https://ulasim.mersin.bel.tr/ajax/bilgi.php';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function fetchMersinRoutes(regionOrKeyword) {
    const cacheKey = `mersin_routes_${(regionOrKeyword || 'ALL').toUpperCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    let requestKeyword = 'TUM';
    const regions = ['MERKEZ', 'TARSUS', 'GÜLNAR', 'ANAMUR', 'KÖYLER'];
    
    if (regionOrKeyword && regions.includes(regionOrKeyword.toUpperCase())) {
        requestKeyword = regionOrKeyword.toUpperCase();
    }

    const params = new URLSearchParams();
    params.append('aranan', requestKeyword);
    params.append('tipi', 'hatbilgisi');

    const response = await axios.post(MERSIN_AJAX_URL, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        httpsAgent,
        timeout: 15000
    });

    if (!response.data || !Array.isArray(response.data)) {
        return [];
    }

    let routes = response.data.map(r => {
        const hNo = r.hat_no && r.hat_no['0'] ? r.hat_no['0'].trim() : (typeof r.hat_no === 'string' ? r.hat_no.trim() : '');
        const hAd = r.hat_adi && r.hat_adi['0'] ? r.hat_adi['0'].trim() : (typeof r.hat_adi === 'string' ? r.hat_adi.trim() : '');
        const hYon = r.hat_yon && r.hat_yon['0'] ? r.hat_yon['0'].trim() : (typeof r.hat_yon === 'string' ? r.hat_yon.trim() : '');
        const bolge = r.bolge && r.bolge['0'] ? r.bolge['0'].trim() : (typeof r.bolge === 'string' ? r.bolge.trim() : '');

        return {
            hatNo: hNo,
            hatAdi: hAd,
            yon: hYon,
            bolge: bolge
        };
    });

    // Sadece "G" yönünü (gidiş) alıp filtrelenmiş gösterelim
    routes = routes.filter(r => r.yon === 'G' || !r.yon);

    // Eğer parametre bölge veya 'TUM' değil de spesifik bir arama kelimesiyse filtrele
    if (regionOrKeyword && regionOrKeyword.toUpperCase() !== 'TUM' && !regions.includes(regionOrKeyword.toUpperCase())) {
        const kw = regionOrKeyword.toLocaleUpperCase('tr-TR');
        routes = routes.filter(r =>
            (r.hatNo && r.hatNo.toLocaleUpperCase('tr-TR').includes(kw)) ||
            (r.hatAdi && r.hatAdi.toLocaleUpperCase('tr-TR').includes(kw))
        );
    }

    // Dedup
    const uniqueMap = new Map();
    routes.forEach(r => {
        if (r.hatNo) uniqueMap.set(r.hatNo, r);
    });

    const result = Array.from(uniqueMap.values());
    setCached(cacheKey, result, CACHE_TTL.TRANSIT_LIST);
    return result;
}

export async function fetchMersinSchedule(hatNo) {
    const cacheKey = `mersin_schedule_${hatNo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // API "-G" ile çalışıyor genelde
    let queryHat = hatNo;
    if (!queryHat.endsWith('-G')) {
        queryHat = queryHat + '-G';
    }

    const params = new URLSearchParams();
    params.append('hat_no', queryHat);
    params.append('tipi', 'tarifeler');

    const response = await axios.post(MERSIN_AJAX_URL, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        httpsAgent,
        timeout: 15000
    });

    if (!response.data || !Array.isArray(response.data)) {
        return { haftaIci: [], cumartesi: [], pazar: [] };
    }

    const schedule = {
        haftaIci: [],
        cumartesi: [],
        pazar: []
    };

    response.data.forEach(item => {
        const gun = item.tarife_gun && item.tarife_gun['0'] ? item.tarife_gun['0'].trim() : (typeof item.tarife_gun === 'string' ? item.tarife_gun.trim() : '');
        const saat = item.saat && item.saat['0'] ? item.saat['0'].replace(/\n/g, '').trim() : (typeof item.saat === 'string' ? item.saat.replace(/\n/g, '').trim() : '');

        if (saat) {
            const gunUpper = gun.toLocaleUpperCase('tr-TR');
            if (gunUpper.includes('HAFTA') || gunUpper === 'HAFTAICI' || gunUpper === 'HAFTAİÇİ') {
                schedule.haftaIci.push(saat);
            } else if (gunUpper.includes('CUMARTESİ') || gunUpper.includes('CUMARTESI')) {
                schedule.cumartesi.push(saat);
            } else if (gunUpper.includes('PAZAR')) {
                schedule.pazar.push(saat);
            } else {
                schedule.haftaIci.push(saat);
            }
        }
    });

    setCached(cacheKey, schedule, CACHE_TTL.IETT_SOAP);
    return schedule;
}

import axios from 'axios';
import { CACHE_TTL, getCached, setCached } from '../utils/cache.js';
import { BROWSER_USER_AGENT } from '../utils/httpClient.js';

const IBB_TRAFFIC_INDEX_URL = 'https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex';

/**
 * İBB TKM Trafik Yoğunluk Endeksini çeker.
 */
export async function fetchTrafficIndex() {
  const cacheKey = 'ibb_traffic_index';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(IBB_TRAFFIC_INDEX_URL, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'application/json',
      },
      timeout: 8000,
    });

    const index = typeof response.data?.Result === 'number'
      ? response.data.Result
      : (typeof response.data === 'number' ? response.data : 50);

    let status = 'NORMAL';
    let color = 'yellow';
    let description = 'Olağan şehir içi trafik yoğunluğu.';

    if (index < 30) {
      status = 'AÇIK / AKICI';
      color = 'green';
      description = 'Trafik akıcı, ana arterler ve köprüler açık.';
    } else if (index < 60) {
      status = 'NORMAL';
      color = 'yellow';
      description = 'Olağan şehir içi trafik yoğunluğu.';
    } else if (index < 80) {
      status = 'YOĞUN';
      color = 'hex("#FFA500")'; // Orange
      description = 'Ana arterlerde ve köprü bağlantılarında yavaşlama var.';
    } else {
      status = 'ÇOK YOĞUN / KİLİT';
      color = 'red';
      description = 'Ciddi trafik sıkışıklığı. Toplu taşıma veya metro önerilir.';
    }

    const totalBars = 25;
    const filledBars = Math.round((index / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const result = {
      city: 'İSTANBUL',
      index,
      status,
      color,
      description,
      progressBar,
      updatedAt: timeStr,
    };

    setCached(cacheKey, result, CACHE_TTL.LIVE || 60);
    return result;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('İBB Trafik servisi zaman aşımına uğradı.');
    }
    throw new Error(`İBB Trafik verisi alınamadı: ${error.message}`);
  }
}

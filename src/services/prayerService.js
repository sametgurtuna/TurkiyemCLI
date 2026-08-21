import axios from 'axios';
import { CACHE_TTL, getCached, setCached } from '../utils/cache.js';
import { BROWSER_USER_AGENT } from '../utils/httpClient.js';

const ALADHAN_API_URL = 'https://api.aladhan.com/v1/timingsByCity';

/**
 * Belirtilen şehir için Diyanet İşleri Başkanlığı namaz vakitlerini çeker.
 * @param {string} city Şehir adı (örn: "İstanbul", "Ankara", "İzmir")
 */
export async function fetchPrayerTimes(city = 'Istanbul') {
  const normalizedCity = city.trim().toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');

  const cacheKey = `prayer_times_${normalizedCity}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(ALADHAN_API_URL, {
      params: {
        city: normalizedCity,
        country: 'Turkey',
        method: 13, // 13 = Diyanet İşleri Başkanlığı, Turkey
      },
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    const data = response.data?.data;
    if (!data || !data.timings) {
      throw new Error(`"${city}" için namaz vakitleri verisi alınamadı.`);
    }

    const timings = data.timings;
    const gregorian = data.date?.gregorian?.date || '';
    const hijriDay = data.date?.hijri?.day || '';
    const hijriMonth = data.date?.hijri?.month?.tr || data.date?.hijri?.month?.en || '';
    const hijriYear = data.date?.hijri?.year || '';
    const hijriDate = `${hijriDay} ${hijriMonth} ${hijriYear}`;

    const prayerList = [
      { key: 'imsak', name: 'İmsak', time: timings.Imsak || timings.Fajr },
      { key: 'gunes', name: 'Güneş', time: timings.Sunrise },
      { key: 'ogle', name: 'Öğle', time: timings.Dhuhr },
      { key: 'ikindi', name: 'İkindi', time: timings.Asr },
      { key: 'aksam', name: 'Akşam', time: timings.Maghrib },
      { key: 'yatsi', name: 'Yatsı', time: timings.Isha },
    ];

    // Şimdiki zamana göre sonraki vakti ve kalan süreyi hesapla
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = null;
    let nextIndex = -1;

    for (let i = 0; i < prayerList.length; i++) {
      const [h, m] = prayerList[i].time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        nextPrayer = prayerList[i];
        nextIndex = i;
        break;
      }
    }

    // Eğer bugünkü tüm vakitler geçtiyse sonraki vakit yarınki İmsak'tır
    let diffMinutes = 0;
    if (nextPrayer) {
      const [h, m] = nextPrayer.time.split(':').map(Number);
      diffMinutes = (h * 60 + m) - currentMinutes;
    } else {
      nextPrayer = prayerList[0]; // Yarınki İmsak
      const [h, m] = nextPrayer.time.split(':').map(Number);
      diffMinutes = (24 * 60 - currentMinutes) + (h * 60 + m);
    }

    const remainingHours = Math.floor(diffMinutes / 60);
    const remainingMins = diffMinutes % 60;
    const countdownText = remainingHours > 0
      ? `${remainingHours} saat ${remainingMins} dakika`
      : `${remainingMins} dakika`;

    const result = {
      city: city.toUpperCase(),
      gregorianDate: gregorian,
      hijriDate,
      prayers: prayerList,
      nextPrayer: {
        ...nextPrayer,
        countdownText,
        diffMinutes,
      },
      currentPrayerIndex: nextIndex === -1 ? 5 : (nextIndex === 0 ? 5 : nextIndex - 1),
    };

    setCached(cacheKey, result, 14400); // 4 saat cache
    return result;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Namaz vakitleri servisi zaman aşımına uğradı.');
    }
    throw new Error(`Namaz vakitleri alınamadı: ${error.message}`);
  }
}

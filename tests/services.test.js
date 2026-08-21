import test from 'node:test';
import assert from 'node:assert';
import { decodeMojibake } from '../src/utils/httpClient.js';
import { fetchExchangeRates } from '../src/services/tcmbService.js';
import { fetchEarthquakes, fetchByMagnitude } from '../src/services/afadService.js';
import { resolveLocation } from '../src/services/weatherService.js';
import { fetchNobetciEczaneler, fetchKayseriNobetciEczaneler } from '../src/services/eczaneService.js';
import { fetchAdanaBuses, fetchAdanaBusDetails } from '../src/services/adanaService.js';
import { fetchAntalyaFormOptions } from '../src/services/antalyaService.js';
import { searchBursaRouteAndStation } from '../src/services/bursaService.js';
import { fetchTrabzonBuses } from '../src/services/trabzonService.js';
import { fetchSamsunBuses } from '../src/services/samsunService.js';
import { fetchMersinRoutes } from '../src/services/mersinService.js';
import { fetchFuelPrices } from '../src/services/fuelService.js';
import { fetchPrayerTimes } from '../src/services/prayerService.js';
import { fetchTrafficIndex } from '../src/services/trafficService.js';
import { fetchIzdenizPiers, getSehirHatlariRoutes } from '../src/services/vapurService.js';

test('Mojibake UTF-8 decoder', () => {
  assert.strictEqual(decodeMojibake('ÅžÄ°FA SONDURAK'), 'ŞİFA SONDURAK');
  assert.strictEqual(decodeMojibake('CEVÄ°ZLÄ°BAÄž'), 'CEVİZLİBAĞ');
  assert.strictEqual(decodeMojibake('Normal Text'), 'Normal Text');
});

test('TCMB Exchange Rates Service', async () => {
  const rates = await fetchExchangeRates();
  assert.ok(rates.date, 'Tarih olmalı');
  assert.ok(Array.isArray(rates.currencies), 'Kurlar dizisi olmalı');
  assert.ok(rates.currencies.length > 5, 'En az 5 döviz kuru olmalı');
  const usd = rates.currencies.find(c => c.kodu === 'USD');
  assert.ok(usd, 'USD kuru bulunmalı');
  assert.ok(usd.alis, 'Alış fiyatı olmalı');
});

test('AFAD Earthquake Service', async () => {
  const quakes = await fetchEarthquakes('son24', 5);
  assert.ok(Array.isArray(quakes));
  assert.ok(quakes.length > 0);
  assert.ok(quakes[0].magnitude);
  assert.ok(quakes[0].location);
});

test('Open-Meteo Location Resolver', async () => {
  const loc = await resolveLocation('ankara');
  assert.ok(loc.latitude);
  assert.ok(loc.longitude);
  assert.ok(loc.name.toLowerCase().includes('ankara'));
});

test('Pharmacy Services', async () => {
  const izmir = await fetchNobetciEczaneler();
  assert.ok(Array.isArray(izmir) && izmir.length > 0, 'İzmir nöbetçi eczaneleri gelmeli');
  
  const kayseri = await fetchKayseriNobetciEczaneler();
  assert.ok(Array.isArray(kayseri) && kayseri.length > 0, 'Kayseri nöbetçi eczaneleri gelmeli');
});

test('Adana Transit REST API', async () => {
  const { buses } = await fetchAdanaBuses();
  assert.ok(Array.isArray(buses) && buses.length > 10, 'Adana otobüs listesi gelmeli');
  
  const firstBus = buses[0];
  assert.ok(firstBus.id);
  const details = await fetchAdanaBusDetails(firstBus.id);
  assert.ok(details.busName);
});

test('Antalya Transit Service', async () => {
  const { buses } = await fetchAntalyaFormOptions();
  assert.ok(Array.isArray(buses) && buses.length > 10, 'Antalya otobüs listesi gelmeli');
});

test('Bursa Transit Service', async () => {
  const routes = await searchBursaRouteAndStation('B24');
  assert.ok(Array.isArray(routes));
});

test('Trabzon Transit Service', async () => {
  const buses = await fetchTrabzonBuses();
  assert.ok(Array.isArray(buses) && buses.length > 10);
});

test('Samsun Transit Service', async () => {
  const buses = await fetchSamsunBuses();
  assert.ok(Array.isArray(buses) && buses.length > 10);
});

test('Mersin Transit Service', async () => {
  const routes = await fetchMersinRoutes('TUM');
  assert.ok(Array.isArray(routes) && routes.length > 10, 'Mersin hat listesi gelmeli');
});

test('EV Charging Providers Service (sarj.dev)', async () => {
  const { fetchChargingProviders } = await import('../src/services/sarjService.js');
  const providers = await fetchChargingProviders();
  assert.ok(Array.isArray(providers) && providers.length > 0, 'Şarj sağlayıcıları listesi gelmeli');
  assert.ok(providers.some(p => (p.slug || p.code || '').toLowerCase().includes('zes') || (p.name || '').includes('ZES')));
});

test('Fuel Prices Service (Opet)', async () => {
  const data = await fetchFuelPrices('34');
  assert.ok(data.provinceName, 'İl adı olmalı');
  assert.ok(Array.isArray(data.districts) && data.districts.length > 0, 'İlçe fiyatları olmalı');
  assert.ok(data.summary?.benzin, 'Benzin fiyatı bulunmalı');
});

test('Prayer Times Service (Diyanet)', async () => {
  const data = await fetchPrayerTimes('istanbul');
  assert.ok(data.city);
  assert.ok(Array.isArray(data.prayers) && data.prayers.length === 6, '6 namaz vakti olmalı');
  assert.ok(data.nextPrayer?.countdownText, 'Geri sayım süresi hesaplanmış olmalı');
});

test('IBB Traffic Index Service', async () => {
  const data = await fetchTrafficIndex();
  assert.strictEqual(data.city, 'İSTANBUL');
  assert.ok(typeof data.index === 'number');
  assert.ok(data.progressBar);
});

test('Ferry Services (IZDENIZ & Sehir Hatlari)', async () => {
  const izdeniz = await fetchIzdenizPiers();
  assert.ok(Array.isArray(izdeniz) && izdeniz.length > 5, 'İzmir iskeleleri gelmeli');

  const sehirHatlari = getSehirHatlariRoutes();
  assert.ok(Array.isArray(sehirHatlari) && sehirHatlari.length > 3, 'Şehir Hatları rotaları gelmeli');
});

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

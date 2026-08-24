import { createTable } from '../utils/ui.js';
import chalk from 'chalk';

/**
 * Şarj sağlayıcıları tablosu
 */
export function createProvidersTable(providers) {
  const table = createTable({
    head: [
      chalk.white.bold('#'),
      chalk.white.bold('Sağlayıcı Adı'),
      chalk.white.bold('Kod / Slug'),
      chalk.white.bold('İstasyon Sayısı'),
      chalk.white.bold('Soket Sayısı')
    ],
    colWidths: [6, 26, 20, 18, 16],
    style: { head: [], border: ['gray'] },
  });

  providers.forEach((p, idx) => {
    const name = p.name || p.title || p.providerName || '-';
    const slug = p.slug || p.code || p.id || '-';
    const stationCount = p.stationCount ?? p.station_count ?? p.totalStations ?? '-';
    const socketCount = p.socketCount ?? p.socket_count ?? p.totalSockets ?? '-';

    table.push([
      String(idx + 1),
      chalk.cyan.bold(name),
      chalk.gray(slug),
      String(stationCount),
      String(socketCount)
    ]);
  });

  return table.toString();
}

/**
 * Şarj istasyonu arama sonuçları tablosu
 */
export function createStationSearchTable(stations) {
  const table = createTable({
    head: [
      chalk.white.bold('ID'),
      chalk.white.bold('İstasyon Adı'),
      chalk.white.bold('Sağlayıcı'),
      chalk.white.bold('İl / İlçe'),
      chalk.white.bold('Mesafe'),
      chalk.white.bold('Soket & Güç'),
      chalk.white.bold('Harita')
    ],
    colWidths: [10, 26, 16, 16, 11, 20, 24],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const s of stations) {
    const id = String(s.id || s.stationId || '-');
    const name = s.name || s.title || s.stationName || '-';
    const provider = s.provider?.name || s.providerName || s.provider || '-';
    const city = s.city?.name || s.city || '';
    const district = s.district?.name || s.district || '';
    const locationStr = [city, district].filter(Boolean).join(' / ') || s.address || '-';
    const distanceStr = s.distanceKm != null ? chalk.green.bold(`${s.distanceKm} km`) : chalk.gray('-');

    let socketSummary = '-';
    if (Array.isArray(s.sockets) && s.sockets.length > 0) {
      socketSummary = s.sockets.map(sock => `${sock.powerKw || sock.power || ''}kW ${sock.type || sock.socketType || ''}`.trim()).filter(Boolean).join(', ');
    } else if (s.socketCount) {
      socketSummary = `${s.socketCount} Soket`;
    }

    const lat = s.location?.latitude || s.location?.lat || s.latitude || s.lat;
    const lng = s.location?.longitude || s.location?.lng || s.longitude || s.lng;
    const mapLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '-';

    table.push([
      chalk.yellow(id),
      chalk.cyan(name),
      chalk.magenta(provider),
      locationStr,
      distanceStr,
      chalk.green(socketSummary),
      chalk.blue.underline(mapLink)
    ]);
  }

  return table.toString();
}

/**
 * İstasyon detay tablosu
 */
export function createStationDetailTable(st) {
  const table = createTable({
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  const name = st.name || st.title || '-';
  const id = String(st.id || '-');
  const provider = st.provider?.name || st.providerName || st.provider || '-';
  const address = st.address || st.fullAddress || '-';
  const city = st.city?.name || st.city || '-';
  const district = st.district?.name || st.district || '-';
  const lat = st.location?.latitude || st.location?.lat || st.latitude;
  const lng = st.location?.longitude || st.location?.lng || st.longitude;
  const mapLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '-';

  table.push(
    { [chalk.cyan('İstasyon Adı')]: chalk.bold(name) },
    { [chalk.cyan('İstasyon ID')]: chalk.yellow(id) },
    { [chalk.cyan('Sağlayıcı')]: chalk.magenta.bold(provider) },
    { [chalk.cyan('İl / İlçe')]: `${city} / ${district}` },
    { [chalk.cyan('Açık Adres')]: address },
    { [chalk.cyan('Harita')]: chalk.blue.underline(mapLink) }
  );

  if (st.distanceKm != null) {
    table.push({ [chalk.cyan('Konumunuza Mesafe')]: chalk.green.bold(`${st.distanceKm} km`) });
  }

  if (st.usageCost) {
    table.push({ [chalk.cyan('Tarife / Ücret')]: chalk.yellow(st.usageCost) });
  }

  if (st.status || st.availability) {
    table.push({ [chalk.cyan('Genel Durum')]: chalk.green(st.status || st.availability) });
  }

  if (st.operatorPhone || st.phone) {
    table.push({ [chalk.cyan('Destek / Telefon')]: st.operatorPhone || st.phone });
  }

  if (st.website) {
    table.push({ [chalk.cyan('Web Sitesi')]: chalk.blue.underline(st.website) });
  }

  if (st.accessComments) {
    table.push({ [chalk.cyan('Erişim Notu')]: chalk.gray(st.accessComments) });
  }

  return table.toString();
}

/**
 * İstasyon soket detayları tablosu
 */
export function createSocketsTable(sockets) {
  const table = createTable({
    head: [
      chalk.white.bold('#'),
      chalk.white.bold('Soket Tipi'),
      chalk.white.bold('Akım (AC/DC)'),
      chalk.white.bold('Maks Güç (kW)'),
      chalk.white.bold('Durum'),
      chalk.white.bold('Birim Fiyat')
    ],
    colWidths: [6, 18, 16, 16, 16, 18],
    style: { head: [], border: ['gray'] },
  });

  sockets.forEach((s, idx) => {
    const type = s.type || s.socketType || s.name || '-';
    const current = s.currentType || s.powerType || (s.isDC ? 'DC (Hızlı)' : 'AC') || '-';
    const power = s.powerKw || s.power || s.maxPower || '-';
    const status = s.status || (s.isAvailable ? chalk.green('Boş / Uygun') : chalk.red('Dolu / Meşgul'));
    const price = s.price || s.unitPrice || s.pricePerKwh ? `${s.price || s.unitPrice || s.pricePerKwh} TL/kWh` : '-';

    table.push([
      String(idx + 1),
      chalk.cyan(type),
      chalk.yellow(current),
      chalk.green.bold(`${power} kW`),
      status,
      chalk.white(price)
    ]);
  });

  return table.toString();
}

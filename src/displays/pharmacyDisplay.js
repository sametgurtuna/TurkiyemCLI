import Table from 'cli-table3';
import chalk from 'chalk';

export function createNobetciEczaneTable(eczaneler) {
  const table = new Table({
    head: [
      chalk.white.bold('İlçe'),
      chalk.white.bold('Eczane Adı'),
      chalk.white.bold('Telefon'),
      chalk.white.bold('Adres'),
      chalk.white.bold('Harita / Detay')
    ],
    colWidths: [14, 22, 16, 38, 28],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const ecz of eczaneler) {
    const name = ecz.name || ecz.Adi || '-';
    const district = ecz.district?.name || ecz.district || ecz.Bolge || '-';
    const phone = ecz.phone || ecz.Telefon || '-';
    const address = ecz.address || ecz.Adres || '-';
    const lat = ecz.location?.latitude || ecz.location?.lat || ecz.LokasyonX;
    const lng = ecz.location?.longitude || ecz.location?.lng || ecz.LokasyonY;

    let mapLink = '-';
    if (lat && lng) {
      mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    } else if (ecz.id) {
      mapLink = `ID: ${ecz.id}`;
    }

    table.push([
      district,
      chalk.cyan(name),
      phone,
      address,
      mapLink.startsWith('http') ? chalk.blue.underline(mapLink) : chalk.gray(mapLink)
    ]);
  }

  return table.toString();
}

export function createEczaneListTable(eczaneler) {
  const table = new Table({
    head: [
      chalk.white.bold('İlçe'),
      chalk.white.bold('Eczane Adı'),
      chalk.white.bold('Telefon'),
      chalk.white.bold('Adres'),
      chalk.white.bold('Harita')
    ],
    colWidths: [14, 22, 16, 38, 28],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const ecz of eczaneler) {
    const name = ecz.name || ecz.Adi || '-';
    const district = ecz.district?.name || ecz.district || ecz.Bolge || '-';
    const phone = ecz.phone || ecz.Telefon || '-';
    const address = ecz.address || ecz.Adres || '-';
    const lat = ecz.location?.latitude || ecz.location?.lat || ecz.LokasyonX;
    const lng = ecz.location?.longitude || ecz.location?.lng || ecz.LokasyonY;

    let mapLink = '-';
    if (lat && lng) {
      mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    }

    table.push([
      district,
      chalk.cyan(name),
      phone,
      address,
      chalk.blue.underline(mapLink)
    ]);
  }

  return table.toString();
}

export function createPharmacyDetailTable(p) {
  const table = new Table({
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  const city = p.city?.name || p.city || '-';
  const district = p.district?.name || p.district || '-';
  const lat = p.location?.latitude || p.location?.lat;
  const lng = p.location?.longitude || p.location?.lng;
  const mapLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '-';

  table.push(
    { [chalk.cyan('Eczane Adı')]: chalk.bold(p.name || '-') },
    { [chalk.cyan('ID')]: chalk.gray(p.id || '-') },
    { [chalk.cyan('Eczacı / Sahip')]: p.ownerName || '-' },
    { [chalk.cyan('İl / İlçe')]: `${city} / ${district}` },
    { [chalk.cyan('Telefon')]: p.phone || '-' },
    { [chalk.cyan('Telefon 2')]: p.phone2 || '-' },
    { [chalk.cyan('E-posta')]: p.email || '-' },
    { [chalk.cyan('Adres')]: p.address || '-' },
    { [chalk.cyan('24 Saat Açık')]: p.is24Hour ? chalk.green('Evet (7/24)') : chalk.yellow('Hayır') },
    { [chalk.cyan('Teslimat')]: p.hasDelivery ? chalk.green('Var') : 'Yok' },
    { [chalk.cyan('Harita')]: chalk.blue.underline(mapLink) }
  );

  if (p.workingHours && typeof p.workingHours === 'object') {
    const hours = Object.entries(p.workingHours)
      .map(([day, hrs]) => `${day}: ${hrs}`)
      .join(', ');
    table.push({ [chalk.cyan('Çalışma Saatleri')]: hours || '-' });
  }

  return table.toString();
}

export function createEczaneApiCityTable(cities) {
  const table = new Table({
    head: [
      chalk.white.bold('Plaka'),
      chalk.white.bold('İl Adı'),
      chalk.white.bold('Slug'),
      chalk.white.bold('İlçe Sayısı'),
      chalk.white.bold('Eczane Sayısı')
    ],
    colWidths: [8, 20, 18, 14, 16],
    style: { head: [], border: ['gray'] },
  });

  for (const c of cities) {
    table.push([
      c.plateCode || '-',
      chalk.cyan(c.name || '-'),
      c.slug || '-',
      String(c.districtsCount ?? '-'),
      String(c.pharmaciesCount ?? '-')
    ]);
  }

  return table.toString();
}

export function createEczaneApiDistrictTable(cityName, districts) {
  const table = new Table({
    head: [
      chalk.white.bold('#'),
      chalk.white.bold('İlçe Adı'),
      chalk.white.bold('Slug'),
      chalk.white.bold('Eczane Sayısı')
    ],
    colWidths: [6, 25, 25, 16],
    style: { head: [], border: ['gray'] },
  });

  districts.forEach((d, idx) => {
    table.push([
      String(idx + 1),
      chalk.cyan(d.name || '-'),
      d.slug || '-',
      String(d.pharmaciesCount ?? '-')
    ]);
  });

  return table.toString();
}

export function createEczaneNearbyTable(pharmacies) {
  const table = new Table({
    head: [
      chalk.white.bold('Mesafe'),
      chalk.white.bold('Eczane Adı'),
      chalk.white.bold('İlçe'),
      chalk.white.bold('Telefon'),
      chalk.white.bold('Adres'),
      chalk.white.bold('Harita')
    ],
    colWidths: [10, 20, 14, 15, 34, 25],
    style: { head: [], border: ['gray'] },
    wordWrap: true,
  });

  for (const p of pharmacies) {
    const dist = p.distance !== undefined ? `${p.distance} km` : '-';
    const lat = p.location?.latitude || p.location?.lat;
    const lng = p.location?.longitude || p.location?.lng;
    const mapLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '-';

    table.push([
      chalk.green.bold(dist),
      chalk.cyan(p.name || '-'),
      p.district?.name || p.district || '-',
      p.phone || '-',
      p.address || '-',
      chalk.blue.underline(mapLink)
    ]);
  }

  return table.toString();
}

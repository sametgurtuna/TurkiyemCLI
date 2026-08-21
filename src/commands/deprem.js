import prompts from 'prompts';
import boxen from 'boxen';
import { withSpinner } from '../utils/spinnerWrapper.js';
import { fetchEarthquakes, fetchByMagnitude } from '../services/afadService.js';
import { createEarthquakeTable } from '../utils/display.js';
import { emptyState, heading, footnote, terminalWidth } from '../utils/ui.js';
import { colors, icons, symbols } from '../utils/theme.js';

/**
 * 4.0 ve üzeri depremleri en üstte, büyüklüğe göre sıralı bir uyarı kartında gösterir.
 */
function printCriticalAlert(critical) {
  const top = [...critical]
    .sort((a, b) => parseFloat(b.magnitude) - parseFloat(a.magnitude))
    .slice(0, 5);

  const lines = top.map((c) => {
    const mag = parseFloat(c.magnitude);
    const color = mag >= 5.0 ? colors.error : colors.orange;
    return `  ${color.bold(mag.toFixed(1))}  ${colors.title(c.location)}  ${colors.muted(c.date)}`;
  });

  if (critical.length > top.length) {
    lines.push(colors.muted(`  ${symbols.bullet} ve ${critical.length - top.length} deprem daha`));
  }

  console.log(
    boxen(
      `${colors.error.bold(`${symbols.warn}  DİKKAT — 4.0+ büyüklüğünde ${critical.length} deprem`)}\n\n` +
      lines.join('\n'),
      {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderColor: 'red',
        borderStyle: 'round',
        width: Math.min(terminalWidth(), 90),
      }
    )
  );
  console.log('');
}

async function displayPaginatedEarthquakes(earthquakes, limit) {
  const list = limit && parseInt(limit) > 0 ? earthquakes.slice(0, parseInt(limit)) : earthquakes;
  const PAGE_SIZE = 15;
  let page = 0;

  const critical = list.filter((eq) => parseFloat(eq.magnitude) >= 4.0);
  if (critical.length > 0) printCriticalAlert(critical);

  if (limit || !process.stdin.isTTY) {
    console.log(createEarthquakeTable(list));
    console.log(footnote(`${list.length} kayıt gösteriliyor`));
    return;
  }

  while (page * PAGE_SIZE < list.length) {
    const chunk = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const shownSoFar = Math.min((page + 1) * PAGE_SIZE, list.length);

    console.log(createEarthquakeTable(chunk));
    console.log(footnote(`${shownSoFar}/${list.length} kayıt`));

    if ((page + 1) * PAGE_SIZE < list.length) {
      const { devam } = await prompts({
        type: 'confirm',
        name: 'devam',
        message: `Sonraki ${Math.min(PAGE_SIZE, list.length - shownSoFar)} kayıt gösterilsin mi?`,
        initial: true
      });

      if (!devam) break;
      page++;
      console.log('');
    } else {
      break;
    }
  }
}

export async function depremSon24(options = {}) {
  const earthquakes = await withSpinner(
    'AFAD verileri alınıyor (son 24 saat)...',
    () => fetchEarthquakes('son24')
  );

  if (!earthquakes) return; // fail message already printed by wrapper
  if (earthquakes.length === 0) {
    console.log(emptyState('Son 24 saatte kayıtlı deprem bulunamadı.', 'Daha geniş aralık için: turkiyem deprem 7gun'));
    return;
  }

  console.log(heading('Son 24 Saatteki Depremler', `${earthquakes.length} kayıt ${symbols.bullet} AFAD`, icons.quake));
  console.log('');
  await displayPaginatedEarthquakes(earthquakes, options.limit);
}

export async function deprem7Gun(options = {}) {
  const earthquakes = await withSpinner(
    'AFAD verileri alınıyor (son 7 gün)...',
    () => fetchEarthquakes('7gun')
  );

  if (!earthquakes) return;
  if (earthquakes.length === 0) {
    console.log(emptyState('Son 7 günde kayıtlı deprem bulunamadı.'));
    return;
  }

  console.log(heading('Son 7 Gündeki Depremler', `${earthquakes.length} kayıt ${symbols.bullet} AFAD`, icons.quake));
  console.log('');
  await displayPaginatedEarthquakes(earthquakes, options.limit);
}

export async function depremBuyukluk(value, options = {}) {
  const min = parseFloat(value);
  if (isNaN(min)) {
    console.log(emptyState('Geçerli bir büyüklük değeri girin.', 'Örnek: turkiyem deprem buyukluk 4.0'));
    return;
  }

  const earthquakes = await withSpinner(
    `Büyüklüğü >= ${min} olan depremler aranıyor...`,
    () => fetchByMagnitude(min)
  );

  if (!earthquakes) return;
  if (earthquakes.length === 0) {
    console.log(emptyState(
      `Büyüklüğü >= ${min} olan deprem bulunamadı (son 7 gün).`,
      'Eşiği düşürmeyi deneyin, örn: turkiyem deprem buyukluk 3.0'
    ));
    return;
  }

  console.log(heading(`Büyüklük >= ${min} Depremler`, `${earthquakes.length} kayıt ${symbols.bullet} AFAD`, icons.quake));
  console.log('');
  await displayPaginatedEarthquakes(earthquakes, options.limit);
}

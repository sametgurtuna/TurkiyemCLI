import readline from 'node:readline';
import { printBanner } from '../utils/banner.js';
import { getCity } from '../utils/config.js';
import { colors, icons, symbols } from '../utils/theme.js';
import { terminalWidth } from '../utils/ui.js';

function printIntro() {
    console.log(
        colors.title('  🇹🇷 Sürekli oturum modu') +
        colors.muted(' — komutları doğrudan yazabilirsiniz (örn: hat 500T, deprem son24)')
    );
    console.log(
        colors.muted('  Komut tamamlama için ') + colors.cyan('Tab') +
        colors.muted(', geçmiş için ') + colors.cyan('↑/↓') +
        colors.muted(', tüm komutlar için ') + colors.cyan('help') +
        colors.muted(', çıkmak için ') + colors.cyan('exit') +
        colors.muted(' yazın.')
    );
    console.log('');
}

/**
 * Oturum durum çubuğu: aktif şehir ve kısayollar. Her komuttan sonra
 * tekrarlandığı için tek satır tutuluyor.
 */
function sessionStatusLine() {
    const city = getCity();
    const cityLabel = city ? colors.success.bold(city) : colors.warn('seçilmedi');
    const hint = colors.hint(`${symbols.bullet} help ${symbols.bullet} clear ${symbols.bullet} exit`);
    return `  ${colors.muted(`${icons.city}  Şehir:`)} ${cityLabel}   ${hint}`;
}

/**
 * Dinamik prompt — aktif şehri gösterir, böylece kullanıcı hangi şehir
 * bağlamında sorgu yaptığını her satırda görür.
 */
function buildPrompt() {
    const city = getCity();
    const scope = city ? colors.muted(`:${city.toLocaleLowerCase('tr')}`) : '';
    return colors.accentBold('turkiyem') + scope + colors.muted(` ${symbols.arrow} `);
}

function printScreen() {
    console.clear();
    printBanner();
    printIntro();
}

const commands = [
    'sehir', 'hat', 'durak', 'yakit', 'benzin', 'namaz', 'ezan', 'trafik', 'vapur', 'hava', 'deprem', 'eczane', 'sarj', 'doviz', 'ibb', 'izsu', 'temizle', 'help', 'clear', 'exit', 'çıkış'
];

const subcommands = {
    'sehir': ['ankara', 'istanbul', 'adana', 'antalya', 'bursa', 'izmir', 'trabzon', 'samsun', 'mersin', 'kayseri'],
    'hat': ['canli'],
    'yakit': ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana'],
    'benzin': ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana'],
    'namaz': ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'diyarbakir'],
    'vapur': ['istanbul', 'izmir', 'iskeleler'],
    'hava': ['guncel', 'saatlik', 'kalite'],
    'deprem': ['son24', '7gun', 'buyukluk'],
    'eczane': ['nobetci', 'detay', 'sehirler', 'ilceler', 'yakin', 'key', 'ara'],
    'sarj': ['saglayicilar', 'ara', 'detay', 'key'],
    'ibb': ['hatlar', 'duraklar', 'filo', 'garaj', 'kaza'],
    'izsu': ['kesinti', 'baraj', 'uretim', 'sube', 'analiz']
};

function completer(line) {
    const parts = line.trimStart().split(/\s+/);
    let completions = [];

    if (parts.length === 1) {
        completions = commands.filter(c => c.startsWith(parts[0]));
        if (completions.length > 0) return [completions, line];
    } else if (parts.length === 2) {
        const cmd = parts[0];
        if (subcommands[cmd]) {
            const subCompletions = subcommands[cmd].filter(c => c.startsWith(parts[1]));
            if (subCompletions.length > 0) {
                const prefix = line.substring(0, line.length - parts[1].length);
                const mappedCompletions = subCompletions.map(c => prefix + c);
                return [mappedCompletions, line];
            }
        }
    }

    return [[], line];
}

export async function showMenu() {
    printScreen();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
        prompt: buildPrompt(),
        historySize: 200 // Yukarı/aşağı ok tuşu arabellek boyutu
    });

    /** Prompt'u (şehir değişmiş olabilir) tazeleyip yeniden basar. */
    const nextPrompt = () => {
        rl.setPrompt(buildPrompt());
        rl.prompt();
    };

    console.log(sessionStatusLine());
    console.log('');
    nextPrompt();

    rl.on('line', async (line) => {
        const cmd = line.trim();

        if (!cmd) {
            nextPrompt();
            return;
        }

        const lower = cmd.toLocaleLowerCase('tr');

        if (lower === 'exit' || lower === 'çıkış' || lower === 'q') {
            console.log('');
            console.log(colors.cyan(`  Görüşmek üzere! ${icons.exit}`));
            console.log('');
            rl.close();
            return;
        }

        if (lower === 'clear' || lower === 'temizle-ekran') {
            printScreen();
            console.log(sessionStatusLine());
            console.log('');
            nextPrompt();
            return;
        }

        if (lower === 'help' || lower === 'yardım' || lower === 'yardim' || lower === '?' || lower.startsWith('help ')) {
            console.log('');
            const { printHelp } = await import('../utils/banner.js');
            printHelp(cmd.slice(4).trim());
            nextPrompt();
            return;
        }

        const args = cmd.split(' ').filter(Boolean);
        const startedAt = Date.now();

        try {
            const { spawnSync } = await import('node:child_process');
            spawnSync(process.argv[0], [process.argv[1], ...args], { stdio: 'inherit' });
        } catch (err) {
            console.log(colors.error(`\n  ${symbols.fail} Komut çalıştırılamadı: ${err.message}`));
        }

        // Komut çıktısını oturum satırından ayıran ince ayraç + süre bilgisi.
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
        console.log('');
        console.log(colors.hint(`  ${symbols.line.repeat(Math.max(10, Math.min(terminalWidth(), 100) - 2))}`));
        console.log(sessionStatusLine() + colors.hint(`   ${elapsed} sn`));
        console.log('');
        nextPrompt();
    }).on('close', () => {
        process.exit(0);
    });
}

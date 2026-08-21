import chalk from 'chalk';
import readline from 'node:readline';
import { printBanner } from '../utils/banner.js';
import { getCity } from '../utils/config.js';
import { colors, icons, divider } from '../utils/theme.js';

function printIntro() {
    console.log(colors.title(`  🇹🇷 Sürekli oturum modu`) + colors.muted(' — komutları doğrudan yazabilirsiniz (örn: hat 500T, deprem son24)\n'));
    console.log(colors.muted(`  Tüm komutları görmek için ${colors.cyan('help')}${colors.muted(', çıkmak için')} ${colors.cyan('exit')}${colors.muted(' yazın.\n')}`));
}

function printSessionHeader() {
    const city = getCity();
    const cityLabel = city ? colors.success.bold(city) : colors.warn('seçilmedi');
    console.log('');
    console.log(divider());
    console.log(colors.muted(`  ${icons.city}  Aktif şehir: `) + cityLabel + colors.muted(`   │   ${icons.help} help   │   Ctrl+C / exit ile çık`));
    console.log(divider());
    console.log('');
}

function printScreen() {
    console.clear();
    printBanner();
    printIntro();
}

const commands = [
    'sehir', 'hat', 'durak', 'hava', 'deprem', 'eczane', 'doviz', 'ibb', 'izsu', 'temizle', 'help', 'clear', 'exit', 'çıkış'
];

const subcommands = {
    'sehir': ['ankara', 'istanbul', 'adana', 'antalya', 'bursa', 'izmir', 'trabzon', 'samsun', 'mersin', 'kayseri'],
    'hat': ['canli'],
    'hava': ['guncel', 'saatlik', 'kalite'],
    'deprem': ['son24', '7gun', 'buyukluk'],
    'eczane': ['nobetci', 'ara'],
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
        prompt: colors.accentBold('turkiyem') + colors.muted(' ❯ '),
        historySize: 200 // Yukarı/aşağı ok tuşu arabellek boyutu
    });

    printSessionHeader();
    rl.prompt();

    rl.on('line', async (line) => {
        const cmd = line.trim();

        if (cmd.toLowerCase() === 'exit' || cmd.toLowerCase() === 'çıkış') {
            console.log('');
            console.log(colors.cyan(`  Görüşmek üzere! ${icons.exit}`));
            console.log('');
            rl.close();
            return;
        }

        if (cmd.toLowerCase() === 'clear') {
            printScreen();
            printSessionHeader();
            rl.prompt();
            return;
        }

        const args = cmd.split(' ').filter(Boolean);

        if (args.length > 0) {
            try {
                const { spawnSync } = await import('node:child_process');
                spawnSync(process.argv[0], [process.argv[1], ...args], { stdio: 'inherit' });
            } catch (err) {
                console.log(colors.error(`\n  Komut çalıştırılamadı: ${err.message}`));
            }
        }

        printSessionHeader();
        rl.prompt();
    }).on('close', () => {
        process.exit(0);
    });
}

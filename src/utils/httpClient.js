import axios from 'axios';

/**
 * Fixes double-encoded UTF-8 / Windows-1254 (mojibake) characters.
 * E.g., 'ÅžÄ°FA' -> 'ŞİFA', 'Ã‡IRPICI' -> 'ÇIRPICI', 'Ä°NÃ–NÃœ' -> 'İNÖNÜ'
 * @param {string} text 
 * @returns {string}
 */
export function decodeMojibake(text) {
    if (!text || typeof text !== 'string') return text || '';
    
    let converted = text;
    try {
        const bytes = [];
        let isMojibake = false;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 0x80 && code <= 0xFF) isMojibake = true;
            bytes.push(code & 0xFF);
        }
        if (isMojibake) {
            const bufStr = Buffer.from(bytes).toString('utf-8');
            if (!bufStr.includes('\uFFFD')) {
                converted = bufStr;
            }
        }
    } catch {}

    return converted
        .replace(/\u00C5\u009E/g, 'Ş')
        .replace(/\u00C5\u009F/g, 'ş')
        .replace(/\u00C4\u00B0/g, 'İ')
        .replace(/\u00C4\u00B1/g, 'ı')
        .replace(/\u00C3\u0087/g, 'Ç')
        .replace(/\u00C3\u00A7/g, 'ç')
        .replace(/\u00C3\u0096/g, 'Ö')
        .replace(/\u00C3\u00B6/g, 'ö')
        .replace(/\u00C3\u009C/g, 'Ü')
        .replace(/\u00C3\u00BC/g, 'ü')
        .replace(/\u00C4\u009E/g, 'Ğ')
        .replace(/\u00C4\u009F/g, 'ğ')
        .replace(/Åž/g, 'Ş')
        .replace(/ÅŸ/g, 'ş')
        .replace(/Ä°/g, 'İ')
        .replace(/Ä±/g, 'ı')
        .replace(/Ã‡/g, 'Ç')
        .replace(/Ã§/g, 'ç')
        .replace(/Ã–/g, 'Ö')
        .replace(/Ã¶/g, 'ö')
        .replace(/Ãœ/g, 'Ü')
        .replace(/Ã¼/g, 'ü')
        .replace(/Äž/g, 'Ğ')
        .replace(/ÄŸ/g, 'ğ');
}

export const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Creates a centralized HTTP client instance.
 * @param {Object} options Options like baseURL, timeout, headers
 * @returns {import('axios').AxiosInstance}
 */
export function createHttpClient(options = {}) {
    const client = axios.create({
        timeout: 20000,
        headers: {
            'User-Agent': BROWSER_USER_AGENT,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            ...options.headers
        },
        maxRedirects: 5,
        ...options
    });

    client.interceptors.response.use(
        (response) => {
            if (response.status >= 500) {
                throw new Error(`Sunucu Hatası (HTTP ${response.status})`);
            }
            return response;
        },
        (error) => {
            if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
                throw new Error('İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
            }
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
                throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
            }
            const status = error.response ? error.response.status : null;
            if (status === 403) {
                throw new Error('Erişim engeli (403 Forbidden). Sunucu isteği reddetti.');
            }
            if (status) {
                throw new Error(`API Hatası (HTTP ${status}): ${error.message}`);
            }
            throw error;
        }
    );

    return client;
}

// A generic instance for simple GET requests
export const defaultClient = createHttpClient();


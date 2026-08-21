import ora from 'ora';
import { errorBox } from './ui.js';
import { colors } from './theme.js';

/**
 * Hata mesajına göre kullanıcıya yol gösteren kısa bir ipucu üretir.
 * @param {Error} error
 * @returns {string}
 */
function hintForError(error) {
    const message = String(error?.message || '').toLocaleLowerCase('tr');

    if (message.includes('zaman aşımı') || message.includes('timeout')) {
        return 'Bağlantı yavaş olabilir; birazdan tekrar deneyin.';
    }
    if (message.includes('bağlan') || message.includes('sunucu')) {
        return 'İnternet bağlantınızı kontrol edin veya kaynak geçici olarak kapalı olabilir.';
    }
    if (message.includes('bulunamadı')) {
        return `Yazımı kontrol edin. Komut listesi için: ${colors.cyan('turkiyem help')}`;
    }
    return '';
}

/**
 * Wraps an async operation with a standardized console spinner and error handling.
 * @param {string} startMessage Message to show while spinning
 * @param {Function} promiseFunc The async operation returning data
 * @param {Function|string} successMessage Message or resolver function when successful
 * @returns {Promise<any|null>} The result, or null if it fails
 */
export async function withSpinner(startMessage, promiseFunc, successMessage = null) {
    const spinner = ora({ text: startMessage, spinner: 'dots' }).start();

    try {
        const result = await promiseFunc();
        if (successMessage) {
            if (typeof successMessage === 'function') {
                spinner.succeed(successMessage(result));
            } else {
                spinner.succeed(successMessage);
            }
        } else {
            spinner.stop(); // Stop without icon if none provided
        }
        return result;
    } catch (error) {
        spinner.stop();
        console.log(errorBox(error.message, hintForError(error)));
        return null; // By returning null, the caller knows it failed without throwing
    }
}

/**
 * For operations that should handle failure by throwing so caller can abort differently.
 */
export async function withSpinnerStrict(startMessage, promiseFunc, successMessage = null) {
    const spinner = ora({ text: startMessage, spinner: 'dots' }).start();
    try {
        const result = await promiseFunc();
        if (successMessage) {
            spinner.succeed(typeof successMessage === 'function' ? successMessage(result) : successMessage);
        } else {
            spinner.stop();
        }
        return result;
    } catch (error) {
        spinner.stop();
        console.log(errorBox(error.message, hintForError(error)));
        throw error;
    }
}

import test from 'node:test';
import assert from 'node:assert';
import { getCached, setCached, flushCache, CACHE_TTL } from '../src/utils/cache.js';

test('Cache utility operations', async (t) => {
  await t.test('flushCache clears all entries', () => {
    setCached('test_key_1', { value: 123 });
    flushCache();
    assert.strictEqual(getCached('test_key_1'), null);
  });

  await t.test('setCached and getCached retrieves stored data', () => {
    const payload = { city: 'adana', count: 42 };
    setCached('test_adana', payload, 60);
    const retrieved = getCached('test_adana');
    assert.deepStrictEqual(retrieved, payload);
  });

  await t.test('expired entries return null', async () => {
    // 1 second TTL
    setCached('test_short_ttl', { temp: true }, 1);
    assert.ok(getCached('test_short_ttl'));
    
    // Wait for expiration
    await new Promise(r => setTimeout(r, 1100));
    assert.strictEqual(getCached('test_short_ttl'), null);
  });
});

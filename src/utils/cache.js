import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { CONFIG_DIR } from './config.js';

export const CACHE_TTL = Object.freeze({
  DEFAULT: 300,        // 5 dakika
  IETT_SOAP: 180,      // 3 dakika
  IETT_LIVE: 45,       // 45 saniye
  WEATHER_CURRENT: 300,// 5 dakika
  WEATHER_HOURLY: 600, // 10 dakika
  WEATHER_AIR: 600,    // 10 dakika
  TRANSIT_LIST: 3600,  // 1 saat (hat listeleri vb.)
  FINANCE: 1800,       // 30 dakika
});

const CACHE_DIR = path.join(CONFIG_DIR, 'cache');
const memoryCache = new Map();

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Ignore folder creation errors
  }
}

function getCacheFilePath(key) {
  const hash = crypto.createHash('md5').update(String(key)).digest('hex');
  const safePrefix = String(key).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  return path.join(CACHE_DIR, `${safePrefix}_${hash}.json`);
}

export function getCached(key) {
  const now = Date.now();

  // 1. Check in-memory tier
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (entry.expireAt > now) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  // 2. Check disk tier
  try {
    const filePath = getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const entry = JSON.parse(raw);
      if (entry && entry.expireAt > now) {
        memoryCache.set(key, entry);
        return entry.data;
      }
      // Expired, delete file
      try { fs.unlinkSync(filePath); } catch {}
    }
  } catch {
    // If corrupted or read failed, return null
  }

  return null;
}

export function setCached(key, value, ttl = CACHE_TTL.DEFAULT) {
  const now = Date.now();
  const ttlSeconds = typeof ttl === 'number' && ttl > 0 ? ttl : CACHE_TTL.DEFAULT;
  const expireAt = now + (ttlSeconds * 1000);
  const entry = { expireAt, data: value };

  // Set memory
  memoryCache.set(key, entry);

  // Set disk
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
  } catch {
    // Disk write error shouldn't crash the CLI
  }
}

export function flushCache() {
  memoryCache.clear();
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        } catch {}
      }
    }
  } catch {}
}

export default {
  getCached,
  setCached,
  flushCache,
  CACHE_TTL,
};


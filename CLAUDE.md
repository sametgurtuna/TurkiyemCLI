# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`turkiyem` is a Node.js CLI (Commander.js) that aggregates Turkish public-data APIs — public transit for 10 cities, AFAD earthquakes, İZSU water outages/dam levels, on-duty pharmacies, Open-Meteo weather/air quality, and TCMB exchange rates — into one colorful terminal tool. Native ESM (`"type": "module"`), no build/transpile step, Node >= 20.

## Commands

```bash
npm start              # node src/index.js — run the CLI
npm test                # node --test tests/**/*.test.js
node --test tests/cache.test.js         # run a single test file
npm link                # install `turkiyem` globally from source for manual testing
turkiyem temizle        # wipe the persistent disk cache + saved city config (useful when iterating on service code)
```

There is no lint/build script. Tests use Node's built-in `node:test` + `node:assert` (see `tests/cache.test.js`, `tests/services.test.js`) and hit live upstream APIs — expect them to be network-dependent and occasionally flaky.

## Architecture

Layered, per-city-fanout design:

```
src/index.js (Commander wiring)
  → src/commands/*.js   (parse args, read selected city, dispatch, print via displays)
      → src/services/*.js   (one file per city/domain, talks to the upstream API, returns plain data)
          → src/displays/*.js   (cli-table3 / asciichart formatting, re-exported via src/utils/display.js)
      → src/utils/cache.js, httpClient.js, config.js
```

- **City selection is stateful, not per-invocation.** `turkiyem sehir <city>` persists the choice to `~/.turkiyem/config.json` via `src/utils/config.js` (`getCity`/`setCity`). Most commands (`hat`, `durak`) call `getCity()` first and dispatch to a per-city handler map (see `src/commands/hat.js`) — there is no unified transit data model across cities, each city's service returns its own shape and each command has a matching per-city branch/formatter.
- **One service module per data source** in `src/services/`, named `<city|domain>Service.js` (e.g. `iettService.js` for Istanbul SOAP+GTFS, `adanaService.js` for a Next.js REST API, `tcmbService.js` for TCMB's XML feed). Each wraps a different upstream protocol/format (SOAP, GTFS zips via `adm-zip`, REST JSON, XML, scraped HTML via `cheerio`) but should return already-decoded, JS-native data to its caller.
- **Persistent two-tier cache** (`src/utils/cache.js`): in-memory `Map` first, then JSON files under `~/.turkiyem/cache/` (filename = sanitized key prefix + md5 hash), each entry storing its own `expireAt`. Services call `getCached(key)` / `setCached(key, value, ttl)` around their upstream fetch; TTL presets live in `CACHE_TTL` (e.g. `IETT_LIVE: 45`s for live vehicle positions vs `TRANSIT_LIST: 3600`s for static route lists vs `FINANCE: 1800`s). When changing a service's caching behavior, use/extend `CACHE_TTL` rather than hardcoding seconds.
- **Centralized HTTP client** (`src/utils/httpClient.js`): `createHttpClient(options)` builds an axios instance with a browser `User-Agent`, Turkish `Accept-Language`, and shared error-message translation (timeouts, DNS/connection failures, 403, 5xx all become user-facing Turkish strings). New services should build their axios instance through this factory rather than raw `axios.create`, so error handling stays consistent.
- **Mojibake repair**: several upstream sources double-encode Turkish characters (UTF-8 read as Windows-1254 or similar); `decodeMojibake()` in `httpClient.js` fixes this and is applied when parsing text from affected sources — check for existing mojibake handling before adding a new source that returns Turkish text with broken diacritics.
- **Displays are pure formatters**: `src/displays/*.js` build `cli-table3` tables or `asciichart` plots from data already fetched by a service; they don't perform I/O. All display functions are re-exported through `src/utils/display.js` so commands import from one place.
- **No-args entry**: running `turkiyem` with no arguments launches the REPL (`src/commands/menu.js`, dynamically imported) instead of Commander's default help.
- All user-facing strings (errors, prompts, table headers, help text) are Turkish — match this when adding commands/messages.

## Adding a new city or data source

Following the existing pattern (e.g. `mersinService.js` / `mersinService` entries in `hat.js`, `durak.js`, `src/utils/display.js`) is more reliable than designing a new shape: add a `<name>Service.js` using `createHttpClient`/cache helpers, add display formatter(s) in `src/displays/` and re-export from `src/utils/display.js`, then wire a handler into the relevant command's per-city dispatch map and into `src/index.js`. Update `README.md`'s city support table and command reference when a new city/command ships.

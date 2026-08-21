import { createHttpClient } from '../utils/httpClient.js';
import { getCached, setCached, CACHE_TTL } from '../utils/cache.js';

const BASE_URL = 'https://ulasimbilgi.adana.bel.tr/api';
const client = createHttpClient();

/**
 * Fetches the list of all Adana buses via official REST API.
 * Returns { buses: [{ id, code, name, firstStopId, lastStopId, direction }] }
 */
export async function fetchAdanaBuses() {
    const cacheKey = 'adana_buses_list';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await client.post(`${BASE_URL}/buses`, {});
    const data = Array.isArray(res.data) ? res.data : [];

    const buses = data
        .filter(b => b.Active === '1' || b.Active === 1 || b.IsDeleted === '0' || b.IsDeleted === 0)
        .map(b => ({
            id: b.Id,
            code: (b.DisplayRouteCode || b.RouteCode || '').toString().trim(),
            name: `${b.DisplayRouteCode || b.RouteCode || ''} - ${b.Name || ''}`.trim(),
            rawName: (b.Name || '').trim(),
            firstStopId: b.FirstStopId,
            lastStopId: b.LastStopId,
            direction: b.Direction,
            updateDate: b.UpdateDate || b.ChangeDate || '-'
        }));

    const result = { buses };
    setCached(cacheKey, result, CACHE_TTL.TRANSIT_LIST);
    return result;
}

/**
 * Fetches the full details of a specific bus (route, schedule, stops) via official REST API.
 */
export async function fetchAdanaBusDetails(busId) {
    const cacheKey = `adana_bus_${busId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await client.post(`${BASE_URL}/buses/${busId}`, {});
    const data = res.data || {};

    const busName = `${data.DisplayRouteCode || data.RouteCode || ''} - ${data.Name || ''}`.trim();
    const lastUpdate = data.UpdateDate || data.ChangeDate || '-';

    // Extract schedule times
    const schedule = [];
    if (Array.isArray(data.stopTimes)) {
        for (const st of data.stopTimes) {
            const time = st.DepartureTime || st.Time || st.departureTime || st.time;
            if (time) {
                schedule.push(time.substring(0, 5));
            }
        }
    }

    // Extract stops
    const stops = [];
    if (Array.isArray(data.stops_bus)) {
        for (const s of data.stops_bus) {
            const sName = s.Name || s.name || s.StopName || s.stopName;
            const sId = s.Id || s.id || s.StopId || s.stopId;
            if (sName) {
                stops.push({ name: sName, id: String(sId || '-') });
            }
        }
    }

    const result = {
        busName,
        lastUpdate,
        schedule,
        stops,
        raw: data
    };

    setCached(cacheKey, result, CACHE_TTL.IETT_SOAP);
    return result;
}

/**
 * Fetches stop details and identifies passing buses.
 */
export async function fetchAdanaStopDetails(stopId) {
    const { buses } = await fetchAdanaBuses();
    const cleanId = String(stopId).trim();

    // Check buses that match first/last stop or search detail
    let stopName = `Durak #${cleanId}`;
    const passingBuses = [];

    // Check direct matches in list
    for (const b of buses) {
        if (String(b.firstStopId) === cleanId || String(b.lastStopId) === cleanId) {
            passingBuses.push(b.name);
        }
    }

    return {
        stopId: cleanId,
        stopName,
        passingBuses
    };
}

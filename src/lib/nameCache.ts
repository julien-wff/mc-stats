const CACHE_KEY_V1 = 'mc-stats:player-cache:v1';

export interface CachedPlayer {
    name: string;
    skinUrl: string | null;
}

type Cache = Record<string, CachedPlayer>;

function readCache(): Cache {
    try {
        const raw = localStorage.getItem(CACHE_KEY_V1);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed as Cache;
    } catch {
        return {};
    }
}

function writeCache(cache: Cache): void {
    try {
        localStorage.setItem(CACHE_KEY_V1, JSON.stringify(cache));
    } catch {
        // ignore (private mode, quota, etc)
    }
}

export function getCachedName(uuid: string): CachedPlayer | null {
    const cache = readCache();
    return cache[uuid] ?? null;
}

export function setCachedName(uuid: string, name: string): void {
    const cache = readCache();
    cache[uuid] = {
        name,
        skinUrl: cache[uuid]?.skinUrl ?? null,
    };
    writeCache(cache);
}

export function getCachedPlayer(uuid: string): CachedPlayer | null {
    const cache = readCache();
    return cache[uuid] ?? null;
}

export function setCachedPlayer(uuid: string, player: CachedPlayer): void {
    const cache = readCache();
    cache[uuid] = player;
    writeCache(cache);
}

export async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (true) {
            const current = nextIndex++;
            if (current >= items.length) return;
            results[current] = await fn(items[current]);
        }
    }

    const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
    await Promise.all(workers);
    return results;
}

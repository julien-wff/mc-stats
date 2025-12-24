const CACHE_KEY = 'mc-stats:name-cache:v1';

type Cache = Record<string, string>;

function readCache(): Cache {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
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
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore (private mode, quota, etc)
    }
}

export function getCachedName(uuid: string): string | null {
    const cache = readCache();
    return cache[uuid] ?? null;
}

export function setCachedName(uuid: string, name: string): void {
    const cache = readCache();
    cache[uuid] = name;
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

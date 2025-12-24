import type { StatsRoot, StatsStats } from './types';

export type SortKey = 'playTime' | 'deaths' | 'distance' | 'blocksMined' | 'blocksPlaced' | 'itemsCrafted' | 'mobKills';

export interface PlayerLeaderboardRow {
    uuid: string;
    name: string;
    playTimeTicks: number;
    deaths: number;
    distanceCm: number;
    blocksMined: number;
    blocksPlaced: number;
    itemsCrafted: number;
    mobKills: number;
}

export function normalizeUuid(raw: string): string {
    const trimmed = raw.trim();
    // Keep only hex + dashes, then normalize to 32 hex chars if possible
    const cleaned = trimmed.toLowerCase().replace(/[^0-9a-f-]/g, '');
    const noDashes = cleaned.replace(/-/g, '');
    if (/^[0-9a-f]{32}$/.test(noDashes)) return noDashes;
    return cleaned;
}

export function uuidFromFilename(filename: string): string | null {
    const base = filename.replace(/\.json$/i, '');
    const normalized = normalizeUuid(base);
    const noDashes = normalized.replace(/-/g, '');
    return /^[0-9a-f]{32}$/.test(noDashes) ? noDashes : null;
}

function safeNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function sumRecord(rec: Record<string, number> | undefined): number {
    if (!rec) return 0;
    let total = 0;
    for (const v of Object.values(rec)) total += safeNumber(v);
    return total;
}

function sumCustomDistanceCm(custom: StatsStats['minecraft:custom'] | undefined): number {
    if (!custom) return 0;
    const keys: Array<keyof StatsStats['minecraft:custom']> = [
        'minecraft:walk_one_cm',
        'minecraft:sprint_one_cm',
        'minecraft:fly_one_cm',
        'minecraft:swim_one_cm',
        'minecraft:walk_under_water_one_cm',
        'minecraft:walk_on_water_one_cm',
        'minecraft:boat_one_cm',
        'minecraft:minecart_one_cm',
        'minecraft:horse_one_cm',
        'minecraft:aviate_one_cm',
        'minecraft:climb_one_cm',
        'minecraft:crouch_one_cm',
    ];

    let total = 0;
    for (const k of keys) total += safeNumber(custom[k]);
    return total;
}

const NON_PLACEABLE_SUBSTRINGS = [
    '_sword',
    '_pickaxe',
    '_axe',
    '_shovel',
    '_hoe',
    '_helmet',
    '_chestplate',
    '_leggings',
    '_boots',
    '_bow',
    '_crossbow',
    '_trident',
    '_shield',
    '_fishing_rod',
    '_elytra',
    '_horse_armor',
    '_bucket',
    '_potion',
    '_bottle',
    '_stew',
    '_soup',
    '_apple',
    '_bread',
    '_carrot',
    '_potato',
    '_beef',
    '_porkchop',
    '_mutton',
    '_chicken',
    '_salmon',
    '_cod',
    '_cookie',
    '_shears',
    '_flint_and_steel',
];

function looksLikePlaceableBlock(itemId: string): boolean {
    // Minecraft IDs are like "minecraft:stone".
    // We approximate "placed blocks" from minecraft:used by removing common non-placeable items.
    if (!itemId.startsWith('minecraft:')) return false;
    for (const bad of NON_PLACEABLE_SUBSTRINGS) {
        if (itemId.includes(bad)) return false;
    }
    return true;
}

function estimateBlocksPlaced(used: Record<string, number> | undefined): number {
    if (!used) return 0;
    let total = 0;
    for (const [id, value] of Object.entries(used)) {
        if (looksLikePlaceableBlock(id)) total += safeNumber(value);
    }
    return total;
}

export function parseStatsJson(text: string): StatsRoot | null {
    try {
        const parsed = JSON.parse(text) as unknown;
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as StatsRoot;
    } catch {
        return null;
    }
}

export function leaderboardRowFromStats(uuid: string, name: string, root: StatsRoot): PlayerLeaderboardRow {
    const stats = root.stats;
    const custom = stats?.['minecraft:custom'];

    return {
        uuid,
        name,
        playTimeTicks: safeNumber(custom?.['minecraft:play_time']),
        deaths: safeNumber(custom?.['minecraft:deaths']),
        distanceCm: sumCustomDistanceCm(custom),
        blocksMined: sumRecord(stats?.['minecraft:mined']),
        blocksPlaced: estimateBlocksPlaced(stats?.['minecraft:used']),
        itemsCrafted: sumRecord(stats?.['minecraft:crafted']),
        mobKills: safeNumber(custom?.['minecraft:mob_kills']),
    };
}

export function compareRows(a: PlayerLeaderboardRow, b: PlayerLeaderboardRow, key: SortKey): number {
    const dir = -1; // default descending
    const av =
        key === 'playTime'
            ? a.playTimeTicks
            : key === 'deaths'
            ? a.deaths
            : key === 'distance'
            ? a.distanceCm
            : key === 'blocksMined'
            ? a.blocksMined
            : key === 'blocksPlaced'
            ? a.blocksPlaced
            : key === 'itemsCrafted'
            ? a.itemsCrafted
            : a.mobKills;
    const bv =
        key === 'playTime'
            ? b.playTimeTicks
            : key === 'deaths'
            ? b.deaths
            : key === 'distance'
            ? b.distanceCm
            : key === 'blocksMined'
            ? b.blocksMined
            : key === 'blocksPlaced'
            ? b.blocksPlaced
            : key === 'itemsCrafted'
            ? b.itemsCrafted
            : b.mobKills;
    if (bv !== av) return (bv - av) * (dir === -1 ? 1 : -1);
    return a.name.localeCompare(b.name);
}

export function formatPlayTime(ticks: number): string {
    // Minecraft stats use ticks (20 per second)
    const totalSeconds = Math.max(0, ticks) / 20;
    const hours = Math.floor(totalSeconds / 3600);
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) return `${days}d ${remHours}h`;
    if (hours > 0) {
        const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}m`;
}

export function formatDistance(cm: number): string {
    const meters = Math.max(0, cm) / 100;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    if (meters >= 100) return `${Math.round(meters)} m`;
    return `${meters.toFixed(0)} m`;
}

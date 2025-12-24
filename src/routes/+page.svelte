<script lang="ts">
    import { resolvePlayerName } from '$lib/api';
    import { getCachedName, mapWithConcurrency, setCachedName } from '$lib/nameCache';
    import {
        compareRows,
        formatDistance,
        formatPlayTime,
        leaderboardRowFromStats,
        parseStatsJson,
        uuidFromFilename,
        type PlayerLeaderboardRow,
    } from '$lib/stats';

    let rows = $state<PlayerLeaderboardRow[]>([]);
    let loading = $state(false);
    let status = $state<string | null>(null);
    let error = $state<string | null>(null);

    function shortUuid(uuid: string): string {
        return uuid.length >= 8 ? uuid.slice(0, 8) : uuid;
    }

    async function loadStatsFiles(files: FileList | null) {
        error = null;
        status = null;
        rows = [];
        if (!files || files.length === 0) return;

        loading = true;
        try {
            const jsonFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.json'));
            if (jsonFiles.length === 0) {
                error = "No .json files found. Please select your world's stats folder.";
                return;
            }

            status = `Reading ${jsonFiles.length} file(s)…`;
            const parsed: Array<{ uuid: string; root: unknown }> = [];
            for (const file of jsonFiles) {
                const uuid = uuidFromFilename(file.name);
                if (!uuid) continue;
                const text = await file.text();
                const root = parseStatsJson(text);
                if (!root) continue;
                parsed.push({ uuid, root });
            }

            if (parsed.length === 0) {
                error = 'No valid Minecraft stats files found (expected filenames like <uuid>.json).';
                return;
            }

            status = `Resolving player names…`;
            const uniqueUuids = Array.from(new Set(parsed.map(p => p.uuid)));
            const nameEntries = await mapWithConcurrency(uniqueUuids, 4, async uuid => {
                const cached = getCachedName(uuid);
                if (cached) return [uuid, cached] as const;
                try {
                    const name = await resolvePlayerName(uuid);
                    setCachedName(uuid, name);
                    return [uuid, name] as const;
                } catch {
                    return [uuid, `Player ${shortUuid(uuid)}`] as const;
                }
            });

            const nameByUuid = new Map<string, string>(nameEntries);
            status = `Building leaderboard…`;
            rows = parsed
                .map(p =>
                    leaderboardRowFromStats(
                        p.uuid,
                        nameByUuid.get(p.uuid) ?? `Player ${shortUuid(p.uuid)}`,
                        p.root as any,
                    ),
                )
                .sort((a, b) => compareRows(a, b, 'playTime'));
            status = null;
        } finally {
            loading = false;
        }
    }

    function onPickFolder(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        void loadStatsFiles(input.files);
    }
</script>

<main class="mx-auto max-w-6xl px-4 py-10 sm:py-14">
    <header class="mb-8">
        <div
            class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-300"
        >
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            Static, client-side parsing
        </div>
        <h1 class="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Minecraft Stats Leaderboard</h1>
        <p class="mt-2 max-w-2xl text-pretty text-sm text-slate-300 sm:text-base">
            Upload your world’s <span class="font-mono text-slate-200">stats</span> folder (the one containing
            <span class="font-mono text-slate-200">&lt;uuid&gt;.json</span> files) to see a leaderboard per player.
        </p>
    </header>

    <section class="mb-8 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 class="text-sm font-medium text-slate-200">Upload stats folder</h2>
            <p class="mt-1 text-sm text-slate-300">
                Select the folder at <span class="font-mono text-slate-200">…/world/stats</span>.
            </p>

            <div class="mt-4">
                <label
                    class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400"
                >
                    <input type="file" multiple webkitdirectory class="sr-only" onchange={onPickFolder} />
                    Choose folder
                </label>
            </div>

            {#if status}
                <p class="mt-3 text-sm text-slate-300">{status}</p>
            {/if}
            {#if error}
                <p class="mt-3 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
                    {error}
                </p>
            {/if}
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 class="text-sm font-medium text-slate-200">What you’ll see</h2>
            <ul class="mt-2 space-y-2 text-sm text-slate-300">
                <li class="flex items-start gap-2">
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Play time
                </li>
                <li class="flex items-start gap-2">
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Deaths
                </li>
                <li class="flex items-start gap-2">
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Distance traveled
                </li>
                <li class="flex items-start gap-2">
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Blocks mined / placed (approx.)
                </li>
                <li class="flex items-start gap-2">
                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Items crafted
                </li>
            </ul>
            <p class="mt-3 text-xs text-slate-400">Names are resolved via Mojang’s API and cached locally.</p>
        </div>
    </section>

    <section class="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div class="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
            <h2 class="text-sm font-medium text-slate-200">Leaderboard</h2>
            {#if rows.length > 0}
                <p class="text-sm text-slate-300">{rows.length} player(s)</p>
            {:else}
                <p class="text-sm text-slate-400">Upload a stats folder to begin</p>
            {/if}
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-[900px] w-full text-left text-sm">
                <thead class="bg-slate-950/40 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                        <th class="px-5 py-3">#</th>
                        <th class="px-5 py-3">Player</th>
                        <th class="px-5 py-3">Play time</th>
                        <th class="px-5 py-3">Deaths</th>
                        <th class="px-5 py-3">Distance</th>
                        <th class="px-5 py-3">Blocks mined</th>
                        <th class="px-5 py-3">Blocks placed</th>
                        <th class="px-5 py-3">Crafted</th>
                        <th class="px-5 py-3">Mob kills</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                    {#if loading}
                        <tr>
                            <td class="px-5 py-6 text-slate-300" colspan="9">Working…</td>
                        </tr>
                    {:else if rows.length === 0}
                        <tr>
                            <td class="px-5 py-6 text-slate-400" colspan="9">No data yet.</td>
                        </tr>
                    {:else}
                        {#each rows as row, i (row.uuid)}
                            <tr class="hover:bg-slate-950/30">
                                <td class="px-5 py-4 text-slate-400">{i + 1}</td>
                                <td class="px-5 py-4">
                                    <div class="font-medium text-slate-100">{row.name}</div>
                                    <div class="mt-0.5 font-mono text-xs text-slate-400">{shortUuid(row.uuid)}</div>
                                </td>
                                <td class="px-5 py-4 text-slate-200">{formatPlayTime(row.playTimeTicks)}</td>
                                <td class="px-5 py-4 text-slate-200">{row.deaths}</td>
                                <td class="px-5 py-4 text-slate-200">{formatDistance(row.distanceCm)}</td>
                                <td class="px-5 py-4 text-slate-200">{row.blocksMined.toLocaleString()}</td>
                                <td class="px-5 py-4 text-slate-200">{row.blocksPlaced.toLocaleString()}</td>
                                <td class="px-5 py-4 text-slate-200">{row.itemsCrafted.toLocaleString()}</td>
                                <td class="px-5 py-4 text-slate-200">{row.mobKills.toLocaleString()}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>

    <footer class="mt-8 text-xs text-slate-500">
        <p>
            Tip: If you can’t select a folder, try a Chromium-based browser (Chrome/Edge). Folder upload relies on
            <span class="font-mono">webkitdirectory</span>.
        </p>
    </footer>
</main>

<script lang="ts">
    import { resolvePlayerName } from '$lib/api';
    import { getCachedName, mapWithConcurrency, setCachedName } from '$lib/nameCache';
    import {
        compareRows,
        leaderboardRowFromStats,
        parseStatsJson,
        uuidFromFilename,
        type PlayerLeaderboardRow,
    } from '$lib/stats';

    let {
        rows = $bindable<PlayerLeaderboardRow[]>([]),
        loading = $bindable(false),
    }: {
        rows?: PlayerLeaderboardRow[];
        loading?: boolean;
    } = $props();

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
            const jsonFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.json'));
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

<script lang="ts">
    import { formatDistance, formatPlayTime, type PlayerLeaderboardRow } from '$lib/stats';

    export let rows: PlayerLeaderboardRow[];
    export let loading: boolean;

    function shortUuid(uuid: string): string {
        return uuid.length >= 8 ? uuid.slice(0, 8) : uuid;
    }
</script>

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

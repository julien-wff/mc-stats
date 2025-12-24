<script lang="ts">
    import { formatDistance, formatPlayTime, type PlayerLeaderboardRow } from '$lib/stats';

    interface Props {
        rows?: PlayerLeaderboardRow[];
        loading?: boolean;
    }

    let { rows = [], loading = false }: Props = $props();

    type SortColumn = keyof Omit<PlayerLeaderboardRow, 'uuid'>;
    type SortDirection = 'asc' | 'desc';

    let sortColumn = $state<SortColumn>('playTimeTicks');
    let sortDirection = $state<SortDirection>('desc');

    const sortIndicator = $derived(sortDirection === 'asc' ? '↑' : '↓');

    const nameCollator = new Intl.Collator(undefined, {
        usage: 'sort',
        sensitivity: 'base',
        numeric: true,
    });

    function defaultDirectionFor(column: SortColumn): SortDirection {
        return column === 'name' ? 'asc' : 'desc';
    }

    function setSort(column: SortColumn) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            return;
        }
        sortColumn = column;
        sortDirection = defaultDirectionFor(column);
    }

    function compareByColumn(a: PlayerLeaderboardRow, b: PlayerLeaderboardRow, column: SortColumn): number {
        if (column === 'name') return nameCollator.compare(a.name, b.name);

        return a[column] - b[column];
    }

    const displayedRows = $derived.by(() => {
        if (!rows || rows.length <= 1) return rows;

        const dir = sortDirection === 'asc' ? 1 : -1;
        return rows
            .map((row, index) => ({ row, index }))
            .sort((a, b) => {
                const cmp = compareByColumn(a.row, b.row, sortColumn);
                if (cmp !== 0) return cmp * dir;

                // Stable tie-break: preserve incoming order.
                return a.index - b.index;
            })
            .map(x => x.row);
    });

    function shortUuid(uuid: string): string {
        return uuid.length >= 8 ? uuid.slice(0, 8) : uuid;
    }

    function sortIndicatorOpacityFor(column: SortColumn): string {
        return sortColumn === column ? 'opacity-100' : 'opacity-0';
    }

    function ariaSortFor(column: SortColumn): 'ascending' | 'descending' | 'none' {
        if (sortColumn !== column) return 'none';
        return sortDirection === 'asc' ? 'ascending' : 'descending';
    }
</script>

<section class="rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40">
    <div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 class="text-sm font-medium text-slate-800 dark:text-slate-200">Leaderboard</h2>
        {#if rows.length > 0}
            <p class="text-sm text-slate-600 dark:text-slate-300">{rows.length} player(s)</p>
        {:else}
            <p class="text-sm text-slate-500 dark:text-slate-400">Upload a stats folder to begin</p>
        {/if}
    </div>

    <div class="overflow-x-auto">
        <table class="min-w-[900px] w-full text-left text-sm">
            <thead
                class="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-400"
            >
                <tr>
                    <th class="px-5 py-3">#</th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('name')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('name')}
                        >
                            Player
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('name')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('playTimeTicks')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('playTimeTicks')}
                        >
                            Play time
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('playTimeTicks')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('deaths')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('deaths')}
                        >
                            Deaths
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('deaths')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('distanceCm')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('distanceCm')}
                        >
                            Distance
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('distanceCm')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('blocksMined')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('blocksMined')}
                        >
                            Blocks mined
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('blocksMined')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('blocksPlaced')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('blocksPlaced')}
                        >
                            Blocks placed
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('blocksPlaced')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('itemsCrafted')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('itemsCrafted')}
                        >
                            Crafted
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('itemsCrafted')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                    <th class="px-5 py-3" aria-sort={ariaSortFor('mobKills')}>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
                            onclick={() => setSort('mobKills')}
                        >
                            Mob kills
                            <span
                                aria-hidden="true"
                                class={`inline-block w-3 text-center text-xs leading-none tracking-normal ${sortIndicatorOpacityFor('mobKills')}`}
                                >{sortIndicator}</span
                            >
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                {#if loading}
                    <tr>
                        <td class="px-5 py-6 text-slate-600 dark:text-slate-300" colspan="9">Working…</td>
                    </tr>
                {:else if rows.length === 0}
                    <tr>
                        <td class="px-5 py-6 text-slate-500 dark:text-slate-400" colspan="9">No data yet.</td>
                    </tr>
                {:else}
                    {#each displayedRows as row, i (row.uuid)}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-950/30">
                            <td class="px-5 py-4 text-slate-500 dark:text-slate-400">{i + 1}</td>
                            <td class="px-5 py-4">
                                <div class="font-medium text-slate-900 dark:text-slate-100">{row.name}</div>
                                <div class="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                    {shortUuid(row.uuid)}
                                </div>
                            </td>
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200"
                                >{formatPlayTime(row.playTimeTicks)}</td
                            >
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200">{row.deaths}</td>
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200"
                                >{formatDistance(row.distanceCm)}</td
                            >
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200"
                                >{row.blocksMined.toLocaleString()}</td
                            >
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200"
                                >{row.blocksPlaced.toLocaleString()}</td
                            >
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200"
                                >{row.itemsCrafted.toLocaleString()}</td
                            >
                            <td class="px-5 py-4 text-slate-700 dark:text-slate-200">{row.mobKills.toLocaleString()}</td
                            >
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</section>

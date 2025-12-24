<script lang="ts">
    import type { PlayerLeaderboardRow } from '$lib/stats';
    import LeaderboardSection from '$lib/components/LeaderboardSection.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import UploadStatsCard from '$lib/components/UploadStatsCard.svelte';

    let rows = $state<PlayerLeaderboardRow[]>([]);
    let loading = $state(false);
</script>

<main class="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <PageHeader />

    <section class="mb-8 gap-4">
        <UploadStatsCard bind:rows bind:loading />
    </section>

    <LeaderboardSection {rows} {loading} />

    <footer class="mt-8 text-xs text-slate-600 dark:text-slate-500">
        <p>
            Tip: If you can't select a folder, try a Chromium-based browser (Chrome/Edge). Folder upload relies on
            <span class="font-mono">webkitdirectory</span>.
        </p>
    </footer>
</main>

<script lang="ts">
    import type { PlayerLeaderboardRow } from '$lib/stats';
    import LeaderboardSection from '$lib/components/LeaderboardSection.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import UploadStatsCard from '$lib/components/UploadStatsCard.svelte';
    import WhatYouSeeCard from '$lib/components/WhatYouSeeCard.svelte';

    let rows = $state<PlayerLeaderboardRow[]>([]);
    let loading = $state(false);
</script>

<main class="mx-auto max-w-6xl px-4 py-10 sm:py-14">
    <PageHeader />

    <section class="mb-8 grid gap-4 sm:grid-cols-2">
        <UploadStatsCard bind:rows bind:loading />
        <WhatYouSeeCard />
    </section>

    <LeaderboardSection {rows} {loading} />

    <footer class="mt-8 text-xs text-slate-500">
        <p>
            Tip: If you can't select a folder, try a Chromium-based browser (Chrome/Edge). Folder upload relies on
            <span class="font-mono">webkitdirectory</span>.
        </p>
    </footer>
</main>

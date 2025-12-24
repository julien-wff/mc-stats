<script lang="ts">
    import './layout.css';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="shortcut icon" type="image/x-icon" href="/icons/favicon.ico" />
    <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />

    <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
</svelte:head>

{@render children()}

<script lang="ts">
    interface Props {
        label: string;
        sortDirection: 'asc' | 'desc';
        isCurrentSort: boolean;
        onSetSort: () => void;
    }

    let { label, sortDirection, isCurrentSort, onSetSort }: Props = $props();

    const sortIndicator = $derived(sortDirection === 'asc' ? '↑' : '↓');
    const ariaSort = $derived(isCurrentSort ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
</script>

<th class="px-5 py-3" aria-sort={ariaSort}>
    <button
        type="button"
        class="inline-flex items-center gap-1 text-left hover:text-slate-900 dark:hover:text-slate-200"
        onclick={onSetSort}
    >
        {label}
        <span
            aria-hidden="true"
            class={`inline-block w-3 text-center text-xs leading-none tracking-normal`}
            class:opacity-0={!isCurrentSort}
        >
            {sortIndicator}
        </span>
    </button>
</th>

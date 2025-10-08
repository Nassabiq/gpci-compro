<script setup lang="ts">
import {ref, computed, watch, toRefs} from "vue";
import {Search, Filter, ChevronDown, Loader2} from "lucide-vue-next";

type Align = "left" | "center" | "right";
export interface Column {
	key: string;
	label: string;
	sortable?: boolean;
	align?: Align;
	width?: string;
}

const props = withDefaults(
	defineProps<{
		columns: Column[];
		rows: any[];
		total?: number;
		page?: number; // controlled dari parent (1-based)
		pageSize?: number; // controlled dari parent
		pageSizes?: number[];
		search?: string;
		filtersInitiallyOpen?: boolean;
		loading?: boolean;
		rowKey?: string;
		debounce?: number;
		externalSort?: boolean;
		sort?: {key: string | null; dir: "asc" | "desc"};
		striped?: boolean;
		compact?: boolean;
	}>(),
	{
		total: undefined,
		page: 1,
		pageSize: 10,
		pageSizes: () => [10, 25, 50, 100],
		search: "",
		filtersInitiallyOpen: false,
		loading: false,
		rowKey: "id",
		debounce: 300,
		externalSort: true,
		sort: () => ({key: null, dir: "asc"}),
		striped: true,
		compact: false,
	}
);

const emit = defineEmits<{
	(e: "update:search", v: string): void;
	(e: "update:page", v: number): void;
	(e: "update:pageSize", v: number): void;
	(e: "update:sort", v: {key: string | null; dir: "asc" | "desc"}): void;
	(e: "apply-filters"): void;
	(e: "reset-filters"): void;
}>();

const {rows, columns} = toRefs(props);

const localSearch = ref(props.search);
const isFiltersOpen = ref(props.filtersInitiallyOpen);

// debounce search ke parent
let t: ReturnType<typeof setTimeout> | null = null;
watch(localSearch, (v) => {
	if (t) clearTimeout(t);
	t = setTimeout(() => emit("update:search", v), props.debounce);
});

const total = computed(() => props.total ?? rows.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / props.pageSize)));

function setPage(p: number) {
	const next = Math.min(Math.max(1, p), pageCount.value);
	emit("update:page", next);
}
function setPageSize(ps: number) {
	emit("update:pageSize", ps);
	emit("update:page", 1);
}

const internalSort = ref<{key: string | null; dir: "asc" | "desc"}>(props.sort);
watch(
	() => props.sort,
	(v) => {
		internalSort.value = v;
	},
	{deep: true}
);

function toggleSort(col: Column) {
	if (!col.sortable) return;
	const t = props.externalSort ? props.sort : internalSort.value;
	let dir: "asc" | "desc" = "asc";
	let key: string | null = col.key;
	if (t.key === col.key) dir = t.dir === "asc" ? "desc" : "asc";
	if (props.externalSort) emit("update:sort", {key, dir});
	else internalSort.value = {key, dir};
}

const visibleRows = computed(() => {
	let data = rows.value.slice();
	if (!props.externalSort && internalSort.value.key) {
		const {key, dir} = internalSort.value;
		data.sort((a, b) => {
			const va = a?.[key as string],
				vb = b?.[key as string];
			if (va == null && vb == null) return 0;
			if (va == null) return dir === "asc" ? -1 : 1;
			if (vb == null) return dir === "asc" ? 1 : -1;
			return dir === "asc" ? (va > vb ? 1 : va < vb ? -1 : 0) : va < vb ? 1 : va > vb ? -1 : 0;
		});
	}
	if (props.total === undefined && localSearch.value.trim()) {
		const q = localSearch.value.toLowerCase();
		data = data.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
	}
	if (props.total === undefined) {
		const start = (props.page - 1) * props.pageSize;
		return data.slice(start, start + props.pageSize);
	}
	return data;
});

const rangeStart = computed(() => (total.value === 0 ? 0 : (props.page - 1) * props.pageSize + 1));
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, total.value));

// ===== Flowbite-like numbered pagination helpers =====
const pageItems = computed<(number | "…")[]>(() => makePageItems(props.page, pageCount.value));
function makePageItems(cur: number, totalPages: number, pad = 1) {
	if (totalPages <= 7) return Array.from({length: totalPages}, (_, i) => i + 1);
	const items: (number | "…")[] = [1];
	let start = Math.max(2, cur - pad);
	let end = Math.min(totalPages - 1, cur + pad);
	if (start > 2) items.push("…");
	for (let i = start; i <= end; i++) items.push(i);
	if (end < totalPages - 1) items.push("…");
	items.push(totalPages);
	return items;
}
</script>

<template>
	<div class="w-full overflow-hidden px-2 bg-white dark:bg-gray-900">
		<!-- Toolbar -->
		<div class="flex flex-wrap items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-700">
			<!-- Search -->
			<div class="relative flex-1 min-w-[16rem]">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search class="w-4 h-4 text-gray-400" />
				</div>
				<input v-model="localSearch" type="search" class="block w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500 pl-10 pr-3 py-2" placeholder="Search..." />
			</div>

			<!-- Actions -->
			<div class="ml-auto flex items-center gap-2">
				<button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="isFiltersOpen = !isFiltersOpen" :aria-expanded="isFiltersOpen">
					<Filter class="w-4 h-4" />
					Filters
					<ChevronDown class="w-4 h-4 transition-transform" :class="isFiltersOpen ? 'rotate-180' : ''" />
				</button>

				<slot name="toolbar-actions" />
			</div>
		</div>

		<!-- Filters (collapsible) -->
		<transition enter-active-class="transition-[max-height,opacity] duration-200 ease-out" leave-active-class="transition-[max-height,opacity] duration-150 ease-in" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-96" leave-from-class="opacity-100 max-h-96" leave-to-class="opacity-0 max-h-0">
			<div v-show="isFiltersOpen" class="py-4 border-b border-gray-200 dark:border-gray-700">
				<slot name="filters" />
				<div class="mt-3 flex gap-2">
					<button type="button" class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800" @click="$emit('apply-filters')">Apply</button>

					<button type="button" class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="$emit('reset-filters')">Reset</button>
				</div>
			</div>
		</transition>

		<!-- Table -->
		<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
			<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
				<thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
					<tr>
						<th v-for="col in columns" :key="col.key" scope="col" :style="col.width ? {width: col.width} : undefined" :class="['px-6', props.compact ? 'py-2.5' : 'py-3', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left']">
							<button v-if="col.sortable" type="button" class="inline-flex items-center gap-1 hover:text-emerald-700" @click="toggleSort(col)">
								<span class="font-medium tracking-wide">{{ col.label }}</span>
								<!-- sort indicators -->
								<svg v-if="(externalSort ? sort.key : internalSort.key) !== col.key" class="w-3 h-3 opacity-50" viewBox="0 0 20 20" fill="currentColor"><path d="M7 7l3-3 3 3H7zm6 6l-3 3-3-3h6z" /></svg>
								<svg v-else-if="(externalSort ? sort.dir : internalSort.dir) === 'asc'" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 13l3-3 3 3H7z" /></svg>
								<svg v-else class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 7l3 3 3-3H7z" /></svg>
							</button>
							<span v-else class="font-medium tracking-wide">{{ col.label }}</span>
						</th>
					</tr>
				</thead>

				<tbody>
					<!-- Loading -->
					<tr v-if="loading">
						<td :colspan="columns.length" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400"><Loader2 class="w-5 h-5 inline animate-spin mr-2" /> Loading...</td>
					</tr>

					<!-- Empty -->
					<tr v-else-if="visibleRows.length === 0">
						<td :colspan="columns.length" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No data found.</td>
					</tr>

					<!-- Rows -->
					<tr v-else v-for="(row, ri) in visibleRows" :key="row?.[rowKey] ?? ri" :class="[striped ? 'odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800/40' : '', 'border-b last:border-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-800/60']">
						<td v-for="col in columns" :key="col.key" :class="['px-6', props.compact ? 'py-2.5' : 'py-3.5', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', 'whitespace-nowrap align-middle']">
							<slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
								{{ row[col.key] }}
							</slot>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Footer: Pagination (Flowbite-like, emerald theme) -->
		<nav class="flex items-center flex-col sm:flex-row justify-between gap-3 px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700" aria-label="Table navigation">
			<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
				Showing
				<span class="font-semibold text-gray-900 dark:text-white">{{ rangeStart }}–{{ rangeEnd }}</span>
				of
				<span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span>
			</span>

			<div class="flex items-center gap-3">
				<!-- page size -->
				<select :value="props.pageSize" @change="setPageSize(parseInt(($event.target as HTMLSelectElement).value))" class="block rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white px-2.5 py-1.5">
					<option v-for="s in props.pageSizes" :key="s" :value="s">{{ s }} / page</option>
				</select>

				<!-- pager pills -->
				<ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
					<!-- Prev -->
					<li>
						<button class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" :disabled="props.page <= 1" @click="setPage(props.page - 1)">Previous</button>
					</li>

					<!-- Page items -->
					<li v-for="(it, idx) in pageItems" :key="`${it}-${idx}`">
						<!-- Ellipsis -->
						<span v-if="it === '…'" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 select-none">…</span>

						<!-- Number -->
						<button v-else class="flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" :class="[it === props.page ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white dark:text-gray-400']" @click="setPage(Number(it))" :aria-current="it === props.page ? 'page' : undefined">
							{{ it }}
						</button>
					</li>

					<!-- Next -->
					<li>
						<button class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" :disabled="props.page >= pageCount" @click="setPage(props.page + 1)">Next</button>
					</li>
				</ul>
			</div>
		</nav>
	</div>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props = withDefaults(
	defineProps<{
		page: number; // current page (1-based)
		totalItems: number; // total items after filtering
		pageSize: number; // items per page
		maxButtons?: number; // max visible page buttons (incl. ends), default 7
		showEdges?: boolean; // show First/Last buttons
		disabled?: boolean; // disable all controls
	}>(),
	{
		maxButtons: 7,
		showEdges: true,
		disabled: false,
	}
);

const emit = defineEmits<{(e: "update:page", v: number): void}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));

function goTo(p: number) {
	const clamped = Math.min(Math.max(1, p), totalPages.value);
	if (clamped !== props.page) emit("update:page", clamped);
}

const pageWindow = computed<(number | "left" | "right")[]>(() => {
	const total = totalPages.value;
	const current = props.page;
	const maxBtns = Math.max(3, props.maxButtons); // minimal wajar

	if (total <= maxBtns) return Array.from({length: total}, (_, i) => i + 1);

	const delta = 2;
	let left = Math.max(1, current - delta);
	let right = Math.min(total, current + delta);

	// lebarkan window di pinggir
	if (current <= 1 + delta) right = Math.max(right, 1 + delta * 2);
	if (current >= total - delta) left = Math.min(left, total - delta * 2);

	const out: Array<number | "left" | "right"> = [];
	if (left > 1) out.push(1);
	if (left > 2) out.push("left");
	for (let p = left; p <= right; p++) out.push(p);
	if (right < total - 1) out.push("right");
	if (right < total) out.push(total);
	return out;
});

const startIndex = computed(() => (props.totalItems ? (props.page - 1) * props.pageSize + 1 : 0));
const endIndex = computed(() => Math.min(props.page * props.pageSize, props.totalItems));
</script>

<template>
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
		<!-- Range text -->
		<div>
			Showing
			<span class="font-medium text-gray-900">{{ startIndex }}</span> – <span class="font-medium text-gray-900">{{ endIndex }}</span> of <span class="font-medium text-gray-900">{{ totalItems }}</span> items.
		</div>

		<!-- Controls -->
		<nav class="inline-flex items-center gap-1" role="navigation" aria-label="Pagination">
			<button v-if="showEdges" class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="disabled || page <= 1" @click="goTo(1)" aria-label="First page">First</button>
			<button class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="disabled || page <= 1" @click="goTo(page - 1)" aria-label="Previous page">Prev</button>

			<template v-for="it in pageWindow" :key="typeof it === 'number' ? `p-${it}` : `dots-${it}`">
				<button v-if="typeof it === 'number'" class="px-3 py-1.5 rounded-lg border" :class="it === page ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white hover:bg-gray-50'" :aria-current="it === page ? 'page' : undefined" :disabled="disabled" @click="goTo(it)">
					{{ it }}
				</button>
				<span v-else class="px-2 select-none" aria-hidden="true">…</span>
			</template>

			<button class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="disabled || page >= totalPages" @click="goTo(page + 1)" aria-label="Next page">Next</button>
			<button v-if="showEdges" class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="disabled || page >= totalPages" @click="goTo(totalPages)" aria-label="Last page">Last</button>
		</nav>
	</div>
</template>

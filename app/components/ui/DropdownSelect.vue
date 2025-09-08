<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, watch} from "vue";

type Option = {id: string; name: string; count?: number; icon?: any};

const props = withDefaults(
	defineProps<{
		options: Option[];
		selected?: string[];
		placeholder?: string;
		maxTags?: number;
	}>(),
	{
		selected: () => [],
		placeholder: "Select categories",
		maxTags: 3,
	}
);

const emit = defineEmits<{(e: "update:selected", value: string[]): void}>();
const root = ref<HTMLElement | null>(null);
const open = ref(false);
const query = ref("");

const selectedSet = ref<Set<string>>(new Set(props.selected));
watch(
	() => props.selected,
	(v) => {
		if (Array.isArray(v)) selectedSet.value = new Set(v);
	},
	{deep: true}
);
watch(selectedSet, (s) => emit("update:selected", Array.from(s)), {deep: true});

const filtered = computed(() => {
	const q = query.value.trim().toLowerCase();
	return q ? props.options.filter((o) => o.name.toLowerCase().includes(q)) : props.options;
});
const displayTags = computed(() => Array.from(selectedSet.value).slice(0, props.maxTags));
const overflow = computed(() => Math.max(0, selectedSet.value.size - props.maxTags));

function toggleDropdown() {
	open.value = !open.value;
}
function closeDropdown() {
	open.value = false;
}
function removeTag(id: string) {
	const n = new Set(selectedSet.value);
	n.delete(id);
	selectedSet.value = n;
}
function setSelected(id: string, checked: boolean) {
	const n = new Set(selectedSet.value);
	checked ? n.add(id) : n.delete(id);
	selectedSet.value = n;
}
function isSelected(id: string) {
	return selectedSet.value.has(id);
}
function onClickOutside(e: MouseEvent) {
	if (root.value && !root.value.contains(e.target as Node)) closeDropdown();
}

onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));
</script>

<template>
	<div ref="root" class="relative">
		<!-- Control -->
		<button type="button" @click="toggleDropdown" class="w-full group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-left shadow-sm transition-all duration-150 hover:bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500/60 md:px-3.5" :aria-expanded="open" aria-haspopup="listbox">
			<span class="flex-1 min-w-0">
				<span v-if="selectedSet.size === 0" class="block truncate text-gray-500">{{ placeholder }}</span>
				<span v-else class="flex flex-wrap items-center gap-1.5">
					<span v-for="id in displayTags" :key="id" class="inline-flex items-center gap-1 rounded-lg border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-sm text-emerald-800">
						<span class="truncate max-w-[9rem]">
							{{ props.options.find((o) => o.id === id)?.name ?? id }}
						</span>
						<button type="button" class="rounded p-0.5 hover:bg-emerald-100" @click.stop="removeTag(id)" aria-label="Remove">✕</button>
					</span>
					<span v-if="overflow > 0" class="rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-sm text-gray-700">+{{ overflow }} more</span>
				</span>
			</span>
			<span class="shrink-0 rounded-md border border-transparent bg-gray-50 px-2 py-1 text-xs text-gray-700 group-hover:border-gray-200 group-hover:bg-white">
				{{ selectedSet.size }}
			</span>
			<span class="shrink-0 text-gray-400 transition-transform duration-150 group-aria-expanded:rotate-180">▾</span>
		</button>

		<!-- Dropdown -->
		<transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 translate-y-1 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 translate-y-1 scale-95">
			<div v-if="open" class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl" role="listbox">
				<!-- Search -->
				<div class="sticky top-0 z-10 border-b border-gray-100 bg-white/95 p-2 backdrop-blur">
					<label class="sr-only" for="cat-search">Search categories</label>
					<input id="cat-search" v-model="query" type="text" placeholder="Search categories…" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/60" @keydown.stop />
				</div>

				<!-- Options (tanpa Select All / Clear) -->
				<ul class="max-h-72 overflow-auto py-1">
					<li v-for="opt in filtered" :key="opt.id" class="px-3 py-1" role="option" :aria-selected="isSelected(opt.id)">
						<label class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-gray-50" :for="`cat-${opt.id}`">
							<div class="flex items-center gap-2">
								<input :id="`cat-${opt.id}`" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="isSelected(opt.id)" @change="setSelected(opt.id, ($event.target as HTMLInputElement).checked)" />
								<component v-if="opt.icon" :is="opt.icon" class="h-4 w-4 text-gray-500" />
								<span class="text-sm text-gray-800">{{ opt.name }}</span>
							</div>
							<span v-if="opt.count != null" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ opt.count }}</span>
						</label>
					</li>
					<li v-if="filtered.length === 0" class="px-3 py-8 text-center text-sm text-gray-500">No results</li>
				</ul>

				<div class="border-t border-gray-100 bg-gray-50 p-2">
					<button type="button" class="w-full rounded-lg bg-emerald-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/60" @click="closeDropdown">Apply</button>
				</div>
			</div>
		</transition>
	</div>
</template>

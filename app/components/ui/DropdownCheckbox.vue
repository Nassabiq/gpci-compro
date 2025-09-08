<script setup lang="ts">
import {ref, computed} from "vue";
import {useClickOutside} from "@/composables/useClickOutside";

const props = defineProps<{
	options: string[]; // daftar kategori
	modelValue: string[]; // v-model (array)
	placeholder?: string;
	widthClass?: string; // opsional: custom lebar tombol, default sm:w-72
}>();
const emit = defineEmits<{(e: "update:modelValue", v: string[]): void}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
useClickOutside(root, () => {
	open.value = false;
});

const selected = computed({
	get: () => props.modelValue ?? [],
	set: (v: string[]) => emit("update:modelValue", v),
});

function toggleOpen() {
	open.value = !open.value;
}
function isChecked(v: string) {
	return selected.value.includes(v);
}
function setChecked(v: string, checked: boolean) {
	const s = new Set(selected.value);
	checked ? s.add(v) : s.delete(v);
	selected.value = Array.from(s);
}
function clearAll() {
	selected.value = [];
}
</script>

<template>
	<div ref="root" class="relative">
		<button type="button" class="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 text-gray-500 bg-white px-3 py-2 text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500" :class="widthClass ?? 'sm:w-72'" @click="toggleOpen">
			<span class="truncate">
				<template v-if="selected.length === 0">
					{{ placeholder ?? "Filter Categories" }}
				</template>
				<template v-else> {{ selected.length }} selected </template>
			</span>
			<span class="text-gray-400">▾</span>
		</button>

		<div v-if="open" class="absolute z-50 mt-2 w-[20rem] max-w-[80vw] rounded-xl border border-gray-200 bg-white shadow-xl">
			<div class="p-2 border-b border-gray-100 text-sm text-gray-600 flex items-center justify-between">
				<span class="font-medium">Select categories</span>
				<button class="px-2 py-1 rounded hover:bg-gray-100" @click="clearAll()">Clear</button>
			</div>

			<ul class="max-h-64 overflow-auto py-1">
				<li v-for="opt in options" :key="opt" class="px-2 py-1">
					<label class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50 cursor-pointer">
						<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="isChecked(opt)" @change="setChecked(opt, ($event.target as HTMLInputElement).checked)" />
						<span class="text-sm text-gray-800">{{ opt }}</span>
					</label>
				</li>
			</ul>

			<div class="p-2 border-t border-gray-100">
				<button class="w-full rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" @click="open = false">Apply</button>
			</div>
		</div>
	</div>
</template>

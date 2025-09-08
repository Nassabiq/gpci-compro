<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Search } from "lucide-vue-next";

type RawCategory = { name: string; count: number; icon: any };
type Option = { id: string; name: string; count: number; icon: any };

const props = defineProps<{
	categories: RawCategory[];
	searchTerm: string;
	selectedCategory: string;
}>();

const emit = defineEmits<{
	(e: "update:searchTerm", value: string): void;
	(e: "update:selectedCategory", value: string): void;
}>();

// local state untuk multiselect (array of ids)
const selectedCategories = ref<string[]>([]);

// helper slug untuk bikin id dari name
const slug = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

// normalize options -> tambahkan `id`
const optionsWithId = computed<Option[]>(() =>
	(props.categories || []).map((c) => ({
		id: slug(c.name),
		name: c.name,
		count: c.count,
		icon: c.icon,
	}))
);

// sinkron nilai awal dari prop single ke array
onMounted(() => {
	if (props.selectedCategory) {
		const initialId = optionsWithId.value.find((o) => o.name === props.selectedCategory)?.id ?? slug(props.selectedCategory); // fallback
		selectedCategories.value = [initialId];
	}
});

// kalau array berubah, teruskan ke API lama (single) pakai item pertama
watch(selectedCategories, (ids) => {
	const first = ids[0] || "";
	// konversi id -> name untuk event lama (lebih manusiawi)
	const firstName = optionsWithId.value.find((o) => o.id === first)?.name ?? "";
	emit("update:selectedCategory", firstName);
});
</script>

<template>
	<section class="py-12 bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Search + Category MultiSelect -->
			<div class="flex flex-col lg:flex-row justify-between items-center gap-4">
				<!-- Search -->
				<div class="relative flex-1 w-full max-w-md">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input :value="searchTerm" @input="emit('update:searchTerm', ($event.target as HTMLInputElement).value)" type="text" placeholder="Search products or companies..." class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
				</div>

				<UiDropdownSelect class="w-full lg:w-80" :options="optionsWithId" v-model:selected="selectedCategories" placeholder="Filter by category" />
			</div>
		</div>
	</section>
</template>

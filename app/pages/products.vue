<script setup lang="ts">
useHead({ title: "Products" });
definePageMeta({ layout: 'landing' })

import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useProductsStore } from "~/stores/products";

// ikon untuk mapping kategori
import { Building, Home, Sparkles, Award } from "lucide-vue-next";

const productsStore = useProductsStore();
const { cards, pending, error, total } = storeToRefs(productsStore);

const page = ref(1);
const limit = ref(12);

const searchTerm = ref<string>("");
const selectedCategory = ref<string>(""); // '' = semua

onMounted(async () => {
	await productsStore.fetchList({ page: page.value, limit: limit.value });
});

// kategori dinamis dari store + ikon
const iconsMap: Record<string, any> = {
	All: Sparkles,
	"Building Materials": Building,
	"Home & Living": Home,
	"Consumer Goods": Award,
	Industrial: Building,
};

const dynamicCategories = computed(() => {
	const base = productsStore.categoriesFromList; // [{name, count}]
	const totalCount = base.reduce((acc: number, c: any) => acc + c.count, 0);
	const items = [{ name: "All", count: totalCount }, ...base];
	return items.map((c) => ({ ...c, icon: iconsMap[c.name] ?? Sparkles }));
});

const filteredProducts = computed(() => {
	const term = (searchTerm.value ?? "").trim().toLowerCase();
	const cat = (selectedCategory.value ?? "").toString();

	return (cards.value ?? []).filter((p: any) => {
		const pCat = (p.categoryId ?? p.category ?? "").toString();
		const matchCat = !cat || pCat === cat;

		const haystack = [p.title, p.name, p.description, p.category, p.company].map((v) => (v ?? "").toString().toLowerCase()).join(" ");
		const matchSearch = !term || haystack.includes(term);

		return matchCat && matchSearch;
	});
});

const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / Math.max(1, limit.value))));

async function goTo(p: number) {
	if (p < 1 || p > totalPages.value) return;
	page.value = p;
	await productsStore.fetchList({ page: page.value, limit: limit.value });
}

function clearFilters() {
	searchTerm.value = "";
	selectedCategory.value = "All";
}
</script>

<template>
	<div class="min-h-screen">
		<ProductsHero :categories="dynamicCategories" :total="total || 0" />

		<ProductsFilter :categories="dynamicCategories" v-model:searchTerm="searchTerm" v-model:selectedCategory="selectedCategory" />

		<section class="py-16 bg-gradient-to-br from-gray-50 to-green-50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-gray-900">
						{{ selectedCategory === "All" ? "All Certified Products" : selectedCategory }}
					</h2>
					<p class="text-gray-600 mt-2">Showing {{ filteredProducts.length }} products</p>
				</div>

				<ProductsGrid :products="filteredProducts" :pending="pending" :error="error" @clear-filters="clearFilters" />

				<ProductsPagination v-if="totalPages > 1" :page="page" :total-pages="totalPages" @change-page="goTo" />
			</div>
		</section>

		<ProductsStats />
		<ProductsCta />
	</div>
</template>

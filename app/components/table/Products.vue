<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ALL_PRODUCTS } from "~/data/products"; // ⬅️ import sumber normalized
import type { Product } from "~/data/products";

// ====== STATE ======
const rows = ref<Product[]>(ALL_PRODUCTS);

// Search & Filters
const search = ref("");
const selectedCategories = ref<string[]>([]); // multi category

// Derived lists
const categories = computed(() => Array.from(new Set(rows.value.map((r) => r.category))).sort((a, b) => a.localeCompare(b)));

// ====== FILTERING ======
const filtered = computed(() => {
	const q = search.value.trim().toLowerCase();
	const cats = selectedCategories.value;

	return rows.value.filter((r) => {
		const matchCat = cats.length === 0 || cats.includes(r.category);
		const haystack = [r.title, r.company, r.category, r.description, ...(r.features || [])].join(" ").toLowerCase();
		const matchQ = !q || haystack.includes(q);
		return matchCat && matchQ;
	});
});

/* ========= Pagination (fixed) ========= */
const page = ref(1);
const pageSize = ref(10);

// total pages, minimal 1 agar kontrol tak rusak saat kosong
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));

// reset/clamp saat filter/search/pageSize berubah
watch([filtered, pageSize], () => {
	if (page.value > totalPages.value) page.value = totalPages.value;
	if (page.value < 1) page.value = 1;
});

const paginated = computed(() => {
	const start = (page.value - 1) * pageSize.value;
	return filtered.value.slice(start, start + pageSize.value);
});

const FALLBACK_IMG = "/img/empty-image.png";
function normalizePublicPath(path?: string | null) {
	const s = (path ?? "").trim();
	if (!s) return "";
	if (/^https?:\/\//i.test(s)) return s;
	return s.startsWith("/") ? s : `/${s}`;
}

function imageSrc(src?: string | null) {
	const norm = normalizePublicPath(src);
	return norm || FALLBACK_IMG;
}

function useFallback(e: Event) {
	const img = e.target as HTMLImageElement;
	// cegah infinite loop kalau fallback pun gagal
	img.onerror = null;
	img.src = FALLBACK_IMG;
}
</script>

<template>
	<section class="py-12 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Controls -->
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
				<div class="flex-1">
					<input v-model="search" type="text" placeholder="Search product, company, category…" class="w-full pl-3 pr-3 py-2 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
				</div>

				<div class="flex flex-col sm:flex-row gap-3">
					<!-- Multi-select Category -->
					<UiDropdownCheckbox :options="categories" v-model="selectedCategories" placeholder="Filter Categories" />

					<!-- Page size (single select) -->
					<UiSelect :options="[10, 20, 50, 100]" v-model="pageSize" :asNumber="true" :formatOption="(n) => `${n} / page`" widthClass="sm:w-36" />
				</div>
			</div>

			<!-- Table -->
			<div class="rounded-xl border border-gray-200 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="min-w-full text-left text-sm">
						<thead class="bg-gray-50 text-gray-700">
							<tr>
								<th class="px-4 py-3 font-semibold"></th>
								<th class="px-4 py-3 font-semibold">Product</th>
								<th class="px-4 py-3 font-semibold">Status</th>
								<th class="px-4 py-3 font-semibold">Company</th>
								<th class="px-4 py-3 font-semibold">Category</th>
								<!-- <th class="px-4 py-3 font-semibold">Features</th> -->
								<th class="px-4 py-3 font-semibold">Certification Date</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(r, i) in paginated" :key="r.id || i" class="border-t border-gray-100 text-gray-500 hover:bg-gray-50 align-middle">
								<!-- Product with thumbnail -->
								<td class="px-4 py-3">
									<img :src="imageSrc(r.image)" :alt="r.title || 'Product image'" class="h-12 w-12 rounded-md object-cover bg-gray-100" loading="lazy" decoding="async" @error="useFallback" />
								</td>
								<td class="px-4 py-3 w-[150px]">
									<div class="flex items-start gap-3">
										<div>
											<div class="font-semibold text-gray-900 whitespace-nowrap">{{ r.title }}</div>
											<div class="text-xs text-gray-500">{{ r.description }}</div>
										</div>
									</div>
								</td>

								<td class="px-4 py-3 whitespace-nowrap">
									<UiBadge :value="r.status" />
								</td>
								<td class="px-4 py-3">{{ r.company }}</td>
								<td class="px-4 py-3 whitespace-nowrap">{{ r.category }}</td>
								<!-- <td class="px-4 py-3">
									<span class="block max-w-xl truncate" :title="(r.features || []).join(', ')">
										{{ (r.features || []).join(", ") }}
									</span>
								</td> -->
								<td class="px-4 py-3">
									{{ r.certificationDate || "—" }}
								</td>
							</tr>

							<tr v-if="paginated.length === 0">
								<td colspan="6" class="px-4 py-6 text-center text-gray-500">No data found.</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Footer / pagination -->
			<UiPagination class="mt-3" v-model:page="page" :total-items="filtered.length" :page-size="pageSize" :max-buttons="7" :show-edges="true" />
		</div>
	</section>
</template>

// stores/products.ts
import {defineStore} from "pinia";
import {ALL_PRODUCTS, type Product} from "~/data/products";

export type ProductQuery = {
	page?: number;
	limit?: number;
	category?: string;
	search?: string;
	sort?: "newest" | "popular";
};

export const useProductsStore = defineStore("products", {
	state: () => ({
		// LISTING /products
		cards: [] as Product[],
		total: 0,
		pending: false as boolean,
		error: null as string | null,
		loadedOnce: false as boolean,
		lastQuery: {} as ProductQuery,

		// SUBSET untuk homepage (opsional)
		homeCards: [] as Product[],
		homePending: false as boolean,
		homeError: null as string | null,
		homeLoadedOnce: false as boolean,
	}),

	getters: {
		/** hitung total halaman utk pagination sederhana */
		totalPages: (s) => (limit: number) => Math.max(1, Math.ceil((s.total || 0) / Math.max(1, limit || 1))),

		/** kategori + count berdasarkan seluruh data utama */
		categoriesFromList: () => {
			const map = new Map<string, number>();
			for (const p of ALL_PRODUCTS) {
				map.set(p.category, (map.get(p.category) ?? 0) + 1);
			}
			return Array.from(map.entries())
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(([name, count]) => ({name, count}));
		},
	},

	actions: {
		/**
		 * “Fetch” dari data utama (JSON yang sudah dinormalisasi).
		 * Mendukung pagination & filter simple di sisi store (client-side).
		 */
		async fetchList(query: ProductQuery = {}) {
			this.pending = true;
			this.error = null;

			try {
				const page = query.page ?? 1;
				const limit = query.limit ?? 12;
				const term = (query.search ?? "").trim().toLowerCase();
				const cat = query.category && query.category !== "All" ? query.category : undefined;

				let items = ALL_PRODUCTS.slice();

				// filter kategori
				if (cat) items = items.filter((p) => p.category === cat);

				// search sederhana
				if (term) {
					items = items.filter((p) => (p.title || "").toLowerCase().includes(term) || (p.company || "").toLowerCase().includes(term) || (p.category || "").toLowerCase().includes(term) || (p.description || "").toLowerCase().includes(term));
				}

				// sort opsional
				if (query.sort === "popular") {
					items.sort((a, b) => b.rating - a.rating);
				}
				// if (query.sort === "newest") { /* tidak ada tanggal di sumber */ }

				// pagination
				const total = items.length;
				const start = (page - 1) * limit;
				const end = start + limit;

				this.cards = items.slice(start, end);
				this.total = total;
				this.loadedOnce = true;
				this.lastQuery = {...query, page, limit};
			} catch (e: any) {
				this.error = e?.message ?? "Failed to prepare products";
			} finally {
				this.pending = false;
			}
		},

		resetListCache() {
			this.loadedOnce = false;
			this.lastQuery = {};
		},

		/**
		 * Subset untuk homepage (carousel), default ambil N item teratas.
		 */
		async fetchHomeIfNeeded(limit = 9) {
			if (this.homeLoadedOnce) return;
			this.homePending = true;
			this.homeError = null;
			try {
				this.homeCards = ALL_PRODUCTS.slice(0, limit);
				this.homeLoadedOnce = true;
			} catch (e: any) {
				this.homeCards = [];
				this.homeLoadedOnce = false;
				this.homeError = e?.message ?? "Failed to load home products";
			} finally {
				this.homePending = false;
			}
		},

		/**
		 * Detail per id (cari dari ALL_PRODUCTS).
		 */
		async fetchById(id: string): Promise<Product | null> {
			return ALL_PRODUCTS.find((p) => p.id === id) ?? null;
		},
	},
});

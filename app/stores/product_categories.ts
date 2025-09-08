import {defineStore} from "pinia";
import type {ProductCategoriesCard} from "~/data/product-categories";

export type ProductCategoryQuery = {
	category?: string;
	search?: string;
	sort?: "newest" | "popular";
	page?: number;
	limit?: number;
};

// util kecil: simulasi delay agar skeleton terlihat (opsional)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useProductCategoriesStore = defineStore("product_categories", {
	state: () => ({
		// HOME bucket (index page)
		homeCards: [] as ProductCategoriesCard[],
		homePending: false,
		homeError: null as string | null,
		homeLoadedOnce: false,

		// LIST bucket (/products)
		cards: [] as ProductCategoriesCard[],
		total: 0,
		pending: false,
		error: null as string | null,
		loadedOnce: false,
		lastQuery: {} as ProductCategoryQuery,
	}),

	getters: {
		totalPages: (s) => (limit: number) => Math.max(1, Math.ceil((s.total || 0) / Math.max(1, limit))),
	},

	actions: {
		// ====== INDEX / HOME ======
		async fetchHomeIfNeeded(limit = 9) {
			if (this.homeLoadedOnce) return;
			this.homePending = true;
			this.homeError = null;
			try {
				// dynamic import → code-splitting & lazy load data file
				const {ALL_PRODUCT_CATEGORIES} = await import("~/data/product-categories");

				// opsional: beri delay ringan agar skeleton terlihat
				await sleep(250);
				this.homeCards = ALL_PRODUCT_CATEGORIES.slice(0, limit);
				this.homeLoadedOnce = true;
			} catch (e: any) {
				this.homeError = e?.message ?? "Failed to load local products data.";
				this.homeCards = []; // atau isi fallback hardcoded lain jika mau
			} finally {
				this.homePending = false;
			}
		},

		// ====== LISTING /products (tanpa fetch, semua lokal) ======
		async fetchList(query: ProductCategoryQuery = {}) {
			this.pending = true;
			this.error = null;
			try {
				const {ALL_PRODUCT_CATEGORIES} = await import("~/data/product-categories");
				await sleep(250);

				let items = ALL_PRODUCT_CATEGORIES.slice();

				// filter optional
				if (query.category) {
					items = items.filter((i) => i.category === query.category);
				}
				if (query.search) {
					const s = query.search.toLowerCase();
					items = items.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
				}

				// sort dummy
				if (query.sort === "newest") items = items.slice().reverse();
				if (query.sort === "popular") items = items.slice().sort((a, b) => a.title.localeCompare(b.title));

				// pagination
				const page = query.page ?? 1;
				const limit = query.limit ?? 12;
				const start = (page - 1) * limit;
				const end = start + limit;

				this.total = items.length;
				this.cards = items.slice(start, end);

				this.loadedOnce = true;
				this.lastQuery = {page, limit, ...query};
			} catch (e: any) {
				this.error = e?.message ?? "Failed to load local products data.";
				this.cards = [];
				this.total = 0;
			} finally {
				this.pending = false;
			}
		},

		resetListCache() {
			this.loadedOnce = false;
			this.lastQuery = {};
		},
	},
});

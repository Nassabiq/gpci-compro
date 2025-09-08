// data/products.ts
export type Product = {
	id: string;
	title: string;
	image: string;
	company: string;
	status: boolean;
	category: string;
	description: string;
	features: string[];
	certificationDate?: string;
};

// Pastikan file JSON ada di path ini
import raw from "./products_raw.json" assert {type: "json"};
import {normalizeProducts} from "./normalizeProducts";
import type {RawRoot} from "./normalizeProducts";

/**
 * Sumber data utama untuk seluruh halaman/products.
 * Tidak memakai fetch API — langsung dari JSON yang dinormalisasi.
 */
export const ALL_PRODUCTS: Product[] = normalizeProducts(raw as RawRoot);

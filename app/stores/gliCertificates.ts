import {defineStore} from "pinia";
import {apiRequest, ApiError} from "@/utils/api";

const CATEGORY_ENDPOINT = "brand-categories";
const BRAND_ENDPOINT = "brands";
const PRODUCT_ENDPOINT = "products";
const CERTIFICATION_ENDPOINT = "product-certifications";

export interface GliBrandCategory {
	id: number;
	name: string;
	slug?: string | null;
	description?: string | null;
}

export interface GliBrand {
	id: number;
	name: string;
	slug?: string | null;
	categoryId: number | null;
	categoryName?: string | null;
	description?: string | null;
}

export interface GliProduct {
	id: number;
	name: string;
	slug?: string | null;
	brandId: number | null;
	categoryId: number | null;
	type?: string | null;
	status?: string | null;
}

export interface GliCertification {
	id: number | string;
	productId: number;
	certificateNumber: string;
	type: string;
	status: string;
	issuedAt?: string | null;
	expiresAt?: string | null;
	notes?: string | null;
}

export interface GliCertificationWithRelations extends GliCertification {
	productName: string;
	brandId: number | null;
	brandName: string;
	categoryId: number | null;
	categoryName: string;
	typeLabel: string;
}

export interface CreateCertificationPayload {
	productId: number;
	certificateNumber: string;
	status?: string;
	type?: string;
	issuedAt?: string | null;
	expiresAt?: string | null;
	notes?: string | null;
}

export interface UpdateCertificationPayload {
	productId?: number;
	certificateNumber?: string;
	status?: string;
	type?: string;
	issuedAt?: string | null;
	expiresAt?: string | null;
	notes?: string | null;
}

interface ApiBrandCategory {
	id: number;
	name: string;
	slug?: string | null;
	description?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

interface ApiBrand {
	id: number;
	name: string;
	slug?: string | null;
	category_id?: number | null;
	category?: ApiBrandCategory | null;
	category_name?: string | null;
	description?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

interface ApiProduct {
	id: number;
	name: string;
	slug?: string | null;
	brand_id?: number | null;
	category_id?: number | null;
	type?: string | null;
	status?: string | null;
	brand?: ApiBrand | null;
	certifications?: ApiProductCertification[] | null;
	certification?: ApiProductCertification | null;
	latest_certification?: ApiProductCertification | null;
	current_certification?: ApiProductCertification | null;
	certificate_number?: string | null;
	certificateNumber?: string | null;
	certificate_status?: string | null;
	certificateStatus?: string | null;
	certificate_type?: string | null;
	certificateType?: string | null;
	issued_at?: string | null;
	issuedAt?: string | null;
	expired_at?: string | null;
	expires_at?: string | null;
	expiresAt?: string | null;
	notes?: string | null;
	description?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

interface ApiProductCertification {
	id?: number | null;
	product_id?: number | null;
	certificate_number: string;
	type?: string | null;
	status?: string | null;
	issued_at?: string | null;
	expired_at?: string | null;
	expires_at?: string | null;
	expiresAt?: string | null;
	issuedAt?: string | null;
	notes?: string | null;
	description?: string | null;
	product?: ApiProduct | null;
	created_at?: string | null;
	updated_at?: string | null;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

let fallbackCertCounter = 0;

function makeFallbackCertId(productId?: number | null, certificateNumber?: string | null): string {
	const base = productId != null ? `product-${productId}` : "product-unknown";
	if (certificateNumber) {
		return `${base}-${slugify(certificateNumber)}`;
	}
	fallbackCertCounter += 1;
	return `${base}-cert-${fallbackCertCounter}`;
}

function isFallbackCertificationId(id: number | string): boolean {
	return typeof id === "string" && id.startsWith("product-");
}

function normalizeCategory(payload: ApiBrandCategory): GliBrandCategory {
	return {
		id: payload.id,
		name: payload.name,
		slug: payload.slug ?? slugify(payload.name),
		description: payload.description ?? null,
	};
}

function normalizeBrand(payload: ApiBrand): GliBrand {
	const category = payload.category ? normalizeCategory(payload.category) : null;
	const categoryId = payload.category_id ?? category?.id ?? null;
	return {
		id: payload.id,
		name: payload.name,
		slug: payload.slug ?? slugify(payload.name),
		categoryId,
		categoryName: category?.name ?? payload.category_name ?? null,
		description: payload.description ?? null,
	};
}

function normalizeProduct(payload: ApiProduct): GliProduct {
	const brand = payload.brand ? normalizeBrand(payload.brand) : null;
	const brandId = payload.brand_id ?? brand?.id ?? null;
	const categoryId = payload.category_id ?? brand?.categoryId ?? null;
	return {
		id: payload.id,
		name: payload.name,
		slug: payload.slug ?? slugify(payload.name),
		brandId,
		categoryId,
		type: payload.type ?? null,
		status: payload.status ?? null,
	};
}

function normalizeCertification(payload: ApiProductCertification, fallbackProductId?: number | null): GliCertification {
	const productId = payload.product_id ?? fallbackProductId ?? 0;
	const type = String(payload.type ?? "green-label").toLowerCase();
	const status = String(payload.status ?? "active").toLowerCase();
	const issuedAt = payload.issued_at ?? payload.issuedAt ?? null;
	const expiresAt = payload.expired_at ?? payload.expires_at ?? payload.expiresAt ?? null;
	const notes = payload.notes ?? payload.description ?? null;
	const certificateNumber = payload.certificate_number ? String(payload.certificate_number) : `CERT-${productId || "unknown"}`;
	const id = payload.id ?? makeFallbackCertId(productId, certificateNumber);

	return {
		id,
		productId,
		certificateNumber,
		type,
		status,
		issuedAt,
		expiresAt,
		notes,
	};
}

function collectCertificationsFromProduct(product: ApiProduct): GliCertification[] {
	const list: GliCertification[] = [];
	const seen = new Set<string>();
	const pushUnique = (cert: GliCertification) => {
		const key = `${cert.productId}::${cert.certificateNumber}::${cert.type}`;
		if (seen.has(key)) return;
		seen.add(key);
		list.push(cert);
	};

	if (Array.isArray(product.certifications)) {
		for (const cert of product.certifications) {
			if (!cert || !cert.certificate_number) continue;
			pushUnique(normalizeCertification(cert, product.id));
		}
	}

	const singleCertification = product.latest_certification || product.current_certification || product.certification;
	if (singleCertification && singleCertification.certificate_number) {
		pushUnique(normalizeCertification(singleCertification, product.id));
	}

	const directNumberRaw =
		product.certificate_number ??
		product.certificateNumber ??
		(singleCertification ? singleCertification.certificate_number : null);
	const directNumber = directNumberRaw != null ? String(directNumberRaw) : null;

	if (directNumber) {
		const directStatus = String(product.certificate_status ?? product.certificateStatus ?? product.status ?? "active").toLowerCase();
		const directType = String(product.certificate_type ?? product.certificateType ?? product.type ?? "green-label").toLowerCase();
		const issuedAt = product.issued_at ?? product.issuedAt ?? singleCertification?.issued_at ?? singleCertification?.issuedAt ?? null;
		const expiresAt =
			product.expired_at ??
			product.expires_at ??
			product.expiresAt ??
			singleCertification?.expired_at ??
			singleCertification?.expires_at ??
			singleCertification?.expiresAt ??
			null;
		const notes =
			product.notes ??
			product.description ??
			singleCertification?.notes ??
			singleCertification?.description ??
			null;
		pushUnique({
			id: makeFallbackCertId(product.id, directNumber),
			productId: product.id,
			certificateNumber: directNumber,
			type: directType,
			status: directStatus,
			issuedAt,
			expiresAt,
			notes,
		});
	}

	if (!list.length) {
		const fallbackNumber = String(product.slug ?? product.name ?? `product-${product.id}`);
		pushUnique({
			id: makeFallbackCertId(product.id, fallbackNumber),
			productId: product.id,
			certificateNumber: fallbackNumber,
			type: String(product.type ?? "green-label").toLowerCase(),
			status: String(product.status ?? "active").toLowerCase(),
			issuedAt: product.issued_at ?? product.issuedAt ?? null,
			expiresAt: product.expired_at ?? product.expires_at ?? product.expiresAt ?? null,
			notes: product.notes ?? product.description ?? null,
		});
	}

	return list;
}

function certificationTypeLabel(type: string): string {
	const normalized = type.toLowerCase();
	if (normalized === "green-label" || normalized === "gli") return "Green Label Indonesia";
	if (normalized === "green toll road" || normalized === "gtri") return "Green Toll Road Indonesia";
	return normalized
		.split(/[-_]/g)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ") || "Unknown";
}

function upsertById<T extends {id: number}>(list: T[], item: T) {
	const index = list.findIndex((entry) => entry.id === item.id);
	if (index >= 0) {
		list.splice(index, 1, {...list[index], ...item});
	} else {
		list.push(item);
	}
}

async function fetchList<T>(endpoint: string): Promise<T[]> {
	try {
		return await apiRequest<T[]>(endpoint);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			return [];
		}
		throw err;
	}
}

export const useGliCertificatesStore = defineStore("gli-certificates", {
	state: () => ({
		categories: [] as GliBrandCategory[],
		brands: [] as GliBrand[],
		products: [] as GliProduct[],
		certifications: [] as GliCertification[],
		loading: false,
		error: null as string | null,
		loadedOnce: false,
		nextLocalId: 1,
	}),
	getters: {
		categoriesById: (state) => {
			const map: Record<number, GliBrandCategory> = {};
			for (const cat of state.categories) {
				map[cat.id] = cat;
			}
			return map;
		},
		brandsById: (state) => {
			const map: Record<number, GliBrand> = {};
			for (const brand of state.brands) {
				map[brand.id] = brand;
			}
			return map;
		},
		productsById: (state) => {
			const map: Record<number, GliProduct> = {};
			for (const product of state.products) {
				map[product.id] = product;
			}
			return map;
		},
		certificationsEnriched(): GliCertificationWithRelations[] {
			const categories = this.categoriesById;
			const brands = this.brandsById;
			const products = this.productsById;

			return this.certifications.map((cert) => {
				const product = products[cert.productId];
				const brand = product?.brandId != null ? brands[product.brandId] : null;
				const category = brand?.categoryId != null ? categories[brand.categoryId] : product?.categoryId != null ? categories[product.categoryId] : null;

				return {
					...cert,
					productName: product?.name ?? "Unknown product",
					brandId: brand?.id ?? product?.brandId ?? null,
					brandName: brand?.name ?? "Unknown brand",
					categoryId: category?.id ?? brand?.categoryId ?? product?.categoryId ?? null,
					categoryName: category?.name ?? "Uncategorized",
					typeLabel: certificationTypeLabel(cert.type),
				};
			});
		},
		statusOptions: (state) => {
			const options = new Set<string>();
			for (const cert of state.certifications) {
				if (cert.status) options.add(cert.status);
			}
			if (!options.size) options.add("active");
			return Array.from(options).sort();
		},
		typeOptions: (state) => {
			const options = new Set<string>();
			for (const cert of state.certifications) {
				if (cert.type) options.add(cert.type);
			}
			options.add("green-label");
			return Array.from(options).sort();
		},
	},
	actions: {
		async fetchAll(force = false) {
			if (this.loadedOnce && !force) return;
			this.loading = true;
			this.error = null;
			try {
				const [rawCategories, rawBrands, rawProducts] = await Promise.all([
					fetchList<ApiBrandCategory>(CATEGORY_ENDPOINT),
					fetchList<ApiBrand>(BRAND_ENDPOINT),
					fetchList<ApiProduct>(PRODUCT_ENDPOINT),
				]);

				this.categories = rawCategories.map(normalizeCategory);
				this.brands = rawBrands.map(normalizeBrand);

				fallbackCertCounter = 0;
				const normalizedProducts: GliProduct[] = [];
				const derivedCertifications: GliCertification[] = [];

			for (const rawProduct of rawProducts) {
				const normalizedProduct = normalizeProduct(rawProduct);
				normalizedProducts.push(normalizedProduct);

					if (rawProduct.brand) {
						const normalizedBrand = normalizeBrand(rawProduct.brand);
						upsertById(this.brands, normalizedBrand);
						if (rawProduct.brand.category) {
							const normalizedCategory = normalizeCategory(rawProduct.brand.category);
							upsertById(this.categories, normalizedCategory);
						}
					}

					const certs = collectCertificationsFromProduct(rawProduct);
					for (const cert of certs) {
						derivedCertifications.push(cert);
					}
				}

			this.products = normalizedProducts;
			this.certifications = derivedCertifications;
			this.nextLocalId = derivedCertifications.length + 1;
			this.loadedOnce = true;
			} catch (err: any) {
				const message = err?.message ?? "Failed to load GLI certificates.";
				this.error = message;
				throw err;
			} finally {
				this.loading = false;
			}
		},
		async fetchCertifications(force = false) {
			await this.fetchAll(force);
		},
		async createCertification(payload: CreateCertificationPayload) {
			this.error = null;
			const productId = payload.productId;
			const targetProduct = this.products.find((p) => p.id === productId);
			if (!targetProduct) {
				throw new ApiError("Product not found for certification.", {status: 404});
			}

			const cleanedNumber = payload.certificateNumber.trim();
			if (!cleanedNumber) {
				throw new ApiError("Certificate number is required.", {status: 422});
			}

			const status = String(payload.status ?? "active").toLowerCase();
			const type = String(payload.type ?? "green-label").toLowerCase();
			const issuedAt = payload.issuedAt ?? null;
			const expiresAt = payload.expiresAt ?? null;
			let notes: string | null = null;
			if (payload.notes !== undefined) {
				if (payload.notes === null) {
					notes = null;
				} else {
					const trimmed = String(payload.notes).trim();
					notes = trimmed || null;
				}
			}

			try {
				const created = await apiRequest<ApiProductCertification>(CERTIFICATION_ENDPOINT, {
					method: "POST",
					body: {
						product_id: productId,
						certificate_number: cleanedNumber,
						status,
						type,
						issued_at: issuedAt,
						expires_at: expiresAt,
						notes,
					},
				});

				const normalized = normalizeCertification(created, productId);
				const existingIndex = this.certifications.findIndex((cert) => cert.id === normalized.id);
				if (existingIndex >= 0) {
					this.certifications.splice(existingIndex, 1, normalized);
				} else {
					this.certifications.push(normalized);
				}
				return normalized;
			} catch (err: any) {
				this.error = err?.message ?? "Failed to create certification.";
				throw err;
			}
		},
		async updateCertification(id: number | string, payload: UpdateCertificationPayload) {
			this.error = null;
			const index = this.certifications.findIndex((cert) => cert.id === id);
			if (index < 0) {
				throw new ApiError("Certification not found.", {status: 404});
			}

			const current = this.certifications[index];
			if (isFallbackCertificationId(current.id)) {
				throw new ApiError("Certification is missing a server identifier. Please reload data and try again.", {status: 400});
			}

			const newProductId = payload.productId ?? current.productId;
			const targetProduct = this.products.find((p) => p.id === newProductId);
			if (!targetProduct) {
				throw new ApiError("Product not found for certification.", {status: 404});
			}

			const certificateNumber = payload.certificateNumber != null ? payload.certificateNumber.trim() : current.certificateNumber;
			if (!certificateNumber) {
				throw new ApiError("Certificate number is required.", {status: 422});
			}

			const type = payload.type ? String(payload.type).toLowerCase() : current.type;
			const status = payload.status ? String(payload.status).toLowerCase() : current.status;
			const issuedAt = payload.issuedAt !== undefined ? payload.issuedAt ?? null : current.issuedAt ?? null;
			const expiresAt = payload.expiresAt !== undefined ? payload.expiresAt ?? null : current.expiresAt ?? null;
			let notes: string | null = current.notes ?? null;
			if (payload.notes !== undefined) {
				if (payload.notes === null) {
					notes = null;
				} else {
					const trimmed = String(payload.notes).trim();
					notes = trimmed || null;
				}
			}

			try {
				const updatedFromApi = await apiRequest<ApiProductCertification>(`${CERTIFICATION_ENDPOINT}/${encodeURIComponent(String(current.id))}`, {
					method: "PUT",
					body: {
						product_id: newProductId,
						certificate_number: certificateNumber,
						status,
						type,
						issued_at: issuedAt,
						expires_at: expiresAt,
						notes,
					},
				});

				const normalized = normalizeCertification(updatedFromApi, newProductId);
				this.certifications.splice(index, 1, normalized);
				return normalized;
			} catch (err: any) {
				this.error = err?.message ?? "Failed to update certification.";
				throw err;
			}
		},
		async deleteCertification(id: number | string) {
			this.error = null;
			const index = this.certifications.findIndex((cert) => cert.id === id);
			if (index < 0) {
				throw new ApiError("Certification not found.", {status: 404});
			}

			const target = this.certifications[index];
			if (isFallbackCertificationId(target.id)) {
				throw new ApiError("Certification is missing a server identifier. Please reload data and try again.", {status: 400});
			}

			try {
				await apiRequest<void>(`${CERTIFICATION_ENDPOINT}/${encodeURIComponent(String(target.id))}`, {
					method: "DELETE",
				});
				this.certifications.splice(index, 1);
			} catch (err: any) {
				this.error = err?.message ?? "Failed to delete certification.";
				throw err;
			}
		},
	},
});

export function formatCertificationStatus(status: string): string {
	if (!status) return "Unknown";
	return status
		.split(/[-_]/g)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export {certificationTypeLabel};

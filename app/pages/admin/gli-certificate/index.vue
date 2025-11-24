<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {Home, BadgeCheck, Plus, Save, Loader2, Edit, Trash2} from "lucide-vue-next";
import PageHeader from "@/components/admin/PageHeader.vue";
import DataTable, {type Column} from "@/components/ui/DataTable.vue";
import Modal from "@/components/ui/Modal.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import {requirePermission} from "@/composables/usePermissionGuard";
import {
	useGliCertificatesStore,
	formatCertificationStatus,
	certificationTypeLabel,
	type GliCertificationWithRelations,
} from "@/stores/gliCertificates";

definePageMeta({layout: "admin"});

const auth = await requirePermission("product.certifications.read");
const canCreate = computed(() => auth.hasPermission("product.certifications.write"));

const crumbs = [
	{label: "Home", to: "/admin", icon: Home},
	{label: "Sertifikasi GLI", to: "/admin/gli-certificate"},
];

const gliStore = useGliCertificatesStore();
const initialError = ref<string | null>(null);
try {
	await gliStore.fetchAll();
} catch (err: any) {
	initialError.value = err?.message ?? "Failed to load GLI certifications.";
}

const {certificationsEnriched, loading, error, categories, brands, products, statusOptions, typeOptions} = storeToRefs(gliStore);

const page = ref(1);
const pageSize = ref(10);
const search = ref("");

const categoryFilter = ref("");
const brandFilter = ref("");
const statusFilter = ref("");
const typeFilter = ref("");

const columns: Column[] = [
	{key: "certificateNumber", label: "Certificate #", sortable: true},
	{key: "productName", label: "Product", sortable: true},
	{key: "brandName", label: "Brand", sortable: true},
	{key: "categoryName", label: "Category", sortable: true},
	{key: "typeLabel", label: "Type"},
	{key: "status", label: "Status", sortable: true, align: "center"},
	{key: "issuedAt", label: "Issued", sortable: true},
	{key: "expiresAt", label: "Expires", sortable: true},
	{key: "actions", label: "Actions", align: "right", width: "140px"},
];

const combinedError = computed(() => initialError.value || error.value);

const filterBrands = computed(() => {
	if (!brands.value.length) return [];
	const categoryId = categoryFilter.value ? Number(categoryFilter.value) : null;
	if (!categoryId) return brands.value;
	return brands.value.filter((brand) => brand.categoryId === categoryId);
});

const filteredRows = computed(() => {
	let data = certificationsEnriched.value.slice();
	const categoryId = categoryFilter.value ? Number(categoryFilter.value) : null;
	const brandId = brandFilter.value ? Number(brandFilter.value) : null;
	const status = statusFilter.value ? statusFilter.value.toLowerCase() : "";
	const type = typeFilter.value ? typeFilter.value.toLowerCase() : "";

	if (categoryId) data = data.filter((row) => row.categoryId === categoryId);
	if (brandId) data = data.filter((row) => row.brandId === brandId);
	if (status) data = data.filter((row) => row.status === status);
	if (type) data = data.filter((row) => row.type === type);

	return data;
});

const statusOptionList = computed(() =>
	statusOptions.value.map((value) => ({
		value,
		label: formatCertificationStatus(value),
	})),
);

const typeOptionList = computed(() =>
	typeOptions.value.map((value) => ({
		value,
		label: certificationTypeLabel(value),
	})),
);

function resetFilters() {
	categoryFilter.value = "";
	brandFilter.value = "";
	statusFilter.value = "";
	typeFilter.value = "";
}

watch(categoryFilter, () => {
	brandFilter.value = "";
	page.value = 1;
});

watch([brandFilter, statusFilter, typeFilter], () => {
	page.value = 1;
});

const showCreateModal = ref(false);
const saving = ref(false);
const formError = ref("");
const createForm = reactive({
	categoryId: "",
	brandId: "",
	productId: "",
	productName: "",
	certificateNumber: "",
	status: "active",
	type: "green-label",
	issuedAt: "",
	expiresAt: "",
	notes: "",
});

const formBrandOptions = computed(() => {
	if (!brands.value.length) return [];
	const categoryId = createForm.categoryId ? Number(createForm.categoryId) : null;
	if (!categoryId) return brands.value;
	return brands.value.filter((brand) => brand.categoryId === categoryId);
});

const formProductOptions = computed(() => {
	if (!products.value.length) return [];
	let list = products.value.slice();
	const categoryId = createForm.categoryId ? Number(createForm.categoryId) : null;
	const brandId = createForm.brandId ? Number(createForm.brandId) : null;

	if (categoryId) list = list.filter((product) => product.categoryId === categoryId);
	if (brandId) list = list.filter((product) => product.brandId === brandId);

	return list;
});

const productSuggestions = computed(() => {
	const term = createForm.productName.trim().toLowerCase();
	let source = formProductOptions.value;
	if (term) {
		source = source.filter((product) => product.name.toLowerCase().includes(term));
	}
	return source.slice(0, 20);
});

watch(
	() => createForm.categoryId,
	() => {
		createForm.brandId = "";
		createForm.productId = "";
		createForm.productName = "";
	},
);

watch(
	() => createForm.brandId,
	() => {
		createForm.productId = "";
		createForm.productName = "";
	},
);

watch(
	() => createForm.productName,
	(name) => {
		if (!name) {
			createForm.productId = "";
			return;
		}
		const match = formProductOptions.value.find((product) => product.name.toLowerCase() === name.toLowerCase());
		createForm.productId = match ? String(match.id) : "";
	},
);

function resetCreateForm() {
	createForm.categoryId = "";
	createForm.brandId = "";
	createForm.productId = "";
	createForm.productName = "";
	createForm.certificateNumber = "";
	createForm.status = "active";
	createForm.type = "green-label";
	createForm.issuedAt = "";
	createForm.expiresAt = "";
	createForm.notes = "";
	formError.value = "";
}

function openCreate() {
	if (!canCreate.value) return;
	resetCreateForm();
	isEditing.value = false;
	editingId.value = null;
	showCreateModal.value = true;
}

const isEditing = ref(false);
const editingId = ref<string | number | null>(null);

function openEdit(row: GliCertificationWithRelations) {
	if (!canCreate.value) return;
	resetCreateForm();
	isEditing.value = true;
	editingId.value = row.id;
	createForm.categoryId = row.categoryId ? String(row.categoryId) : "";
	createForm.brandId = row.brandId ? String(row.brandId) : "";
	createForm.productId = String(row.productId);
	createForm.productName = row.productName;
	createForm.certificateNumber = row.certificateNumber;
	createForm.status = row.status;
	createForm.type = row.type;
	createForm.issuedAt = row.issuedAt ?? "";
	createForm.expiresAt = row.expiresAt ?? "";
	createForm.notes = row.notes ?? "";
	showCreateModal.value = true;
}

async function saveCertificate() {
	if (!canCreate.value) {
		formError.value = "Anda tidak memiliki izin untuk menyimpan sertifikasi.";
		return;
	}

	const productName = createForm.productName.trim();
	const productIdNumeric = createForm.productId ? Number(createForm.productId) : NaN;
	let resolvedProduct =
		!Number.isNaN(productIdNumeric) && productIdNumeric
			? gliStore.products.find((product) => product.id === productIdNumeric)
			: null;

	if (!resolvedProduct && productName) {
		resolvedProduct = formProductOptions.value.find((product) => product.name.toLowerCase() === productName.toLowerCase());
		if (resolvedProduct) {
			createForm.productId = String(resolvedProduct.id);
		}
	}

	if (!resolvedProduct) {
		formError.value = "Produk tidak ditemukan. Silakan pilih produk dari daftar.";
		return;
	}
	const productId = resolvedProduct.id;

	const certificateNumber = createForm.certificateNumber.trim();
	if (!certificateNumber) {
		formError.value = "Nomor sertifikat wajib diisi.";
		return;
	}

	formError.value = "";
	saving.value = true;
	try {
		const payload = {
			productId,
			certificateNumber,
			status: createForm.status || "active",
			type: createForm.type || "green-label",
			issuedAt: createForm.issuedAt || null,
			expiresAt: createForm.expiresAt || null,
			notes: createForm.notes ? createForm.notes.trim() : undefined,
		};
		if (isEditing.value && editingId.value != null) {
			await gliStore.updateCertification(editingId.value, payload);
		} else {
			await gliStore.createCertification(payload);
			page.value = 1;
		}
		showCreateModal.value = false;
		resetCreateForm();
		isEditing.value = false;
		editingId.value = null;
	} catch (err: any) {
		formError.value = err?.message ?? "Gagal menyimpan sertifikasi.";
	} finally {
		saving.value = false;
	}
}

watch(showCreateModal, (open) => {
	if (!open) {
		resetCreateForm();
		saving.value = false;
		isEditing.value = false;
		editingId.value = null;
		formError.value = "";
	}
});

function statusClass(status: string) {
	const normalized = status.toLowerCase();
	if (normalized === "active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100";
	if (normalized === "pending") return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100";
	if (normalized === "expired") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100";
	if (normalized === "revoked" || normalized === "inactive") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100";
	return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
}

function formatDate(value?: string | null) {
	if (!value) return "-";
	try {
		return new Date(value).toLocaleDateString();
	} catch {
		return value;
	}
}

const showDeleteConfirm = ref(false);
const pendingDelete = ref<GliCertificationWithRelations | null>(null);

function askDelete(row: GliCertificationWithRelations) {
	if (!canCreate.value) return;
	pendingDelete.value = row;
	showDeleteConfirm.value = true;
}

async function confirmDelete() {
	const target = pendingDelete.value;
	if (!target) return;
	try {
		await gliStore.deleteCertification(target.id);
	} catch (err: any) {
		formError.value = err?.message ?? "Gagal menghapus sertifikasi.";
	} finally {
		showDeleteConfirm.value = false;
		pendingDelete.value = null;
	}
}

function cancelDelete() {
	showDeleteConfirm.value = false;
	pendingDelete.value = null;
}
</script>

<template>
	<section class="p-4">
		<PageHeader title="Sertifikat GLI" description="Kelola daftar sertifikasi Green Label Indonesia berdasarkan kategori, brand, dan produk." :breadcrumbs="crumbs" :icon="BadgeCheck">
			<template #actions>
				<button
					v-if="canCreate"
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"
					@click="openCreate"
				>
					<Plus class="h-4 w-4" />
					Tambah Sertifikasi
				</button>
			</template>
		</PageHeader>

		<div v-if="combinedError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
			{{ combinedError }}
		</div>

		<DataTable
			:columns="columns"
			:rows="filteredRows"
			v-model:page="page"
			v-model:pageSize="pageSize"
			v-model:search="search"
			:loading="loading"
			:externalSort="false"
			rowKey="id"
			@apply-filters="page = 1"
			@reset-filters="resetFilters"
		>
			<template #filters>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-300">Kategori</span>
						<select v-model="categoryFilter" class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
							<option value="">Semua kategori</option>
							<option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
								{{ cat.name }}
							</option>
						</select>
					</label>

					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-300">Brand</span>
						<select v-model="brandFilter" class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
							<option value="">Semua brand</option>
							<option v-for="brand in filterBrands" :key="brand.id" :value="String(brand.id)">
								{{ brand.name }}
							</option>
						</select>
					</label>

					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-300">Status</span>
						<select v-model="statusFilter" class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
							<option value="">Semua status</option>
							<option v-for="status in statusOptionList" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
					</label>

					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-300">Tipe Sertifikasi</span>
						<select v-model="typeFilter" class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
							<option value="">Semua tipe</option>
							<option v-for="type in typeOptionList" :key="type.value" :value="type.value">
								{{ type.label }}
							</option>
						</select>
					</label>
				</div>
			</template>

			<template #cell-status="{value}">
				<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(value)">
					{{ formatCertificationStatus(value) }}
				</span>
			</template>

			<template #cell-issuedAt="{value}">
				{{ formatDate(value) }}
			</template>

			<template #cell-expiresAt="{value}">
				{{ formatDate(value) }}
			</template>
			<template #cell-actions="{row}">
				<div class="flex items-center justify-end gap-2">
					<button
						type="button"
						class="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
						@click="openEdit(row)"
					>
						<Edit class="h-3.5 w-3.5" />
						Edit
					</button>
					<button
						type="button"
						class="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-red-900/30"
						@click="askDelete(row)"
					>
						<Trash2 class="h-3.5 w-3.5" />
						Hapus
					</button>
				</div>
			</template>
			<template #toolbar-actions>
				<button
					v-if="canCreate"
					type="button"
					class="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/50 dark:focus:ring-emerald-900/60"
					@click="openCreate"
				>
					<Plus class="h-4 w-4" />
					Tambah
				</button>
			</template>
		</DataTable>

		<Modal v-model="showCreateModal" :title="isEditing ? 'Ubah Sertifikasi GLI' : 'Tambah Sertifikasi GLI'">
			<form class="grid gap-4" @submit.prevent="saveCertificate">
				<div class="grid gap-2 sm:grid-cols-2">
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Kategori</span>
						<select v-model="createForm.categoryId" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
							<option value="">Semua kategori</option>
							<option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
						</select>
					</label>
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Brand</span>
						<select v-model="createForm.brandId" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
							<option value="">Semua brand</option>
							<option v-for="brand in formBrandOptions" :key="brand.id" :value="String(brand.id)">{{ brand.name }}</option>
						</select>
					</label>
				</div>

				<label class="grid gap-1 text-sm">
					<span class="font-medium text-gray-700 dark:text-gray-200">Produk</span>
					<input v-model="createForm.productName" :list="'gli-product-suggestions'" type="text" placeholder="Ketik nama produk" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
					<datalist id="gli-product-suggestions">
						<option v-for="product in productSuggestions" :key="product.id" :value="product.name">{{ product.name }}</option>
					</datalist>
				</label>

				<label class="grid gap-1 text-sm">
					<span class="font-medium text-gray-700 dark:text-gray-200">Nomor Sertifikat</span>
					<input v-model="createForm.certificateNumber" type="text" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Contoh: GLI-2024-00123" />
				</label>

				<div class="grid gap-2 sm:grid-cols-2">
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Status</span>
						<select v-model="createForm.status" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
							<option v-for="status in statusOptionList" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
					</label>
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Tipe Sertifikasi</span>
						<select v-model="createForm.type" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
							<option v-for="type in typeOptionList" :key="type.value" :value="type.value">
								{{ type.label }}
							</option>
						</select>
					</label>
				</div>

				<div class="grid gap-2 sm:grid-cols-2">
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Tanggal Terbit</span>
						<input v-model="createForm.issuedAt" type="date" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
					</label>
					<label class="grid gap-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-gray-200">Tanggal Kedaluwarsa</span>
						<input v-model="createForm.expiresAt" type="date" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
					</label>
				</div>

				<label class="grid gap-1 text-sm">
					<span class="font-medium text-gray-700 dark:text-gray-200">Catatan</span>
					<textarea v-model="createForm.notes" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Tambahkan catatan penting (opsional)" />
				</label>

				<p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
			</form>

			<template #footer>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
					@click="showCreateModal = false"
				>
					Batal
				</button>
				<button
					type="submit"
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"
					:disabled="saving || !canCreate"
				>
					<Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
					<Save v-else class="h-4 w-4" />
					Simpan
				</button>
			</template>
		</Modal>

		<ConfirmDialog v-model="showDeleteConfirm" title="Hapus Sertifikasi?" confirmLabel="Hapus" cancelLabel="Batal" @confirm="confirmDelete" @cancel="cancelDelete">
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Apakah Anda yakin ingin menghapus sertifikasi
				<strong>{{ pendingDelete?.certificateNumber }}</strong>
				untuk produk
				<strong>{{ pendingDelete?.productName }}</strong>?
			</p>
		</ConfirmDialog>
	</section>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import PageHeader from "@/components/admin/PageHeader.vue";
import DataTable, {type Column} from "@/components/ui/DataTable.vue";
import Modal from "@/components/ui/Modal.vue";
import {useRbacStore, type RbacPermission} from "@/stores/rbac";
import {KeyRound as KeyIcon, Plus, Save} from "lucide-vue-next";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const rbacStore = useRbacStore();
const {permissions, loadingPermissions, permissionsError} = storeToRefs(rbacStore);

const auth = await requirePermission("rbac.permissions.read");
const canCreatePermission = computed(() => auth.hasPermission("rbac.permissions.write"));

await rbacStore.fetchPermissions();

const search = ref("");
const page = ref(1);
const pageSize = ref(10);

const showModal = ref(false);
const permKey = ref("");
const description = ref("");
const formError = ref("");
const saving = ref(false);

const columns: Column[] = [
	{key: "key", label: "Key", sortable: true},
	{key: "description", label: "Description"},
	{key: "created_at", label: "Created"},
];

const rows = computed(() => {
	if (!search.value.trim()) return permissions.value;
	const term = search.value.toLowerCase();
	return permissions.value.filter((p) => p.key.toLowerCase().includes(term) || (p.description ?? "").toLowerCase().includes(term));
});

function formatDate(iso?: string) {
	if (!iso) return "-";
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function openModal() {
	if (!canCreatePermission.value) return;
	permKey.value = "";
	description.value = "";
	formError.value = "";
	showModal.value = true;
}

async function savePermission() {
	formError.value = "";
	if (!canCreatePermission.value) {
		formError.value = "You do not have permission to create permissions.";
		return;
	}
	const key = permKey.value.trim();
	if (!key) {
		formError.value = "Permission key is required.";
		return;
	}
	saving.value = true;
	try {
		await rbacStore.createPermission(key, description.value);
		showModal.value = false;
	} catch (err: any) {
		formError.value = err?.message ?? "Failed to create permission.";
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<section>
		<PageHeader
			title="Permissions"
			description="Manage permission keys"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Permissions', current: true},
			]"
			:icon="KeyIcon"
		>
			<template #actions>
				<button v-if="canCreatePermission" type="button" @click="openModal" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Plus class="w-4 h-4" /> New Permission
				</button>
			</template>
		</PageHeader>

		<div v-if="permissionsError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
			{{ permissionsError }}
		</div>

		<DataTable
			:columns="columns"
			:rows="rows"
			v-model:search="search"
			v-model:page="page"
			v-model:pageSize="pageSize"
			:externalSort="false"
			:loading="loadingPermissions"
			rowKey="id"
		>
			<template #cell-created_at="{value}">{{ formatDate(value) }}</template>
		</DataTable>

		<Modal v-model="showModal" title="New Permission">
			<form class="grid gap-4" @submit.prevent="savePermission">
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Key</label>
					<input v-model="permKey" type="text" required placeholder="e.g., rbac.roles.read" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
					<textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
				<p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
			</form>
			<template #footer>
				<button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showModal = false">
					Cancel
				</button>
				<button type="button" :disabled="saving || !canCreatePermission" @click="savePermission" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Save class="w-4 h-4" /> Save
				</button>
			</template>
		</Modal>
	</section>
</template>

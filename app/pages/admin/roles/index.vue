<script setup lang="ts">
import {computed, ref} from "vue";
import PageHeader from "@/components/admin/PageHeader.vue";
import DataTable, {type Column} from "@/components/ui/DataTable.vue";
import Modal from "@/components/ui/Modal.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import {roles as allRoles, type Role} from "@/data/roles";
import {users as allUsers} from "@/data/users";
import {Shield as ShieldIcon, Plus, Edit, Trash2, Save} from "lucide-vue-next";

definePageMeta({layout: "admin"});

const search = ref("");
const page = ref(1);
const pageSize = ref(10);

// modal + form state
const showRoleModal = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const name = ref("");
const description = ref("");
// permissions are now edited on a dedicated page

function resetForm() {
	name.value = "";
	description.value = "";
}
function openCreate() {
	resetForm();
	isEditing.value = false;
	editingId.value = null;
	showRoleModal.value = true;
}
function openEdit(r: Role) {
	isEditing.value = true;
	editingId.value = r.id;
	name.value = r.name;
	description.value = r.description || "";
	showRoleModal.value = true;
}
function saveRole() {
	if (isEditing.value && editingId.value != null) {
		const r = allRoles.find((x) => x.id === editingId.value);
		if (r) {
			r.name = name.value;
			r.description = description.value;
		}
	} else {
		const id = Math.max(0, ...allRoles.map((r) => r.id)) + 1;
		const r: Role = {id, name: name.value, description: description.value, permissionIds: []};
		allRoles.push(r);
	}
	showRoleModal.value = false;
}

const columns: Column[] = [
	{key: "name", label: "Role", sortable: true},
	{key: "description", label: "Description"},
	{key: "permCount", label: "Permissions", align: "center", width: "120px"},
	{key: "userCount", label: "Users", align: "center", width: "100px"},
	{key: "actions", label: "Actions", align: "right", width: "120px"},
];

const rows = computed(() =>
	allRoles.map((r) => ({
		...r,
		permCount: r.permissionIds.length,
		userCount: allUsers.filter((u) => u.roleIds.includes(r.id)).length,
	}))
);

// Delete confirmation state
const showDelete = ref(false);
const deleting = ref<Role | null>(null);
function askDelete(r: Role) {
    deleting.value = r;
    showDelete.value = true;
}
function confirmDelete() {
	const r = deleting.value as Role | null;
	if (!r) return;
	const i = allRoles.findIndex((x) => x.id === r.id);
	if (i >= 0) allRoles.splice(i, 1);
    deleting.value = null;
}

// Derived confirm dialog texts (avoid complex template expressions)
const deleteTitle = computed(() => (deleting.value ? 'Delete Role' : 'Delete'));
const deleteMessage = computed(() =>
    deleting.value
        ? `Are you sure you want to delete role "${deleting.value.name}"? This cannot be undone.`
        : ''
);
</script>

<template>
	<section>
		<PageHeader
			title="Roles"
			description="Define roles and manage permission sets"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', current: true},
			]"
			:icon="ShieldIcon"
		>
			<template #actions>
				<button type="button" @click="openCreate" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"><Plus class="w-4 h-4" /> New Role</button>
			</template>
		</PageHeader>

		<DataTable :columns="columns" :rows="rows" v-model:search="search" v-model:page="page" v-model:pageSize="pageSize" :externalSort="false" rowKey="id">
			<template #cell-actions="{row}">
				<div class="flex items-center justify-end gap-2">
					<NuxtLink :to="`/admin/roles/${row.id}`" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"> <Edit class="w-4 h-4" /> Edit </NuxtLink>
					<NuxtLink :to="`/admin/roles/${row.id}/permissions`" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"> Permissions </NuxtLink>
					<button class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30" @click="askDelete(row)"><Trash2 class="w-4 h-4" /> Delete</button>
				</div>
			</template>
		</DataTable>

		<!-- Modal: Create/Edit Role -->
		<Modal v-model="showRoleModal" :title="isEditing ? 'Edit Role' : 'New Role'">
			<form class="grid gap-5" @submit.prevent="saveRole">
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
					<input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
					<textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
			</form>
			<template #footer>
				<button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showRoleModal = false">Cancel</button>
				<button type="button" @click="saveRole" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"><Save class="w-4 h-4" /> Save</button>
			</template>
		</Modal>

		<!-- Confirm Delete -->
		<ConfirmDialog
		  v-model="showDelete"
		  :title="deleteTitle"
		  :message="deleteMessage"
		  confirm-label="Delete"
		  cancel-label="Cancel"
		  @confirm="confirmDelete"
		/>
	</section>
</template>

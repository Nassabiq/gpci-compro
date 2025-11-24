<script setup lang="ts">
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import PageHeader from "@/components/admin/PageHeader.vue";
import DataTable, {type Column} from "@/components/ui/DataTable.vue";
import Modal from "@/components/ui/Modal.vue";
import {useRbacStore, type RbacRole} from "@/stores/rbac";
import {useUsersStore} from "@/stores/users";
import {Shield as ShieldIcon, Plus, Save} from "lucide-vue-next";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const rbacStore = useRbacStore();
const usersStore = useUsersStore();

const auth = await requirePermission("rbac.roles.read");
const canCreateRole = computed(() => auth.hasPermission("rbac.roles.write"));
const canAssignPermissions = computed(() => auth.hasPermission("rbac.roles.assign"));
const canReadUsers = computed(() => auth.hasPermission("users.read"));
const canReadPermissions = computed(() => auth.hasPermission("rbac.permissions.read"));

const {roles, loadingRoles, rolesError} = storeToRefs(rbacStore);
const {items: users} = storeToRefs(usersStore);

const pendingFetch: Promise<unknown>[] = [rbacStore.fetchRoles()];
if (canReadUsers.value) pendingFetch.push(usersStore.fetch());
if (canReadPermissions.value) pendingFetch.push(rbacStore.fetchPermissions());
await Promise.allSettled(pendingFetch);

const search = ref("");
const page = ref(1);
const pageSize = ref(10);

const showRoleModal = ref(false);
const roleName = ref("");
const formError = ref("");
const saving = ref(false);

const columns = computed<Column[]>(() => {
	const base: Column[] = [
		{key: "name", label: "Role", sortable: true},
		{key: "userCount", label: "Users", align: "center", width: "100px"},
		{key: "created_at", label: "Created"},
	];
	if (canAssignPermissions.value) {
		base.push({key: "actions", label: "Actions", align: "right", width: "140px"});
	}
	return base;
});

const rows = computed(() => {
	const data = roles.value.map((role) => {
		const userCount = canReadUsers.value ? users.value.filter((u) => u.roles.includes(role.name)).length : null;
		return {...role, userCount};
	});
	if (!search.value.trim()) return data;
	const term = search.value.toLowerCase();
	return data.filter((row) => row.name.toLowerCase().includes(term));
});

function formatDate(iso?: string) {
	if (!iso) return "-";
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function openCreate() {
	if (!canCreateRole.value) return;
	roleName.value = "";
	formError.value = "";
	showRoleModal.value = true;
}

async function saveRole() {
	if (!canCreateRole.value) {
		formError.value = "You do not have permission to create roles.";
		return;
	}
	formError.value = "";
	const name = roleName.value.trim();
	if (!name) {
		formError.value = "Role name is required.";
		return;
	}
	saving.value = true;
	try {
		await rbacStore.createRole(name);
		showRoleModal.value = false;
		roleName.value = "";
	} catch (err: any) {
		formError.value = err?.message ?? "Failed to create role.";
	} finally {
		saving.value = false;
	}
}
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
			<button v-if="canCreateRole" type="button" @click="openCreate" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
				<Plus class="w-4 h-4" /> New Role
			</button>
		</template>
		</PageHeader>

		<div v-if="rolesError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
			{{ rolesError }}
		</div>

	<DataTable
		:columns="columns"
		:rows="rows"
		v-model:search="search"
		v-model:page="page"
		v-model:pageSize="pageSize"
		:externalSort="false"
		:loading="loadingRoles"
		rowKey="id"
	>
		<template #cell-userCount="{value}">{{ value ?? "—" }}</template>
		<template #cell-created_at="{value}">{{ formatDate(value) }}</template>
		<template v-if="canAssignPermissions" #cell-actions="{row}">
			<div class="flex items-center justify-end gap-2">
				<NuxtLink :to="`/admin/roles/${row.id}/permissions`" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
					Permissions
				</NuxtLink>
			</div>
		</template>
	</DataTable>

		<Modal v-model="showRoleModal" :title="'New Role'">
			<form class="grid gap-4" @submit.prevent="saveRole">
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
					<input v-model="roleName" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
				<p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
			</form>
			<template #footer>
				<button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showRoleModal = false">
					Cancel
				</button>
		<button type="button" :disabled="saving || !canCreateRole" @click="saveRole" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
			<Save class="w-4 h-4" /> Save
		</button>
			</template>
		</Modal>
	</section>
</template>

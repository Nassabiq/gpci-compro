<script setup lang="ts">
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import PageHeader from "@/components/admin/PageHeader.vue";
import DataTable, {type Column} from "@/components/ui/DataTable.vue";
import DropdownCheckbox from "@/components/ui/DropdownCheckbox.vue";
import Select from "@/components/ui/Select.vue";
import Modal from "@/components/ui/Modal.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import {useUsersStore, type UserRecord, type UserStatus} from "@/stores/users";
import {useRbacStore} from "@/stores/rbac";
import {Users as UsersIcon, Plus, Edit, Trash2, Save} from "lucide-vue-next";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const usersStore = useUsersStore();
const rbacStore = useRbacStore();

const auth = await requirePermission("users.read");
const canManageUsers = computed(() => auth.hasPermission("users.write"));
const canDeleteUsers = computed(() => auth.hasPermission("users.delete"));
const canReadRoles = computed(() => auth.hasPermission("rbac.roles.read"));
const canAssignRole = computed(() => auth.hasPermission("rbac.users.assign_role"));

const {items: users, pending: usersPending, error: usersError} = storeToRefs(usersStore);
const {roles} = storeToRefs(rbacStore);
const pendingFetch: Promise<unknown>[] = [usersStore.fetch()];
if (canReadRoles.value || canAssignRole.value) {
	pendingFetch.push(rbacStore.fetchRoles());
}
await Promise.allSettled(pendingFetch);

const search = ref("");
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref<UserStatus | "">("");
const roleFilter = ref<string[]>([]);

const showUserModal = ref(false);
const isEditing = ref(false);
const editingXid = ref<string | null>(null);
const name = ref("");
const email = ref("");
const status = ref<UserStatus>("active");
const roleName = ref<string | null>(null);
const password = ref("");
const confirmPassword = ref("");
const formError = ref("");

function resetForm() {
	name.value = "";
	email.value = "";
	status.value = "active";
	roleName.value = null;
	password.value = "";
	confirmPassword.value = "";
	formError.value = "";
}

function openCreate() {
	if (!canManageUsers.value) return;
	resetForm();
	isEditing.value = false;
	editingXid.value = null;
	showUserModal.value = true;
}

function openEdit(u: UserRecord) {
	if (!canManageUsers.value) return;
	resetForm();
	isEditing.value = true;
	editingXid.value = u.xid;
	name.value = u.name;
	email.value = u.email;
	status.value = u.status;
	roleName.value = u.roles[0] ?? null;
	showUserModal.value = true;
}

function validatePasswords() {
	if (!password.value && !confirmPassword.value) return true;
	if (password.value.length < 6) {
		formError.value = "Password must be at least 6 characters.";
		return false;
	}
	if (password.value !== confirmPassword.value) {
		formError.value = "Passwords do not match.";
		return false;
	}
	return true;
}

async function saveUser() {
	if (!canManageUsers.value) {
		formError.value = "You do not have permission to manage users.";
		return;
	}
	formError.value = "";
	if (!validatePasswords()) return;

	try {
		if (isEditing.value && editingXid.value) {
			await usersStore.update(editingXid.value, {
				name: name.value,
				email: email.value,
				status: status.value,
				role: roleName.value,
				password: password.value || undefined,
			});
		} else {
			if (!password.value) {
				formError.value = "Password is required for new users.";
				return;
			}
			await usersStore.create({
				name: name.value,
				email: email.value,
				password: password.value,
				status: status.value,
				role: roleName.value,
			});
		}
		showUserModal.value = false;
	} catch (err: any) {
		const message = err?.message ?? "Failed to save user";
		formError.value = message;
	}
}

const columns = computed<Column[]>(() => {
	const base: Column[] = [
		{key: "name", label: "Name", sortable: true},
		{key: "email", label: "Email", sortable: true},
		{key: "roles", label: "Roles"},
		{key: "status", label: "Status", sortable: true},
		{key: "createdAt", label: "Created", sortable: true},
	];
	if (canManageUsers.value || canDeleteUsers.value) {
		base.push({key: "actions", label: "Actions", align: "right", width: "160px"});
	}
	return base;
});

const roleOptions = computed(() => (canReadRoles.value || canAssignRole.value ? roles.value.map((r) => r.name) : []));

const rows = computed(() => {
	let data = users.value.map((u) => ({
		...u,
		roles: u.roles.join(", "),
		createdAt: u.createdAt,
	}));

	if (statusFilter.value) data = data.filter((u) => u.status === statusFilter.value);
	if (roleFilter.value.length) {
		data = data.filter((u) => u.roles.some((role) => roleFilter.value.includes(role)));
	}
	if (search.value.trim()) {
		const q = search.value.toLowerCase();
		data = data.filter((u) => JSON.stringify(u).toLowerCase().includes(q));
	}
	return data;
});

function resetFilters() {
	statusFilter.value = "";
	roleFilter.value = [];
}

function formatDate(iso?: string) {
	if (!iso) return "-";
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

const showDelete = ref(false);
const deleting = ref<UserRecord | null>(null);

function askDelete(u: UserRecord) {
	if (!canDeleteUsers.value) return;
	deleting.value = u;
	showDelete.value = true;
}

async function confirmDelete() {
	const u = deleting.value;
	if (!u) return;
	if (!canDeleteUsers.value) {
		formError.value = "You do not have permission to delete users.";
		return;
	}
	try {
		await usersStore.remove(u.xid);
	} catch (err: any) {
		const message = err?.message ?? "Failed to delete user";
		formError.value = message;
	}
	deleting.value = null;
}

const deleteTitle = computed(() => (deleting.value ? "Delete User" : "Delete"));
const deleteMessage = computed(() =>
	deleting.value ? `Are you sure you want to delete user "${deleting.value.name}"? This cannot be undone.` : "",
);
</script>

<template>
  <section>
		<PageHeader
			title="Users"
			description="Manage users, statuses, and role assignments"
			:breadcrumbs="[
				{ label: 'Admin', to: '/admin' },
				{ label: 'Users', current: true },
			]"
			:icon="UsersIcon"
		>
			<template #actions>
				<button v-if="canManageUsers" type="button" @click="openCreate" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Plus class="w-4 h-4" /> New User
				</button>
			</template>
		</PageHeader>

    <div v-if="usersError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
      {{ usersError }}
    </div>

		<DataTable
			:columns="columns"
			:rows="rows"
			v-model:search="search"
			v-model:page="page"
			v-model:pageSize="pageSize"
			:externalSort="false"
			:loading="usersPending"
			rowKey="xid"
		>
			<template #filters>
				<div class="flex flex-wrap gap-3 items-center">
					<Select :options="['active','inactive']" v-model="statusFilter" placeholder="All statuses" widthClass="sm:w-48" />
					<DropdownCheckbox v-if="roleOptions.length" v-model="roleFilter" :options="roleOptions" placeholder="Filter roles" />
					<button type="button" class="text-sm text-emerald-600 hover:underline dark:text-emerald-400" @click="resetFilters">Reset</button>
				</div>
			</template>

      <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
      <template #cell-status="{ value }">
        <span :class="[
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          value === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100' :
          value === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-200' :
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100']
        ">{{ value }}</span>
      </template>
			<template v-if="canManageUsers || canDeleteUsers" #cell-actions="{ row }">
				<div class="flex items-center justify-end gap-2">
					<button v-if="canManageUsers" @click="openEdit(row)" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
						<Edit class="w-4 h-4" /> Edit
					</button>
					<button v-if="canDeleteUsers" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30" @click="askDelete(row)">
						<Trash2 class="w-4 h-4" /> Delete
					</button>
				</div>
			</template>
		</DataTable>

    <!-- Modal: Create/Edit User -->
		<Modal v-model="showUserModal" :title="isEditing ? 'Edit User' : 'New User'">
			<form class="grid gap-5" @submit.prevent="saveUser">
				<div class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
					<input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
				</div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ isEditing ? 'New Password' : 'Password' }}</label>
          <input v-model="password" :required="!isEditing" minlength="6" type="password" :placeholder="isEditing ? 'Leave blank to keep current' : ''" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ isEditing ? 'Confirm New Password' : 'Confirm Password' }}</label>
          <input v-model="confirmPassword" :required="!isEditing" minlength="6" type="password" :placeholder="isEditing ? 'Leave blank to keep current' : ''" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
          <select v-model="status" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
				<div v-if="canAssignRole && roleOptions.length" class="grid gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
					<select v-model="roleName" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
						<option :value="null">Select role</option>
						<option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
					</select>
				</div>
				<p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
			</form>
			<template #footer>
				<button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showUserModal=false">Cancel</button>
				<button type="button" :disabled="!canManageUsers" @click="saveUser" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Save class="w-4 h-4" /> Save
				</button>
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

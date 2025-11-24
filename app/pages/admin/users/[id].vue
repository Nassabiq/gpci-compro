<script setup lang="ts">
import {computed, ref} from "vue";
import {useRouter, useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Users as UsersIcon, Save} from "lucide-vue-next";
import {useUsersStore, type UserRecord, type UserStatus} from "@/stores/users";
import {useRbacStore} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const router = useRouter();
const route = useRoute();
const usersStore = useUsersStore();
const rbacStore = useRbacStore();

const auth = await requirePermission(["users.read", "users.write"], {mode: "all"});
const canAssignRole = computed(() => auth.hasPermission("rbac.users.assign_role"));
const canReadRoles = computed(() => auth.hasPermission("rbac.roles.read"));

const pendingFetch: Promise<unknown>[] = [usersStore.fetch()];
if (canAssignRole.value || canReadRoles.value) {
	pendingFetch.push(rbacStore.fetchRoles());
}
await Promise.allSettled(pendingFetch);

const paramId = computed(() => String(route.params.id));
const user = computed<UserRecord | null>(() => usersStore.items.find((u) => u.xid === paramId.value) ?? null);

const name = ref(user.value?.name ?? "");
const email = ref(user.value?.email ?? "");
const status = ref<UserStatus>(user.value?.status ?? "active");
const roleName = ref<string | null>(user.value?.roles[0] ?? null);
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const saving = ref(false);

const roles = computed(() => (canAssignRole.value || canReadRoles.value ? rbacStore.roles : []));

function validate() {
	error.value = "";
	if (!user.value) {
		error.value = "User not found.";
		return false;
	}
	if (newPassword.value || confirmPassword.value) {
		if (newPassword.value.length < 6) {
			error.value = "Password must be at least 6 characters.";
			return false;
		}
		if (newPassword.value !== confirmPassword.value) {
			error.value = "Passwords do not match.";
			return false;
		}
	}
	return true;
}

async function onSubmit() {
	if (!validate() || !user.value) return;
	if (!auth.hasPermission("users.write")) {
		error.value = "You do not have permission to update users.";
		return;
	}
	saving.value = true;
	try {
		await usersStore.update(user.value.xid, {
			name: name.value,
			email: email.value,
			status: status.value,
			role: roleName.value,
			password: newPassword.value || undefined,
		});
		await router.push("/admin/users");
	} catch (err: any) {
		error.value = err?.message ?? "Failed to update user.";
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<section>
		<PageHeader
			:title="user ? user.name : 'User'"
			description="Edit user details and role assignments"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Users', to: '/admin/users'},
				{label: user ? user.email : 'User', current: true},
			]"
			:icon="UsersIcon"
		/>

		<div v-if="!user" class="text-gray-600 dark:text-gray-300">User not found.</div>
		<form v-else class="grid gap-5 max-w-3xl" @submit.prevent="onSubmit">
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
				<input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
				<input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
				<select v-model="status" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
					<option value="active">active</option>
					<option value="inactive">inactive</option>
				</select>
			</div>

			<div v-if="canAssignRole && roles.length" class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
				<select v-model="roleName" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
					<option :value="null">Select role</option>
					<option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
				</select>
			</div>

			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Set New Password</label>
				<input v-model="newPassword" type="password" minlength="6" placeholder="Leave blank to keep current" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
				<input v-model="confirmPassword" type="password" minlength="6" placeholder="Leave blank to keep current" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

			<div class="flex gap-2">
				<button type="submit" :disabled="saving || !auth.hasPermission('users.write')" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Save class="w-4 h-4" /> Save
				</button>
				<NuxtLink to="/admin/users" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
					Cancel
				</NuxtLink>
			</div>
		</form>
	</section>
</template>

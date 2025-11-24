<script setup lang="ts">
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Users as UsersIcon, Save} from "lucide-vue-next";
import {useUsersStore, type UserStatus} from "@/stores/users";
import {useRbacStore} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const router = useRouter();
const usersStore = useUsersStore();
const rbacStore = useRbacStore();

const auth = await requirePermission("users.write");
const canReadRoles = computed(() => auth.hasPermission("rbac.roles.read"));
const canAssignRole = computed(() => auth.hasPermission("rbac.users.assign_role"));

if (canReadRoles.value || canAssignRole.value) {
	await rbacStore.fetchRoles();
}

const roles = computed(() => (canReadRoles.value || canAssignRole.value ? rbacStore.roles : []));

const name = ref("");
const email = ref("");
const status = ref<UserStatus>("active");
const roleName = ref<string | null>(null);
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const saving = ref(false);

async function onSubmit() {
	error.value = "";
	if (!auth.hasPermission("users.write")) {
		error.value = "You do not have permission to create users.";
		return;
	}
	if (password.value.length < 6) {
		error.value = "Password must be at least 6 characters.";
		return;
	}
	if (password.value !== confirmPassword.value) {
		error.value = "Passwords do not match.";
		return;
	}
	saving.value = true;
	try {
		await usersStore.create({
			name: name.value,
			email: email.value,
			password: password.value,
			status: status.value,
			role: roleName.value,
		});
		await router.push("/admin/users");
	} catch (err: any) {
		error.value = err?.message ?? "Failed to create user.";
	} finally {
		saving.value = false;
	}
}
</script>

<template>
  <section>
    <PageHeader
      title="New User"
      description="Create a new user and assign roles"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin' },
        { label: 'Users', to: '/admin/users' },
        { label: 'New', current: true },
      ]"
      :icon="UsersIcon"
    />

    <form class="grid gap-5 max-w-3xl" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
        <input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
        <input v-model="password" type="password" required minlength="6" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
        <input v-model="confirmPassword" type="password" required minlength="6" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
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

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-2">
        <button type="submit" :disabled="saving || !auth.hasPermission('users.write')" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Save class="w-4 h-4" /> Save
        </button>
        <NuxtLink to="/admin/users" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Cancel</NuxtLink>
      </div>
    </form>
  </section>
</template>

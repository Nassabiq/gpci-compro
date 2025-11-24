<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Shield as ShieldIcon, Save} from "lucide-vue-next";
import {useRbacStore} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const router = useRouter();
const rbacStore = useRbacStore();
const auth = await requirePermission("rbac.roles.write");

const name = ref("");
const error = ref("");
const saving = ref(false);

async function onSubmit() {
	error.value = "";
	if (!auth.hasPermission("rbac.roles.write")) {
		error.value = "You do not have permission to create roles.";
		return;
	}
	const value = name.value.trim();
	if (!value) {
		error.value = "Role name is required.";
		return;
	}
	saving.value = true;
	try {
		await rbacStore.createRole(value);
		await router.push("/admin/roles");
	} catch (err: any) {
		error.value = err?.message ?? "Failed to create role.";
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<section>
		<PageHeader
			title="New Role"
			description="Create a new role and assign permissions afterwards"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: 'New', current: true},
			]"
			:icon="ShieldIcon"
		/>

		<form class="grid gap-5 max-w-xl" @submit.prevent="onSubmit">
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
				<input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<p class="text-xs text-gray-500 dark:text-gray-400">
				Use the permissions page to grant capabilities after creating the role.
			</p>

			<p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

			<div class="flex gap-2">
		<button type="submit" :disabled="saving || !auth.hasPermission('rbac.roles.write')" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Save class="w-4 h-4" /> Save
				</button>
				<NuxtLink to="/admin/roles" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
					Cancel
				</NuxtLink>
			</div>
		</form>
	</section>
</template>

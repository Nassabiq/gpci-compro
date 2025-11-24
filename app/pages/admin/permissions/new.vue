<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {KeyRound as KeyIcon, Save} from "lucide-vue-next";
import {useRbacStore} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const router = useRouter();
const rbacStore = useRbacStore();
const auth = await requirePermission("rbac.permissions.write");

const key = ref("");
const description = ref("");
const error = ref("");
const saving = ref(false);

async function onSubmit() {
	error.value = "";
	if (!auth.hasPermission("rbac.permissions.write")) {
		error.value = "You do not have permission to create permissions.";
		return;
	}
	const keyValue = key.value.trim();
	if (!keyValue) {
		error.value = "Permission key is required.";
		return;
	}
	saving.value = true;
	try {
		await rbacStore.createPermission(keyValue, description.value);
		await router.push("/admin/permissions");
	} catch (err: any) {
		error.value = err?.message ?? "Failed to create permission.";
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<section>
		<PageHeader
			title="New Permission"
			description="Create a new permission key"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Permissions', to: '/admin/permissions'},
				{label: 'New', current: true},
			]"
			:icon="KeyIcon"
		/>

		<form class="grid gap-5 max-w-xl" @submit.prevent="onSubmit">
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Key</label>
				<input v-model="key" type="text" required placeholder="e.g., rbac.roles.read" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
				<textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

			<div class="flex gap-2">
				<button type="submit" :disabled="saving || !auth.hasPermission('rbac.permissions.write')" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
					<Save class="w-4 h-4" /> Save
				</button>
				<NuxtLink to="/admin/permissions" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
					Cancel
				</NuxtLink>
			</div>
		</form>
	</section>
</template>

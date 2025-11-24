<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Shield as ShieldIcon} from "lucide-vue-next";
import {useRbacStore, type RbacRole} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const route = useRoute();
const rbacStore = useRbacStore();

const auth = await requirePermission("rbac.roles.read");
const canAssignPermissions = computed(() => auth.hasPermission("rbac.roles.assign"));

await rbacStore.fetchRoles();

const roleId = computed(() => Number(route.params.id));
const role = computed<RbacRole | undefined>(() => rbacStore.roles.find((r) => r.id === roleId.value));
</script>

<template>
	<section>
		<PageHeader
			:title="role ? role.name : 'Role'"
			description="Role information"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: role ? role.name : 'Role', current: true},
			]"
			:icon="ShieldIcon"
		>
			<template #actions>
				<NuxtLink v-if="role && canAssignPermissions" :to="`/admin/roles/${role.id}/permissions`" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
					Manage Permissions
				</NuxtLink>
			</template>
		</PageHeader>

		<div v-if="!role" class="text-gray-600 dark:text-gray-300">Role not found.</div>
		<div v-else class="grid gap-4 max-w-xl rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Name</div>
				<div class="text-base font-medium">{{ role.name }}</div>
			</div>
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Created At</div>
				<div>{{ role.created_at ? new Date(role.created_at).toLocaleString() : "-" }}</div>
			</div>
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Updated At</div>
				<div>{{ role.updated_at ? new Date(role.updated_at).toLocaleString() : "-" }}</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {KeyRound as KeyIcon} from "lucide-vue-next";
import {useRbacStore, type RbacPermission} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const route = useRoute();
const rbacStore = useRbacStore();

await requirePermission("rbac.permissions.read");

await rbacStore.fetchPermissions();

const permissionId = computed(() => Number(route.params.id));
const permission = computed<RbacPermission | undefined>(() => rbacStore.permissions.find((p) => p.id === permissionId.value));
</script>

<template>
	<section>
		<PageHeader
			:title="permission ? permission.key : 'Permission'"
			description="Permission details"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Permissions', to: '/admin/permissions'},
				{label: permission ? permission.key : 'Permission', current: true},
			]"
			:icon="KeyIcon"
		/>

		<div v-if="!permission" class="text-gray-600 dark:text-gray-300">Permission not found.</div>
		<div v-else class="grid gap-4 max-w-xl rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Key</div>
				<div class="text-base font-medium">{{ permission.key }}</div>
			</div>
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Description</div>
				<div>{{ permission.description ?? '-' }}</div>
			</div>
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Created At</div>
				<div>{{ permission.created_at ? new Date(permission.created_at).toLocaleString() : '-' }}</div>
			</div>
			<div>
				<div class="text-xs uppercase text-gray-500 dark:text-gray-400">Updated At</div>
				<div>{{ permission.updated_at ? new Date(permission.updated_at).toLocaleString() : '-' }}</div>
			</div>
		</div>
	</section>
</template>

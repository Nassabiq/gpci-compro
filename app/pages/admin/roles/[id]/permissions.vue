<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {useRbacStore, type RbacPermission, type RbacRole} from "@/stores/rbac";
import {requirePermission} from "@/composables/usePermissionGuard";

definePageMeta({layout: "admin"});

const route = useRoute();
const rbacStore = useRbacStore();

const auth = await requirePermission(["rbac.roles.assign", "rbac.permissions.read"], {mode: "all"});

await Promise.allSettled([rbacStore.fetchRoles(), rbacStore.fetchPermissions()]);

const roleId = computed(() => Number(route.params.id));
const role = computed<RbacRole | undefined>(() => rbacStore.roles.find((r) => r.id === roleId.value));
const permissions = computed<RbacPermission[]>(() =>
	[...rbacStore.permissions].sort((a, b) => a.key.localeCompare(b.key)),
);

const assigningKey = ref<string | null>(null);
const assigned = ref(new Set<string>());
const message = ref("");

async function assign(key: string) {
	if (!role.value) return;
	if (!auth.hasPermission("rbac.roles.assign")) {
		message.value = "You do not have permission to assign permissions.";
		return;
	}
	assigningKey.value = key;
	message.value = "";
	try {
		await rbacStore.assignPermissionToRole(role.value.name, key);
		assigned.value.add(key);
		message.value = `Permission ${key} assigned to ${role.value.name}.`;
	} catch (err: any) {
		message.value = err?.message ?? "Failed to assign permission.";
	} finally {
		assigningKey.value = null;
	}
}
</script>

<template>
	<section>
		<PageHeader
			:title="role ? `Permissions — ${role.name}` : 'Role Permissions'"
			description="Assign permissions to the selected role"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: role ? role.name : 'Role', current: true},
			]"
		/>

		<div v-if="!role" class="text-gray-600 dark:text-gray-300">Role not found.</div>
		<div v-else class="space-y-4 max-w-full">
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Backend currently returns permissions without assignment metadata. Newly assigned items are tracked for this session.
			</p>

			<div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
				{{ message }}
			</div>

			<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
				<table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
					<thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60">
						<tr>
							<th class="px-4 py-3 w-[45%]">Permission</th>
							<th class="px-4 py-3">Key</th>
							<th class="px-4 py-3 text-center w-[160px]">Status</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="perm in permissions" :key="perm.id" class="border-b border-gray-200 dark:border-gray-700">
							<td class="px-4 py-2.5">
								<div class="font-medium">{{ perm.key }}</div>
								<div v-if="perm.description" class="text-xs text-gray-500 dark:text-gray-400">{{ perm.description }}</div>
							</td>
							<td class="px-4 py-2.5 align-top text-gray-600 dark:text-gray-400">{{ perm.key }}</td>
							<td class="px-4 py-2.5 text-center">
					<button
						type="button"
						:disabled="assigningKey === perm.key || !auth.hasPermission('rbac.roles.assign')"
						class="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
						@click="assign(perm.key)"
					>
									<span v-if="assigningKey === perm.key" class="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-r-transparent" />
									<span>{{ assigned.has(perm.key) ? "Assigned" : "Assign" }}</span>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>

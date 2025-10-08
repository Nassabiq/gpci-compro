<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {findRole, type Role} from "@/data/roles";
import {permissions as allPerms} from "@/data/permissions";

definePageMeta({layout: "admin"});

const route = useRoute();
const roleId = computed(() => Number(route.params.id));
const role = computed<Role | undefined>(() => findRole(roleId.value));

// Convenience Set for quick membership checks
const rolePerms = computed(() => new Set(role.value?.permissionIds ?? []));

function togglePermission(permId: number, checked: boolean) {
	if (!role.value) return;
	const s = new Set(role.value.permissionIds);
	checked ? s.add(permId) : s.delete(permId);
	role.value.permissionIds = Array.from(s);
}

// Optional: sort by name for stable display
const perms = computed(() => [...allPerms].sort((a, b) => a.name.localeCompare(b.name)));
</script>

<template>
	<section>
		<PageHeader
			:title="role ? `Permissions — ${role.name}` : 'Role Permissions'"
			description="Toggle individual permissions for this role"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: role ? role.name : 'Role', current: true},
			]"
		/>

		<div v-if="!role" class="text-gray-600 dark:text-gray-300">Role not found.</div>
		<div v-else class="space-y-4 max-w-full">
			<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
				<table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
					<thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60">
						<tr>
							<th class="px-4 py-3 w-[45%]">Permission</th>
							<th class="px-4 py-3">Key</th>
							<th class="px-4 py-3 text-center w-[120px]">Enabled</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="p in perms" :key="p.id" class="border-b border-gray-200 dark:border-gray-700">
							<td class="px-4 py-2.5">
								<div class="font-medium">{{ p.name }}</div>
								<div v-if="p.description" class="text-xs text-gray-500 dark:text-gray-400">{{ p.description }}</div>
							</td>
							<td class="px-4 py-2.5 align-top text-gray-600 dark:text-gray-400">{{ p.key }}</td>
							<td class="px-4 py-2.5 text-center">
								<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="rolePerms.has(p.id)" @change="togglePermission(p.id, ($event.target as HTMLInputElement).checked)" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>

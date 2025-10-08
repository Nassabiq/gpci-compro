<script setup lang="ts">
import {computed, ref} from "vue";
import {useRouter, useRoute} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Shield as ShieldIcon, Save} from "lucide-vue-next";
import {findRole, roles as allRoles, type Role} from "@/data/roles";
import {permissions as allPerms} from "@/data/permissions";
// permissions are managed on a dedicated matrix page

definePageMeta({layout: "admin"});

const router = useRouter();
const route = useRoute();

const id = computed(() => Number(route.params.id));
const role = computed(() => findRole(id.value));

const name = ref(role.value?.name ?? "");
const description = ref(role.value?.description ?? "");
// edit a local copy of permissions and apply on save
const editPermissionIds = ref<number[]>(role.value?.permissionIds ? [...role.value.permissionIds] : []);

function togglePermission(id: number, checked: boolean) {
	const s = new Set(editPermissionIds.value);
	checked ? s.add(id) : s.delete(id);
	editPermissionIds.value = Array.from(s);
}

function onSubmit() {
	const r = role.value;
	if (!r) return;
	r.name = name.value;
	r.description = description.value;
	r.permissionIds = editPermissionIds.value;
	router.push("/admin/roles");
}
</script>

<template>
	<section>
		<PageHeader
			:title="role ? role.name : 'Role'"
			description="Edit role details and permissions"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: role ? String(role.id) : 'Role', current: true},
			]"
			:icon="ShieldIcon"
		>
			<template #actions>
				<NuxtLink v-if="role" :to="`/admin/roles/${role.id}/permissions`" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Manage Permissions</NuxtLink>
			</template>
		</PageHeader>

		<div v-if="!role" class="text-gray-600 dark:text-gray-300">Role not found.</div>
		<form v-else class="grid gap-5 max-w-full" @submit.prevent="onSubmit">
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
				<input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
				<textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
			</div>

			<!-- Permissions -->
			<div class="grid gap-2">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</label>
				<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
					<table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
						<thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60">
							<tr>
								<th class="px-4 py-3 w-[45%]">Permission</th>
								<th class="px-4 py-3">Key</th>
								<th class="px-4 py-3 text-center w-[120px]">Enable</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="p in allPerms" :key="p.id" class="border-b border-gray-200 dark:border-gray-700">
								<td class="px-4 py-2.5">
									<div class="font-medium">{{ p.name }}</div>
									<div v-if="p.description" class="text-xs text-gray-500 dark:text-gray-400">{{ p.description }}</div>
								</td>
								<td class="px-4 py-2.5 align-top text-gray-600 dark:text-gray-400">{{ p.key }}</td>
								<td class="px-4 py-2.5 text-center">
									<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="editPermissionIds.includes(p.id)" @change="togglePermission(p.id, ($event.target as HTMLInputElement).checked)" />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="flex gap-2">
				<button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"><Save class="w-4 h-4" /> Save</button>
				<NuxtLink to="/admin/roles" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Cancel</NuxtLink>
			</div>
		</form>
	</section>
</template>

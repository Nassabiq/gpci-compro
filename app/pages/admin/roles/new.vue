<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import PageHeader from "@/components/admin/PageHeader.vue";
import {Shield as ShieldIcon, Save} from "lucide-vue-next";
import {roles as allRoles, type Role} from "@/data/roles";
import {permissions as allPerms} from "@/data/permissions";

definePageMeta({layout: "admin"});

const router = useRouter();

const name = ref("");
const description = ref("");
// inline permission selection during creation
const permissionIds = ref<number[]>([]);

// function togglePerm(id: number) {
//   const s = new Set(permissionIds.value)
//   s.has(id) ? s.delete(id) : s.add(id)
//   permissionIds.value = Array.from(s)
// }

function togglePermission(id: number, checked: boolean) {
	const s = new Set(permissionIds.value);
	checked ? s.add(id) : s.delete(id);
	permissionIds.value = Array.from(s);
}

function onSubmit() {
	const id = Math.max(0, ...allRoles.map((r) => r.id)) + 1;
	const r: Role = {id, name: name.value, description: description.value, permissionIds: permissionIds.value};
	allRoles.push(r);
	// go back to roles list after creation
	router.push(`/admin/roles`);
}
</script>

<template>
	<section>
		<PageHeader
			title="New Role"
			description="Create a new role and assign permissions"
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'Roles', to: '/admin/roles'},
				{label: 'New', current: true},
			]"
			:icon="ShieldIcon"
		/>

		<form class="grid gap-5 max-w-3xl" @submit.prevent="onSubmit">
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
									<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="permissionIds.includes(p.id)" @change="togglePermission(p.id, ($event.target as HTMLInputElement).checked)" />
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

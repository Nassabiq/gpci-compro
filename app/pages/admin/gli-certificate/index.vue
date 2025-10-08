<script setup lang="ts">
definePageMeta({layout: "admin"});

import {Home, BadgeCheck} from "lucide-vue-next";
import PageHeader from "~/components/admin/PageHeader.vue";
import DataTable, {type Column} from "~/components/ui/DataTable.vue";

const crumbs = [
	{label: "Home", to: "/admin", icon: Home},
	{label: "Users", to: "/admin/gli-certificate"},
];

const page = ref(1);
const pageSize = ref(10);
const search = ref("");
const sort = ref<{key: string | null; dir: "asc" | "desc"}>({key: null, dir: "asc"});

// columns
const columns: Column[] = [
	{key: "name", label: "Name", sortable: true},
	{key: "email", label: "Email"},
	{key: "role", label: "Role", sortable: true, align: "center"},
];

// mock data (anggap ini dari API hasil filter/pagination server)
const total = ref(42);
const rows = ref<any[]>([
	{id: 1, name: "Neil Sims", email: "neil@example.com", role: "Admin"},
	{id: 2, name: "Bonnie Green", email: "bonnie@example.com", role: "Editor"},
]);
</script>

<template>
	<section class="p-4">
		<PageHeader title="Sertifikat GLI" description="Kelola pengguna, peran, dan perizinan." :breadcrumbs="crumbs" :icon="BadgeCheck">
			<template #actions>
				<NuxtLink to="/admin/users/new" class="btn-primary">Tambah Sertifikasi</NuxtLink>
			</template>
			<template #extra>
				<!-- taruh tabs/filters di sini kalau perlu -->
			</template>
		</PageHeader>

		<DataTable :columns="columns" :rows="rows" :total="total" :page="page" :pageSize="pageSize" :search="search" :sort="sort" externalSort @update:page="page = $event" @update:pageSize="pageSize = $event" @update:search="search = $event" @update:sort="sort = $event">
			<!-- @apply-filters="" @reset-filters="" -->
			<!-- filter panel -->
			<template #filters>
				<div class="grid sm:grid-cols-3 gap-3">
					<input type="text" placeholder="Role..." class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2" />
					<input type="date" class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2" />
					<select class="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2">
						<option value="">Status</option>
						<option>Active</option>
						<option>Suspended</option>
					</select>
				</div>
			</template>

			<!-- contoh custom cell -->
			<template #cell-role="{value}">
				<span class="px-2 py-1 rounded text-xs" :class="value === 'Admin' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'">
					{{ value }}
				</span>
			</template>
		</DataTable>
		<div class="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
			<p class="text-gray-600 dark:text-gray-300">Belum ada konten di halaman ini.</p>
		</div>
	</section>
</template>

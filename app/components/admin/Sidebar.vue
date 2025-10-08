<script setup lang="ts">
import {useAdminNav} from "#imports";
const route = useRoute();

const sidebarOpen = useState<boolean>("adminSidebarOpen", () => false);
const collapsed = useState<boolean>("adminSidebarCollapsed", () => false);

const items = useAdminNav();

// ==== helper: active state untuk leaf ====
function isActive(path: string | undefined) {
	return route.path === path || route.path.startsWith(path + "/");
}

// ==== expandable helpers ====
const openMap = ref<Record<string, boolean>>({});
const keyOf = (item: any) => item.to || item.label;
const hasChildren = (item: any) => Array.isArray(item?.children) && item.children.length > 0;

function isBranchActive(item: any): boolean {
	if (!hasChildren(item)) return false;
	return item.children.some((c: any) => (c?.to ? isActive(c.to) : hasChildren(c) && isBranchActive(c)));
}

onMounted(() => {
	// buka otomatis group yang berisi route aktif
	items.forEach((it: any) => {
		if (hasChildren(it)) openMap.value[keyOf(it)] = isBranchActive(it);
	});
});

function toggleGroup(item: any) {
	const k = keyOf(item);
	openMap.value[k] = !openMap.value[k];
}
</script>

<template>
	<aside id="logo-sidebar" class="fixed top-0 left-0 z-40 h-screen pt-16 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-[transform,width] duration-200 sm:translate-x-0" :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full', collapsed ? 'w-20' : 'w-64']" style="width: var(--sidebar-w)" aria-label="Sidebar">
		<div class="h-full flex flex-col">
			<!-- Brand header -->
			<div class="h-20 -mt-16 sticky top-0 flex items-center border-b border-emerald-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur z-10 px-3">
				<NuxtLink to="/admin" class="brand-row flex items-center min-w-0 transition-all" :class="collapsed ? 'w-full justify-center gap-0' : 'gap-3'" :title="collapsed ? 'GPCI' : undefined" :aria-label="collapsed ? 'GPCI' : undefined">
					<img src="/img/gpci.png" alt="Logo" class="h-12 w-auto" />
					<span v-if="!collapsed" class="font-semibold text-lg tracking-wider truncate dark:text-white text-gray-700"> GPCI </span>
				</NuxtLink>
			</div>

			<!-- Scrollable nav -->
			<div class="flex-1 overflow-y-auto px-2 py-3">
				<ul class="space-y-1 font-medium">
					<li v-for="item in items" :key="keyOf(item)">
						<!-- ===== Leaf item (tanpa children) ===== -->
						<NuxtLink v-if="!hasChildren(item)" :to="item.to" class="group flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" :class="[isActive(item.to) ? 'bg-emerald-100 font-semibold text-emerald-700 pl-[calc(theme(spacing.2)+2px)] ' + 'dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-500 dark:pl-[calc(theme(spacing.2)+2px)]' : 'pl-2', collapsed ? '!pl-0 justify-center' : '']" :title="collapsed ? item.label : undefined" :aria-label="collapsed ? item.label : undefined" @click="sidebarOpen = false">
							<!-- Icon -->
							<component :is="item.icon" class="w-5 h-5 shrink-0 text-gray-500 group-hover:text-emerald-800 dark:text-gray-400 dark:group-hover:text-emerald-200" />
							<!-- Label -->
							<span v-if="!collapsed" class="flex-1 whitespace-nowrap">{{ item.label }}</span>
						</NuxtLink>

						<!-- ===== Group item (punya children) ===== -->
						<div v-else>
							<!-- Header Group -->
							<button type="button" class="cursor-pointer w-full flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" :class="[isBranchActive(item) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100' : '', collapsed ? 'justify-center' : '']" :title="collapsed ? item.label : undefined" :aria-expanded="!!openMap[keyOf(item)]" @click="collapsed ? null : toggleGroup(item)">
								<component :is="item.icon" class="w-5 h-5 shrink-0 text-gray-500 group-hover:text-emerald-800 dark:text-gray-400 dark:group-hover:text-emerald-200" />
								<span v-if="!collapsed" class="flex-1 text-left whitespace-nowrap">
									{{ item.label }}
								</span>
								<!-- chevron -->
								<svg v-if="!collapsed" class="w-4 h-4 ml-1 transition-transform" :class="openMap[keyOf(item)] ? 'rotate-90' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fill-rule="evenodd" clip-rule="evenodd" d="M7 5a1 1 0 0 1 1.707-.707l4 4a1 1 0 0 1 0 1.414l-4 4A1 1 0 0 1 7 12.586L10.586 9 7.707 6.121A1 1 0 0 1 7 5Z" />
								</svg>
							</button>

							<!-- Children -->
							<Transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-64" leave-from-class="opacity-100 max-h-64" leave-to-class="opacity-0 max-h-0">
								<ul v-show="!collapsed && openMap[keyOf(item)]" class="mt-1 pl-8 space-y-1">
									<li v-for="child in item.children" :key="keyOf(child)">
										<!-- leaf child -->
										<NuxtLink v-if="!hasChildren(child)" :to="child.to" class="group flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" :class="[isActive(child.to) ? 'bg-emerald-100 font-semibold text-emerald-700 pl-[calc(theme(spacing.2)+2px)] ' + 'dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-500 dark:pl-[calc(theme(spacing.2)+2px)]' : 'pl-2']" @click="sidebarOpen = false">
											<span class="block w-1.5 h-1.5 rounded-full bg-emerald-1000"></span>
											<span class="flex-1 whitespace-nowrap">{{ child.label }}</span>
										</NuxtLink>

										<!-- nested group (opsional): kalau child juga punya children -->
										<div v-else class="text-xs text-gray-500 dark:text-gray-400 px-2">{{ child.label }} (nested group placeholder)</div>
									</li>
								</ul>
							</Transition>
						</div>
					</li>
				</ul>
			</div>

			<!-- Footer controls (mobile close only) -->
			<div class="p-2 border-t border-gray-100 dark:border-gray-700 sm:hidden">
				<button class="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" aria-label="Close sidebar" @click="sidebarOpen = false">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18" />
						<path d="M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	</aside>
</template>

<style scoped>
/* Perpindahan ikon jadi halus */
.brand-row {
	transition: transform 320ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
/* Sedikit tunda pergeseran ikon agar label sempat mengecil */
@media (min-width: 640px) {
	.brand-row {
		transition-delay: 60ms;
	}
}
</style>

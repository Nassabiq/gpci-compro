<script setup lang="ts">
const sidebarOpen = useState<boolean>("adminSidebarOpen", () => false);
const collapsed = useState<boolean>("adminSidebarCollapsed", () => false);
const sidebarW = computed(() => (collapsed.value ? "5rem" : "16rem"));
</script>

<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900" :style="{'--sidebar-w': sidebarW}">
		<AdminNavbar />
		<div class="flex pt-16">
			<AdminSidebar />

			<!-- Mobile: ml-0; ≥sm: ml= --sidebar-w via util class -->
			<main class="w-full transition-all duration-200 ml-0 ml-sidebar">
				<div class="p-4">
					<div class="rounded-lg">
						<slot />
					</div>
				</div>
			</main>
		</div>

		<button v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-30 bg-black/40 sm:hidden" aria-label="Close sidebar overlay" />
	</div>
</template>

<style scoped>
/* Only apply margin-left at >= sm (640px) */
@media (min-width: 640px) {
	.ml-sidebar {
		margin-left: var(--sidebar-w);
	}
}
</style>

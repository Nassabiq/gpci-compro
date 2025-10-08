<script setup lang="ts">
const sidebarOpen = useState<boolean>('adminSidebarOpen', () => false)
const collapsed = useState<boolean>('adminSidebarCollapsed', () => false)
function toggleCollapsed() { collapsed.value = !collapsed.value }
const { isDark, toggleDark } = useDarkMode()

</script>

<template>
  <nav class="fixed top-0 z-40 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700
           transition-[padding] duration-200 pl-0 pl-sidebar">
    <div class="px-3 py-3 lg:px-5">
      <div class="flex items-center justify-between">
        <!-- Kiri: hamburger (mobile), tombol collapse (desktop), brand kecil (mobile only) -->
        <div class="flex items-center gap-2">
          <button type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-label="Open sidebar" @click="sidebarOpen = !sidebarOpen">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 1 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" />
            </svg>
          </button>

          <!-- Brand kecil hanya di mobile (karena brand utama ada di header sidebar) -->
          <NuxtLink to="/" class="flex items-center gap-2 sm:hidden">
            <img src="/img/gpci.png" class="h-7 w-auto" alt="Logo" />
            <span class="font-semibold text-base text-gray-900 dark:text-white">YourApp</span>
          </NuxtLink>

          <!-- Collapse toggle hanya desktop -->
          <button type="button" class="ml-1 hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" :aria-expanded="!collapsed" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="toggleCollapsed">
            <svg v-if="collapsed" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l-6-6 6-6" />
              <path d="M21 18l-6-6 6-6" />
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l6-6-6-6" />
              <path d="M3 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <!-- Kanan: actions & user -->
        <div class="flex items-center gap-3">
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDark()" :title="isDark ? 'Light mode' : 'Dark mode'">
            <!-- Sun (ketika dark) -->
            <svg v-if="isDark" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <!-- Moon (ketika light) -->
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <AdminUserMenu />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Only active at >= sm (640px) so mobile keeps pl-0 */
@media (min-width: 640px) {
  .pl-sidebar {
    padding-left: var(--sidebar-w);
  }
}
</style>

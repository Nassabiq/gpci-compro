<script setup lang="ts">
const open = ref(false)
const menu = ref<HTMLElement | null>(null)

function onOutside(e: MouseEvent) {
  if (!open.value) return
  if (menu.value && !menu.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('pointerdown', onOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside))
</script>

<template>
  <div class="relative" ref="menu">
    <button type="button" class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
      <span class="sr-only">Open user menu</span>
      <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo">
    </button>

    <div v-show="open" class="absolute right-0 mt-2 w-56 z-50 text-base bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600" role="menu">
      <div class="px-4 py-3">
        <p class="text-sm text-gray-900 dark:text-white">Neil Sims</p>
        <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300">neil.sims@flowbite.com</p>
      </div>
      <ul class="py-1">
        <li>
          <NuxtLink to="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" role="menuitem">Dashboard</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" role="menuitem">Settings</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin/earnings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" role="menuitem">Earnings</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600" role="menuitem">Sign out</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
<!-- src/layouts/landing.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <AppHeader :start-transparent="true" />
    <main class="pt-0">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

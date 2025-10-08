<!-- src/layouts/default.vue -->
<script setup lang="ts">
/* Layout default tidak butuh route watcher atau landing logic.
   Header tidak transparan, konten pakai container + top padding. */
</script>

<template>
    <div class="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <AppHeader :start-transparent="false" />

        <main class="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <slot />
        </main>

        <AppFooter />
    </div>
</template>

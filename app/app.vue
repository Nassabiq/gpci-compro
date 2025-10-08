<!-- src/app.vue -->
<script setup lang="ts">
const pageTransition = { name: 'page', mode: 'out-in' } as const
</script>

<template>
	<NuxtLayout>
		<NuxtPage :transition="pageTransition" />
	</NuxtLayout>
	<NuxtLoadingIndicator />
</template>

<style>
.page-enter-active,
.page-leave-active {
	transition: opacity .2s ease, transform .2s ease;
}

.page-enter-from,
.page-leave-to {
	opacity: 0;
	transform: translateY(6px);
}
</style>

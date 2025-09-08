<script setup lang="ts">
defineProps<{
	page: number;
	totalPages: number;
}>();

const emit = defineEmits<{
	(e: "change-page", value: number): void;
}>();
</script>

<template>
	<div class="mt-10 flex items-center justify-center gap-2">
		<button class="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50" :disabled="page <= 1" @click="emit('change-page', page - 1)">Prev</button>
		<span class="text-sm text-gray-600"> Page {{ page }} of {{ totalPages }} </span>
		<button class="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50" :disabled="page >= totalPages" @click="emit('change-page', page + 1)">Next</button>
	</div>
</template>

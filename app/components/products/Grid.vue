<script setup lang="ts">
import {Search} from "lucide-vue-next";
import Card from "./Card.vue";

defineProps<{
	products: any[];
	pending: boolean;
	error: string | null;
}>();

const emit = defineEmits<{
	(e: "clear-filters"): void;
}>();
</script>

<template>
	<div>
		<!-- Skeleton -->
		<div v-if="pending && !products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<div v-for="i in 6" :key="i" class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
				<div class="aspect-video bg-gray-200 animate-pulse" />
				<div class="p-6 space-y-3">
					<div class="h-6 w-1/2 bg-gray-200 animate-pulse rounded" />
					<div class="h-4 w-24 bg-gray-200 animate-pulse rounded" />
					<div class="h-4 w-full bg-gray-200 animate-pulse rounded" />
					<div class="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
					<div class="h-10 w-full bg-gray-200 animate-pulse rounded mt-4" />
				</div>
			</div>
		</div>

		<!-- Error -->
		<p v-if="error && !products.length" class="text-center text-red-600 mt-6">
			{{ error }}
		</p>

		<!-- Grid -->
		<div v-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<Card v-for="product in products" :key="product.id" :product="product" />
		</div>

		<!-- Empty -->
		<div v-if="!pending && !products.length" class="text-center py-16">
			<div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Search class="w-12 h-12 text-gray-400" />
			</div>
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
			<p class="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
			<Button variant="outline" @click="emit('clear-filters')">Clear Filters</Button>
		</div>
	</div>
</template>

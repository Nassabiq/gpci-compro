<script setup lang="ts">
import type {Component} from "vue";
import Breadcrumbs, {type Crumb} from "@/components/ui/Breadcrumbs.vue";

const props = defineProps<{
	title: string;
	description?: string;
	breadcrumbs?: Crumb[];
	icon?: Component;
}>();
</script>

<template>
	<header class="mb-6">
		<!-- Breadcrumbs -->
		<div v-if="breadcrumbs?.length" class="mb-2">
			<Breadcrumbs :items="breadcrumbs" />
		</div>

		<!-- Title row -->
		<div class="flex flex-wrap items-start gap-3 sm:items-center sm:justify-between">
			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<component v-if="icon" :is="icon" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
					<h1 class="text-xl sm:text-2xl font-semibold tracking-wider text-gray-900 dark:text-white">
						{{ title }}
					</h1>
				</div>
				<p v-if="description" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
					{{ description }}
				</p>
			</div>

			<!-- Actions slot -->
			<div class="flex items-center gap-2">
				<slot name="actions" />
			</div>
		</div>

		<!-- Extra slot: tabs/filters/alerts -->
		<div class="mt-4">
			<slot name="extra" />
		</div>
	</header>
</template>

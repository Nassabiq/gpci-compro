<script setup lang="ts">
import type {Component} from "vue";
import {Home as HomeIcon} from "lucide-vue-next";

export type Crumb = {
	label: string;
	to?: string;
	icon?: Component;
	current?: boolean;
};

const props = withDefaults(
	defineProps<{
		items: Crumb[];
		/** ganti ke 'hover:text-blue-600' kalau mau persis Flowbite biru */
		hoverClass?: string;
	}>(),
	{
		hoverClass: "hover:text-emerald-600",
	}
);

const baseLink = "inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-400";
const currentCls = "ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400";
const sepCls = "rtl:rotate-180 w-3 h-3 text-gray-400 mx-1";
</script>

<template>
	<nav class="flex" aria-label="Breadcrumb">
		<ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
			<li v-for="(item, i) in items" :key="i" class="inline-flex items-center" :aria-current="item.current ? 'page' : undefined">
				<!-- First -->
				<template v-if="i === 0">
					<NuxtLink v-if="item.to" :to="item.to" :class="[baseLink, hoverClass]">
						<component :is="item.icon ?? HomeIcon" class="w-3 h-3 me-2.5" aria-hidden="true" />
						<span>{{ item.label }}</span>
					</NuxtLink>
					<span v-else :class="baseLink">
						<component :is="item.icon ?? HomeIcon" class="w-3 h-3 me-2.5" aria-hidden="true" />
						<span>{{ item.label }}</span>
					</span>
				</template>

				<!-- Others -->
				<template v-else>
					<!-- Separator -->
					<svg :class="sepCls" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
					</svg>

					<!-- Link / current -->
					<NuxtLink v-if="item.to && !item.current" :to="item.to" :class="['ms-1', 'md:ms-2', baseLink, hoverClass]">
						<span>{{ item.label }}</span>
					</NuxtLink>
					<span v-else :class="currentCls">
						<span>{{ item.label }}</span>
					</span>
				</template>
			</li>
		</ol>
	</nav>
</template>

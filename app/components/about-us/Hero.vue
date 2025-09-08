<script setup lang="ts">
import {Award} from "lucide-vue-next";

type Stat = {value: string; label: string};

const props = withDefaults(
	defineProps<{
		title?: string;
		highlight?: string;
		subtitle?: string;
		imageSrc?: string;
		imageAlt?: string;
		stats?: Stat[];
	}>(),
	{
		title: "Pioneering Indonesia's",
		highlight: "Sustainable Future",
		subtitle: "Since 2015, GPCI has been at the forefront of environmental certification, transforming how Indonesian businesses approach sustainability and environmental responsibility.",
		imageSrc: "/img/about-us-landing.jpg", // ganti sesuai asetmu (public/)
		imageAlt: "Sustainable design illustration",
		stats: () => [
			{value: "10+", label: "Years of Excellence"},
			{value: "92+", label: "Companies Certified"},
			{value: "224+", label: "Trusted Brands"},
			{value: "33+", label: "Product Categories"},
		],
	}
);
</script>

<template>
	<!-- Hero Section -->
	<div>
		<section class="relative min-h-screen flex items-center justify-center overflow-hidden" aria-labelledby="about-hero-heading">
			<!-- overlays -->
			<div class="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
				<div class="absolute inset-0 bg-black/20" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
			</div>

			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" />
				<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<!-- content -->
			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<!-- text -->
					<div class="space-y-8">
						<div class="space-y-4">
							<h1 id="about-hero-heading" class="text-4xl md:text-6xl font-bold leading-tight">
								{{ title }}
								<span class="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
									{{ highlight }}
								</span>
							</h1>
							<p class="text-xl text-gray-200 leading-relaxed">
								{{ subtitle }}
							</p>
						</div>

						<div class="grid grid-cols-2 gap-6">
							<div v-for="(s, i) in props.stats" :key="i" class="text-center">
								<div class="text-3xl font-bold" :class="[i % 4 === 0 && 'text-green-400', i % 4 === 1 && 'text-emerald-400', i % 4 === 2 && 'text-teal-400', i % 4 === 3 && 'text-cyan-400']">
									{{ s.value }}
								</div>
								<div class="text-gray-300">{{ s.label }}</div>
							</div>
						</div>
					</div>

					<!-- image -->
					<div class="relative">
						<div class="aspect-square rounded-2xl overflow-hidden shadow-2xl">
							<img :src="imageSrc" :alt="imageAlt" class="w-full h-full object-cover" loading="lazy" decoding="async" />
						</div>
						<div class="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl" aria-hidden="true">
							<Award class="w-16 h-16 text-white" />
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

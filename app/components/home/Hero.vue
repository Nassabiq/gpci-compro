<script lang="ts" setup>
import { Star, ArrowRight, Award, Users, Building, Globe, Leaf, BadgeCheck } from "lucide-vue-next";

/* =========================
  Types
========================= */
type Stat = { icon: Component; value: string; label: string; colorClass: string };

/* =========================
  Data
========================= */
const stats: ReadonlyArray<Stat> = [
	{ icon: Award, value: "100+", label: "Companies Certified", colorClass: "text-yellow-300" },
	{ icon: BadgeCheck, value: "224+", label: "Brands Trusted", colorClass: "text-emerald-300" },
	{ icon: Leaf, value: "33+", label: "Product Categories", colorClass: "text-cyan-300" },
	{ icon: Globe, value: "10+", label: "Years of Excellence", colorClass: "text-teal-300" },
] as const;
</script>

<template>
	<div>
		<!-- ===== Hero Section ===== -->
		<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
				<div class="absolute inset-0 bg-black/20" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
			</div>

			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" />
				<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<div class="space-y-8">
					<!-- <div class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
						<Star class="w-5 h-5 text-yellow-400" />
						<span class="text-white font-medium">Indonesia's Premier Eco-Certification Authority</span>
					</div> -->

					<div class="space-y-4">
						<h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
							Elevate Your Brand with
							<!-- <span class="block bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Premium Sustainability</span> -->
						</h1>
						<p class="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">Join the exclusive circle of environmentally conscious brands. GPCI Green Label Indonesia certification transforms your products into symbols of luxury and environmental responsibility.</p>
					</div>

					<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
						<a href="https://client.gpci.or.id" target="_blank" class="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
							Start Certification Journey
							<ArrowRight class="ml-2 w-5 h-5" />
						</a>
						<NuxtLink to="/products" class="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl"> Explore Certified Products </NuxtLink>
					</div>

					<!-- Trust Indicators -->
					<div class="pt-12">
						<p class="text-gray-300 mb-6">Trusted by industry leaders since 2015</p>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
							<div v-for="(stat, i) in stats" :key="i" class="text-center">
								<div class="flex justify-center mb-2">
									<component :is="stat.icon" :class="['w-8 h-8', stat.colorClass]" />
								</div>
								<div class="text-3xl font-bold text-white">{{ stat.value }}</div>
								<div class="text-gray-300 text-sm">{{ stat.label }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Scroll Indicator -->
			<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
				<div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
					<div class="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
				</div>
			</div>
		</section>
	</div>
</template>

<style></style>

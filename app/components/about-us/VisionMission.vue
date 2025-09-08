<script setup lang="ts">
import {Target, CheckCircle, Eye, TrendingUp, Globe, Award} from "lucide-vue-next";

type Bullet = string;
type Goal = {icon?: "TrendingUp" | "Globe" | "Award"; text: string};

const props = withDefaults(
	defineProps<{
		missionTitle?: string;
		missionText?: string;
		missionBullets?: Bullet[];

		visionTitle?: string;
		visionText?: string;
		goalsTitle?: string;
		goals?: Goal[];
	}>(),
	{
		missionTitle: "Our Mission",
		missionText: "To encourage the entire Indonesian community to pay attention to environmental aspects in the use of building material products that are green and environmentally friendly. Through our rigorous assessment standards and rating tools compiled by professional experts, we issue the Green Label Indonesia certification that elevates brands to premium environmental status.",
		missionBullets: () => ["Promote sustainable building materials and products", "Establish rigorous environmental certification standards", "Support businesses in their sustainability journey"],

		visionTitle: "Our Vision",
		visionText: "To become Indonesia's most trusted and internationally recognized environmental certification body, leading the transformation towards a sustainable future where every product contributes to environmental preservation and premium brand positioning.",
		goalsTitle: "2030 Goals",
		goals: () => [
			{icon: "TrendingUp", text: "500+ Certified Companies"},
			{icon: "Globe", text: "Regional Expansion Across ASEAN"},
			{icon: "Award", text: "International Standard Recognition"},
		],
	}
);

const iconMap = {
	TrendingUp,
	Globe,
	Award,
} as const;
</script>

<template>
	<section class="py-24 bg-white" aria-labelledby="vision-mission-heading">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 id="vision-mission-heading" class="sr-only">Vision & Mission</h2>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
				<!-- Mission -->
				<div class="space-y-8">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
							<Target class="w-6 h-6 text-white" />
						</div>
						<h3 class="text-3xl font-bold text-gray-900">{{ missionTitle }}</h3>
					</div>

					<p class="text-lg text-gray-600 leading-relaxed">
						{{ missionText }}
					</p>

					<ul class="space-y-4">
						<li v-for="(b, i) in missionBullets" :key="i" class="flex items-start gap-3">
							<CheckCircle class="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
							<p class="text-gray-700">{{ b }}</p>
						</li>
					</ul>
				</div>

				<!-- Vision -->
				<div class="space-y-8">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
							<Eye class="w-6 h-6 text-white" />
						</div>
						<h3 class="text-3xl font-bold text-gray-900">{{ visionTitle }}</h3>
					</div>

					<p class="text-lg text-gray-600 leading-relaxed">
						{{ visionText }}
					</p>

					<div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
						<h4 class="text-xl font-semibold text-gray-900 mb-4">{{ goalsTitle }}</h4>
						<ul class="space-y-3">
							<li v-for="(g, i) in goals" :key="i" class="flex items-center gap-3">
								<component :is="iconMap[g.icon || 'TrendingUp']" class="w-5 h-5 text-blue-600" />
								<span class="text-gray-700">{{ g.text }}</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

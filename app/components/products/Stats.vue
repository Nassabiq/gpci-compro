<script setup lang="ts">
import {Building, Award, CheckCircle, Star} from "lucide-vue-next";
</script>

<template>
	<section class="py-16 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Certification Impact</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">Our certified products are making a significant impact on environmental sustainability across Indonesia.</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Building class="w-8 h-8 text-white" />
					</div>
					<div class="text-3xl font-bold text-gray-900 mb-2">92+</div>
					<div class="text-gray-600">Certified Companies</div>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Award class="w-8 h-8 text-white" />
					</div>
					<div class="text-3xl font-bold text-gray-900 mb-2">224+</div>
					<div class="text-gray-600">Trusted Brands</div>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<CheckCircle class="w-8 h-8 text-white" />
					</div>
					<div class="text-3xl font-bold text-gray-900 mb-2">275+</div>
					<div class="text-gray-600">Certified Products</div>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Star class="w-8 h-8 text-white" />
					</div>
					<div class="text-3xl font-bold text-gray-900 mb-2">4.8</div>
					<div class="text-gray-600">Average Rating</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
// Taruh file PNG/JPG-mu di /public/img/ecolabel/
const contentImage = "/img/principles.jpg";
// ↑ Ganti sesuai nama file gambar komposit kamu
</script>

<template>
	<section class="py-16 bg-white" aria-labelledby="ecolabel-heading">
		<div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Heading (satu-satunya teks) -->
			<h2 id="ecolabel-heading" class="text-center text-3xl md:text-4xl font-bold text-[#1e73be] mb-8">Key guiding principle - Ecolabel type I & II</h2>

			<!-- Seluruh konten di bawahnya adalah image -->
			<div class="flex justify-center">
				<figure class="w-full max-w-7xl rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
					<img :src="contentImage" alt="Key guiding principle - Ecolabel type I & II content" class="w-full h-auto object-contain" loading="lazy" decoding="async" />
				</figure>
			</div>
		</div>
	</section>
</template>

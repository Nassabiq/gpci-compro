<template>
	<div>
		<!-- ===== Team ===== -->
		<section id="team" class="py-24 bg-white">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-12">
					<h2 class="text-4xl font-bold text-gray-900">Leadership Team</h2>
					<p class="text-gray-600">Para penggerak utama di balik standar premium kami.</p>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
					<div v-for="(p, i) in team" :key="i" class="group text-center">
						<div class="aspect-square rounded-2xl overflow-hidden mb-4">
							<img :src="p.photo" :alt="p.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
						</div>
						<div class="font-semibold text-gray-900">{{ p.name }}</div>
						<div class="text-sm text-gray-600">{{ p.role }}</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
/* =========================
    Types
========================= */
type Team = {name: string; role: string; photo: string};

/* =========================
    Data
========================= */
const team: ReadonlyArray<Team> = [
	{name: "Dr. R. Anindya", role: "Chief Executive Officer", photo: "/images/team/1.jpg"},
	{name: "B. Mahendra", role: "Head of Certification", photo: "/images/team/2.jpg"},
	{name: "M. Aulia", role: "Lead Auditor", photo: "/images/team/3.jpg"},
	{name: "S. Pertiwi", role: "Partnership Director", photo: "/images/team/4.jpg"},
] as const;
</script>

<style></style>

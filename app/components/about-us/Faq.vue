<script lang="ts" setup>
/* =========================
    Types
========================= */
type FAQ = {q: string; a: string};

/* =========================
    Data
========================= */
const faqs: ReadonlyArray<FAQ> = [
	{q: "Apa saja tahapan untuk mendapatkan sertifikasi?", a: "Konsultasi awal → pengajuan dokumen → evaluasi & audit → perbaikan → keputusan sertifikasi → pemantauan berkala."},
	{q: "Berapa lama proses sertifikasi?", a: "Rata-rata 4–8 minggu tergantung kompleksitas produk & kelengkapan dokumen."},
	{q: "Apakah sertifikasi berlaku internasional?", a: "Standar kami selaras dengan praktik global dan didukung jaringan mitra internasional."},
] as const;
</script>
<template>
	<div>
		<!-- ===== FAQ ===== -->
		<section id="faq" class="py-24 bg-gradient-to-b from-white to-green-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center mb-12">
					<h2 class="text-4xl font-bold text-gray-900">FAQ</h2>
				</div>
				<div class="space-y-4">
					<details v-for="(f, i) in faqs" :key="i" class="group rounded-xl border border-gray-200 bg-white p-5 open:shadow-md transition">
						<summary class="flex cursor-pointer items-center justify-between list-none">
							<span class="font-medium text-gray-900">{{ f.q }}</span>
							<ChevronDown class="w-5 h-5 text-gray-500 transition group-open:rotate-180" />
						</summary>
						<p class="mt-3 text-gray-600">{{ f.a }}</p>
					</details>
				</div>
			</div>
		</section>
	</div>
</template>

<style></style>

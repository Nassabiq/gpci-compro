// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
								compatibilityDate: "2025-07-15",
								devtools: {enabled: true},
								css: ["~/assets/css/main.css"],
								vite: {
																plugins: [tailwindcss()],
								},

								runtimeConfig: {
																public: {
																								apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8080/api",
																},
								},

								modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/image", "@nuxt/content", "@vueuse/nuxt", "@pinia/nuxt", "nuxt-keen-slider"],
});

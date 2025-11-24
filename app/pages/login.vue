<script setup lang="ts">
import {ref, computed} from "vue";
import {useRouter, useRoute} from "vue-router";

definePageMeta({layout: "login"});

const router = useRouter();
const route = useRoute();
const email = ref("");
const password = ref("");
const remember = ref(false);
const error = ref("");

const {login, loading, lastError} = useAuth();
const submitting = computed(() => loading.value);

async function onSubmit() {
	error.value = "";
	try {
		await login(email.value.trim(), password.value);
		const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
		await router.push(redirect || "/admin");
	} catch {
		error.value = lastError.value ?? "Invalid email or password";
	}
}
</script>

<template>
	<section class="bg-gray-50 dark:bg-gray-900 w-full">
		<div class="mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
			<NuxtLink to="/" class="mb-6 flex flex-col gap-4 items-center text-2xl font-semibold text-gray-900 dark:text-white">
				<img class="mr-2 h-24 w-24" src="/img/gpci.png" alt="GPCI Logo" />
				GPCI CMS Portal
			</NuxtLink>

			<div class="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-lg md:mt-0 xl:p-0">
				<div class="space-y-6 p-6 sm:p-8 md:space-y-6">
					<div>
						<h1 class="text-xl font-bold text-center leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">Sign in to your account</h1>
					</div>

					<form class="space-y-4 md:space-y-6" @submit.prevent="onSubmit">
						<div>
							<label for="email" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Your email</label>
							<input id="email" v-model="email" type="email" autocomplete="email" required class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-emerald-600 focus:ring-emerald-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-400" placeholder="name@company.com" />
						</div>
						<div>
							<label for="password" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Password</label>
							<input id="password" v-model="password" type="password" autocomplete="current-password" required class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-emerald-600 focus:ring-emerald-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-400" placeholder="••••••••" />
						</div>
						<p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
							{{ error }}
						</p>

						<div class="flex items-center justify-between">
							<label class="flex items-center gap-2 text-sm">
								<input v-model="remember" id="remember" type="checkbox" class="h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-3 focus:ring-emerald-300 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-emerald-600 dark:ring-offset-gray-800" />
								<span class="text-gray-500 dark:text-gray-300">Remember me</span>
							</label>
							<NuxtLink to="#" class="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">Forgot password?</NuxtLink>
						</div>

						<button type="submit" :disabled="submitting" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
							<span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
							<span>Sign in</span>
						</button>

						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Don’t have an account yet?
							<NuxtLink to="#" class="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Sign up</NuxtLink>
						</p>
					</form>
				</div>
			</div>
		</div>
	</section>
</template>

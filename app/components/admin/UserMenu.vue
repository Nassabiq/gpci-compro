<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const auth = useAuth();

const open = ref(false);
const menu = ref<HTMLElement | null>(null);

const user = computed(() => auth.user.value);
const displayName = computed(() => {
	const name = user.value?.name?.trim();
	if (name) return name;
	return user.value?.email ?? "Account";
});
const displayEmail = computed(() => user.value?.email ?? "");
const initials = computed(() => {
	const source = (user.value?.name ?? user.value?.email ?? "").trim();
	if (!source) return "";
	const parts = source.split(/\s+/).filter(Boolean);
	const letters = parts.length >= 2 ? parts.slice(0, 2).map((p) => p[0]) : [source[0]];
	return letters.join("").toUpperCase();
});

function onOutside(e: MouseEvent) {
	if (!open.value) return;
	if (menu.value && !menu.value.contains(e.target as Node)) open.value = false;
}

function closeMenu() {
	open.value = false;
}

onMounted(() => document.addEventListener("pointerdown", onOutside));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onOutside));
</script>

<template>
	<div class="relative" ref="menu">
		<button
			type="button"
			class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-600"
			aria-haspopup="menu"
			:aria-expanded="open"
			@click="open = !open"
		>
			<span class="sr-only">Open user menu</span>
			<span v-if="initials" aria-hidden="true">{{ initials }}</span>
			<span v-else aria-hidden="true">
				<svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="7" r="4" />
					<path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
				</svg>
			</span>
		</button>

		<div
			v-show="open"
			class="absolute right-0 z-50 mt-2 w-60 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white text-base shadow-lg dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
			role="menu"
		>
			<div class="px-4 py-3">
				<p class="text-sm font-semibold text-gray-900 dark:text-white">
					{{ displayName }}
				</p>
				<p v-if="displayEmail" class="mt-1 truncate text-sm text-gray-600 dark:text-gray-300">
					{{ displayEmail }}
				</p>
			</div>
			<ul class="py-1">
				<li>
					<NuxtLink
						to="/admin"
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
						role="menuitem"
						@click="closeMenu"
					>
						Dashboard
					</NuxtLink>
				</li>
				<li>
					<NuxtLink
						to="/admin/profile"
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
						role="menuitem"
						@click="closeMenu"
					>
						My Profile
					</NuxtLink>
				</li>
				<li>
					<NuxtLink
						to="/logout"
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
						role="menuitem"
						@click="closeMenu"
					>
						Sign out
					</NuxtLink>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import PageHeader from "@/components/admin/PageHeader.vue";
import {User as UserIcon, KeyRound} from "lucide-vue-next";

definePageMeta({layout: "admin"});

const auth = useAuth();

await auth.hydrateFromCookie().catch(() => null);
if (!auth.user.value) {
	await auth.fetchMe().catch(() => null);
}

const profileName = ref("");
const profileEmail = ref("");

watch(
	() => auth.user.value,
	(value) => {
		if (!value) return;
		profileName.value = value.name ?? "";
		profileEmail.value = value.email;
	},
	{immediate: true}
);

const profileError = ref("");
const profileSuccess = ref("");
const savingProfile = ref(false);

const isProfileChanged = computed(() => {
	const baseName = auth.user.value?.name ?? "";
	const baseEmail = auth.user.value?.email ?? "";
	return profileName.value.trim() !== baseName || profileEmail.value.trim() !== baseEmail;
});

async function onSaveProfile() {
	profileError.value = "";
	profileSuccess.value = "";

	if (!profileName.value.trim()) {
		profileError.value = "Name is required.";
		return;
	}
	if (!profileEmail.value.trim()) {
		profileError.value = "Email is required.";
		return;
	}

	savingProfile.value = true;
	try {
		const updated = await auth.updateProfile({
			name: profileName.value.trim(),
			email: profileEmail.value.trim(),
		});
		profileName.value = updated.name ?? "";
		profileEmail.value = updated.email;
		profileSuccess.value = "Profile updated successfully.";
	} catch (err: any) {
		profileError.value = err?.message ?? "Failed to update profile.";
	} finally {
		savingProfile.value = false;
	}
}

const passwordMinLength = 8;
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const passwordSuccess = ref("");
const savingPassword = ref(false);

async function onChangePassword() {
	passwordError.value = "";
	passwordSuccess.value = "";

	if (!currentPassword.value) {
		passwordError.value = "Current password is required.";
		return;
	}
	if (newPassword.value.length < passwordMinLength) {
		passwordError.value = `New password must be at least ${passwordMinLength} characters.`;
		return;
	}
	if (newPassword.value !== confirmPassword.value) {
		passwordError.value = "New password and confirmation do not match.";
		return;
	}

	savingPassword.value = true;
	try {
		await auth.updatePassword({
			currentPassword: currentPassword.value,
			password: newPassword.value,
			confirmPassword: confirmPassword.value,
		});
		passwordSuccess.value = "Password updated successfully.";
		currentPassword.value = "";
		newPassword.value = "";
		confirmPassword.value = "";
	} catch (err: any) {
		passwordError.value = err?.message ?? "Failed to update password.";
	} finally {
		savingPassword.value = false;
	}
}
</script>

<template>
	<section>
		<PageHeader
			title="My Profile"
			description="Manage your personal details and keep your account secure."
			:breadcrumbs="[
				{label: 'Admin', to: '/admin'},
				{label: 'My Profile', current: true},
			]"
			:icon="UserIcon"
		/>

		<div class="grid gap-8 max-w-3xl">
			<form class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" @submit.prevent="onSaveProfile">
				<div class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
					<UserIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					<span>Profile Information</span>
				</div>
				<p class="mb-6 text-sm text-gray-600 dark:text-gray-300">Update your name and email address. These details are visible to administrators.</p>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<label for="profile-name" class="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
						<input
							id="profile-name"
							v-model="profileName"
							type="text"
							name="name"
							autocomplete="name"
							required
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
						/>
					</div>

					<div class="grid gap-2">
						<label for="profile-email" class="text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
						<input
							id="profile-email"
							v-model="profileEmail"
							type="email"
							name="email"
							autocomplete="email"
							required
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
						/>
					</div>
				</div>

				<p v-if="profileError" class="mt-4 text-sm text-red-600 dark:text-red-400">
					{{ profileError }}
				</p>
				<p v-else-if="profileSuccess" class="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
					{{ profileSuccess }}
				</p>

				<div class="mt-6 flex gap-2">
					<button
						type="submit"
						:disabled="savingProfile || !isProfileChanged"
						class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"
					>
						<span v-if="savingProfile" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
						<span>Save Changes</span>
					</button>
					<button
						type="button"
						:disabled="savingProfile"
						class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
						@click="
							profileName = auth.user.value?.name ?? '';
							profileEmail = auth.user.value?.email ?? '';
							profileError = '';
							profileSuccess = '';
						"
					>
						Reset
					</button>
				</div>
			</form>

			<form class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" @submit.prevent="onChangePassword">
				<div class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
					<KeyRound class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					<span>Update Password</span>
				</div>
				<p class="mb-6 text-sm text-gray-600 dark:text-gray-300">Choose a strong password to keep your account secure.</p>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<label for="current-password" class="text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
						<input
							id="current-password"
							v-model="currentPassword"
							type="password"
							name="current_password"
							autocomplete="current-password"
							required
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
						/>
					</div>

					<div class="grid gap-2">
						<label for="new-password" class="text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
						<input
							id="new-password"
							v-model="newPassword"
							type="password"
							name="new_password"
							autocomplete="new-password"
							required
							:minlength="passwordMinLength"
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
						/>
						<span class="text-xs text-gray-500 dark:text-gray-400">Minimum {{ passwordMinLength }} characters.</span>
					</div>

					<div class="grid gap-2">
						<label for="confirm-password" class="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
						<input
							id="confirm-password"
							v-model="confirmPassword"
							type="password"
							name="password_confirmation"
							autocomplete="new-password"
							required
							:minlength="passwordMinLength"
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
						/>
					</div>
				</div>

				<p v-if="passwordError" class="mt-4 text-sm text-red-600 dark:text-red-400">
					{{ passwordError }}
				</p>
				<p v-else-if="passwordSuccess" class="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
					{{ passwordSuccess }}
				</p>

				<div class="mt-6 flex">
					<button
						type="submit"
						:disabled="savingPassword"
						class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800"
					>
						<span v-if="savingPassword" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
						<span>Update Password</span>
					</button>
				</div>
			</form>
		</div>
	</section>
</template>
